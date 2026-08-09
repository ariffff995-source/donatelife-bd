export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { admins as dbAdmins, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const results = await db
      .select()
      .from(dbAdmins)
      .where(
        and(
          eq(sql`LOWER(${dbAdmins.username})`, username.toLowerCase()),
          eq(dbAdmins.passwordHash, password)
        )
      );

    const admin = results[0];
    if (!admin) {
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Admin Login',
      details: `Administrator ${admin.name} (${admin.role}) successfully authenticated.`,
    });

    return NextResponse.json({
      token: `admin-token-${admin.username}`,
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error during administrator login.' }, { status: 500 });
  }
}
