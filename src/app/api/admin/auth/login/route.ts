export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { admins as dbAdmins, users as dbUsers, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq, or, sql } from 'drizzle-orm';
import { ensureDbSeeded, verifyPassword, signToken } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded().catch(() => {});
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();
    let authenticatedAdmin: any = null;

    // 1. Try querying dbAdmins table
    try {
      const adminRows = await db
        .select()
        .from(dbAdmins)
        .where(sql`LOWER(${dbAdmins.username}) = ${cleanUsername}`);

      for (const row of adminRows) {
        if (verifyPassword(password, row.passwordHash)) {
          authenticatedAdmin = {
            id: row.id,
            username: row.username,
            name: row.name,
            role: row.role,
            createdAt: row.createdAt,
          };
          break;
        }
      }
    } catch (e) {
      console.warn('dbAdmins query skipped or failed:', e);
    }

    // 2. If not found in dbAdmins, check dbUsers table for users with isAdmin = true
    if (!authenticatedAdmin) {
      try {
        const userRows = await db
          .select()
          .from(dbUsers)
          .where(
            or(
              sql`LOWER(${dbUsers.email}) = ${cleanUsername}`,
              sql`LOWER(${dbUsers.donorId}) = ${cleanUsername}`,
              sql`LOWER(${dbUsers.name}) = ${cleanUsername}`
            )
          );

        for (const user of userRows) {
          if (user.isAdmin && user.password && verifyPassword(password, user.password)) {
            authenticatedAdmin = {
              id: user.id,
              username: user.email || user.donorId || user.name,
              name: user.name,
              role: 'admin',
              createdAt: user.createdAt,
            };
            break;
          }
        }
      } catch (e) {
        console.warn('dbUsers query skipped or failed:', e);
      }
    }

    // 3. System Fallback Credentials for local development & admin emergency recovery
    if (!authenticatedAdmin) {
      const fallbackAdmins = [
        { username: 'superadmin', password: 'adminpassword123', name: 'Super Administrator', role: 'super-admin' },
        { username: 'ariful123', password: 'adminpassword123', name: 'Ariful Islam (Admin)', role: 'super-admin' },
        { username: 'ariful123', password: 'password123', name: 'Ariful Islam (Admin)', role: 'super-admin' },
        { username: 'admin', password: 'adminpassword123', name: 'System Administrator', role: 'admin' },
      ];

      const matchedFallback = fallbackAdmins.find(
        (f) => f.username.toLowerCase() === cleanUsername && f.password === password
      );

      if (matchedFallback) {
        authenticatedAdmin = {
          id: `admin-${matchedFallback.username}`,
          username: matchedFallback.username,
          name: matchedFallback.name,
          role: matchedFallback.role,
          createdAt: new Date(),
        };
      }
    }

    // If credentials do not match any system or fallback account, return 401 Invalid Credentials
    if (!authenticatedAdmin) {
      return NextResponse.json({ error: 'Invalid administrative credentials.' }, { status: 401 });
    }

    // Safely record audit activity log (non-blocking)
    try {
      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: authenticatedAdmin.username,
        adminRole: authenticatedAdmin.role,
        action: 'Admin Login',
        details: `Administrator ${authenticatedAdmin.name} (${authenticatedAdmin.role}) successfully authenticated.`,
      });
    } catch (e) {
      // Ignore logging failures so auth is never blocked
    }

    const token = signToken({
      id: authenticatedAdmin.id,
      username: authenticatedAdmin.username,
      role: authenticatedAdmin.role,
      isAdmin: true,
    });

    const res = NextResponse.json({
      token,
      admin: authenticatedAdmin,
    });

    res.headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    res.headers.append('Set-Cookie', `donatelife_admin_token=${token}; Path=/; SameSite=Lax; Max-Age=86400`);
    return res;
  } catch (error: any) {
    console.error('[ADMIN LOGIN ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error during administrator login.', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
