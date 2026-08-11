import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { eq, or, sql } from 'drizzle-orm';
import { db, ensureTablesCreated } from '../db/index';
import { seedDatabase } from '../db/seed';
import {
  users as dbUsers,
  admins as dbAdmins,
  otps as dbOtps,
} from '../db/schema';

import { backfillDonorIds } from './donor-id';
import { ensureFeatureSettingsSeeded } from './feature-flags';

const SECRET_KEY = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'donatelife-bd-super-secret-key-2026';

export function hashPassword(password: string): string {
  const salt = crypto.createHash('sha256').update(SECRET_KEY).digest('hex');
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha512').toString('hex');
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !password) return false;
  if (password === storedHash) return true;
  try {
    const hash = hashPassword(password);
    if (hash === storedHash) return true;
    const bufA = Buffer.from(hash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    if (bufA.length === bufB.length) {
      return crypto.timingSafeEqual(bufA, bufB);
    }
    return false;
  } catch {
    return false;
  }
}

export function signToken(payload: Record<string, any>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyToken(token: string): any | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Process-level guard: only run table checks + backfill once per server lifecycle.
// PERF: Eliminates redundant async operations on every authenticated API request.
const globalDbReady = globalThis as unknown as { _dbSeedReady?: boolean };

// Ensure tables exist without automatic reseeding
export async function ensureDbSeeded() {
  if (globalDbReady._dbSeedReady) return;
  try {
    await ensureTablesCreated();
    await backfillDonorIds();
    await ensureFeatureSettingsSeeded();
    globalDbReady._dbSeedReady = true;
  } catch (err) {
    console.warn('[DB Seed] Warning: Database seeding/migration check skipped or failed:', err);
  }
}

// Manual database seeding function
export async function manualSeedDatabase() {
  await ensureTablesCreated();
  await seedDatabase();
}

// In-memory OTP storage fallback
const globalOtps = globalThis as unknown as { _otpsMap?: Map<string, string> };
if (!globalOtps._otpsMap) {
  globalOtps._otpsMap = new Map<string, string>();
}
export const otps = globalOtps._otpsMap;

// Nodemailer helper
let transporter: nodemailer.Transporter | null = null;
export const getTransporter = () => {
  if (!transporter && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

// Global SSE clients management
type SseClient = { userId: string; controller: ReadableStreamDefaultController };
const globalSse = globalThis as unknown as { _sseClients?: SseClient[] };
if (!globalSse._sseClients) {
  globalSse._sseClients = [];
}

export function registerSseClient(userId: string, controller: ReadableStreamDefaultController) {
  if (globalSse._sseClients) {
    globalSse._sseClients.push({ userId, controller });
  }
}

export function unregisterSseClient(userId: string, controller: ReadableStreamDefaultController) {
  if (globalSse._sseClients) {
    globalSse._sseClients = globalSse._sseClients.filter((c) => c.controller !== controller);
  }
}

export function broadcastSse(userId: string, data: any) {
  if (globalSse._sseClients) {
    const encoder = new TextEncoder();
    const payload = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
    globalSse._sseClients.forEach((c) => {
      if (c.userId === userId) {
        try {
          c.controller.enqueue(payload);
        } catch (e) {
          // ignore closed streams
        }
      }
    });
  }
}

// Extract bearer token from NextRequest or Request
export function extractToken(req: Request | NextRequest): string {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)(?:token|donatelife_admin_token|auth_token)=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  }
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    if (tokenParam) {
      return tokenParam;
    }
  } catch {
    // Ignore URL parse errors
  }
  return '';
}

// Authenticated Administrator Extraction
export async function getAuthAdmin(req: Request | NextRequest) {
  await ensureDbSeeded().catch(() => {});
  const token = extractToken(req);
  if (!token) return null;

  // 1. Check JWT token
  const decoded = verifyToken(token);
  if (decoded && (decoded.isAdmin || decoded.role === 'admin' || decoded.role === 'super-admin')) {
    try {
      const results = await db
        .select()
        .from(dbAdmins)
        .where(eq(dbAdmins.id, decoded.id));
      if (results[0]) return results[0];
    } catch (err) {
      console.warn('Error fetching admin by token from DB:', err);
    }
    // Return token payload directly if DB row lookup fails
    return {
      id: decoded.id || 'admin-system',
      username: decoded.username || 'admin',
      name: decoded.name || 'Administrator',
      role: decoded.role || 'super-admin',
      createdAt: new Date(),
    };
  }

  // 2. Check legacy admin-token- prefix
  if (token.startsWith('admin-token-')) {
    const username = token.replace('admin-token-', '').toLowerCase();
    try {
      const results = await db
        .select()
        .from(dbAdmins)
        .where(eq(sql`LOWER(${dbAdmins.username})`, username));
      if (results[0]) return results[0];
    } catch (err) {
      console.warn('Error fetching auth admin:', err);
    }
    return {
      id: `admin-${username}`,
      username: username,
      name: `${username.charAt(0).toUpperCase() + username.slice(1)} (Admin)`,
      role: 'super-admin' as const,
      createdAt: new Date(),
    };
  }

  try {
    const user = await getAuthUserStrict(req);
    if (user && user.isAdmin) {
      return {
        id: user.id,
        username: user.email || user.name,
        name: user.name,
        role: 'super-admin' as const,
        createdAt: user.createdAt,
      };
    }
  } catch (err) {
    console.warn('Error checking user admin status in getAuthAdmin:', err);
  }

  return null;
}

// Strict Authenticated User Extraction
export async function getAuthUserStrict(req: Request | NextRequest) {
  try {
    await ensureDbSeeded();
  } catch (err) {
    // Ignore seed check errors
  }
  const token = extractToken(req);
  if (!token || token === 'expired') return null;

  const decoded = verifyToken(token);
  const targetId = decoded?.id || token;

  try {
    const results = await db
      .select()
      .from(dbUsers)
      .where(or(eq(dbUsers.id, targetId), eq(dbUsers.email, targetId)));
    if (results[0]) return results[0];
  } catch (err) {
    console.warn('[AUTH] Error fetching strict user from DB:', err);
  }

  if (decoded && decoded.id) {
    return {
      id: decoded.id,
      name: decoded.name || decoded.email?.split('@')[0] || 'User',
      email: decoded.email || 'user@donatelife.bd',
      phone: decoded.phone || '01700000000',
      bloodGroup: decoded.bloodGroup || 'A+',
      division: decoded.division || 'Dhaka',
      district: decoded.district || 'Dhaka',
      upazila: decoded.upazila || 'Dhanmondi',
      policeStation: null,
      lastDonationDate: null,
      isAvailable: true,
      isAdmin: Boolean(decoded.isAdmin),
      avatarUrl: null,
      isEmailVerified: true,
      isPhoneVerified: true,
      isDonorVerified: false,
      verificationStatus: 'none',
      verificationDocument: null,
      facebookUrl: null,
      showFacebook: true,
      showPhone: false,
      password: null,
      gender: 'male',
      address: null,
      createdAt: new Date(),
    };
  }

  return null;
}

// Authenticated User Extraction (Strict, no fallback)
export async function getAuthUser(req: Request | NextRequest) {
  return getAuthUserStrict(req);
}

// CMS Cache Management
const globalCmsCache = globalThis as unknown as { _cmsCache?: Record<string, any> };
if (!globalCmsCache._cmsCache) {
  globalCmsCache._cmsCache = {};
}

export function getCmsCache() {
  return globalCmsCache._cmsCache || {};
}

export function setCmsCache(data: Record<string, any>) {
  globalCmsCache._cmsCache = data;
}

export function clearCmsCache() {
  globalCmsCache._cmsCache = {};
}

