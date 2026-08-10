import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, otps as dbOtps } from '@/src/db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { ensureDbSeeded, otps as memoryOtps } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const { email, code } = body;
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let isValid = false;

    // Check DB table first
    try {
      const records = await db
        .select()
        .from(dbOtps)
        .where(
          and(
            eq(dbOtps.email, normalizedEmail),
            eq(dbOtps.code, code.trim()),
            gt(dbOtps.expiresAt, new Date())
          )
        );
      if (records.length > 0) {
        isValid = true;
        await db.delete(dbOtps).where(eq(dbOtps.email, normalizedEmail));
      }
    } catch (dbErr) {
      console.warn('Database OTP verification error:', dbErr);
    }

    // Fallback to memory map if DB check did not pass
    if (!isValid) {
      const storedCode = memoryOtps.get(normalizedEmail);
      if (storedCode && storedCode === code.trim()) {
        isValid = true;
        memoryOtps.delete(normalizedEmail);
      }
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    const usersFound = await db
      .select()
      .from(dbUsers)
      .where(eq(sql`LOWER(${dbUsers.email})`, normalizedEmail));

    const user = usersFound[0];

    if (user) {
      await db
        .update(dbUsers)
        .set({ isEmailVerified: true, isPhoneVerified: true })
        .where(eq(dbUsers.id, user.id));

      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      delete user.password;
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error verifying OTP.' }, { status: 500 });
  }
}

