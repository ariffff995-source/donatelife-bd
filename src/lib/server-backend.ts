import { NextRequest } from 'next/server';
import nodemailer from 'nodemailer';
import { eq, and, or, ilike, desc, not, ne, sql } from 'drizzle-orm';
import { db, ensureTablesCreated } from '../db/index';
import { seedDatabase } from '../db/seed';
import {
  users as dbUsers,
  requests as dbRequests,
  donations as dbDonations,
  notifications as dbNotifications,
  hospitals as dbHospitals,
  bloodBanks as dbBloodBanks,
  admins as dbAdmins,
  activityLogs as dbActivityLogs,
  blogs as dbBlogs,
  cmsContent as dbCmsContent,
  media as dbMedia,
  ambulances as dbAmbulances,
} from '../db/schema';

// Prevent re-seeding repeatedly across re-loads
let seedPromise: Promise<void> | null = null;
export async function ensureDbSeeded() {
  await ensureTablesCreated();
  if (!seedPromise) {
    seedPromise = seedDatabase().catch((err) => {
      console.error('Error during database seeding background task:', err);
      seedPromise = null;
    });
  }
  await seedPromise;
}

// In-memory OTP storage
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
  const url = new URL(req.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam) {
    return tokenParam;
  }
  return '';
}

// Authenticated Administrator Extraction
export async function getAuthAdmin(req: Request | NextRequest) {
  await ensureDbSeeded();
  const token = extractToken(req);
  if (!token) return null;

  if (token.startsWith('admin-token-')) {
    const username = token.replace('admin-token-', '');
    try {
      const results = await db
        .select()
        .from(dbAdmins)
        .where(eq(sql`LOWER(${dbAdmins.username})`, username.toLowerCase()));
      return results[0] || null;
    } catch (err) {
      console.error('Error fetching auth admin:', err);
      return null;
    }
  }

  // Also check if the user token belongs to a User with isAdmin === true or role === 'admin'
  try {
    const user = await getAuthUserStrict(req);
    if (user && (user.isAdmin || (user as any).role === 'admin')) {
      return {
        id: user.id,
        username: user.email,
        name: user.name,
        role: 'super-admin' as const,
        createdAt: user.createdAt
      };
    }
  } catch (err) {
    console.error('Error checking user admin status in getAuthAdmin:', err);
  }

  return null;
}

// Strict Authenticated User Extraction
export async function getAuthUserStrict(req: Request | NextRequest) {
  await ensureDbSeeded();
  const token = extractToken(req);
  if (!token || token === 'expired') return null;

  try {
    const results = await db
      .select()
      .from(dbUsers)
      .where(or(eq(dbUsers.id, token), eq(dbUsers.email, token)));
    return results[0] || null;
  } catch (err) {
    console.error('Error fetching strict user:', err);
    return null;
  }
}

// Authenticated User with Admin / Seed Fallback
export async function getAuthUser(req: Request | NextRequest) {
  await ensureDbSeeded();
  try {
    const matched = await getAuthUserStrict(req);
    if (matched) return matched;

    const allUsers = await db.select().from(dbUsers).limit(1);
    return allUsers[0] || null;
  } catch (err) {
    console.error('Error in getAuthUser fallback:', err);
    return null;
  }
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
