import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ensureDbSeeded, otps } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const { email, code } = body;
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const storedCode = otps.get(email.toLowerCase());
    if (!storedCode || storedCode !== code) {
      return NextResponse.json({ error: 'Invalid or expired verification code.' }, { status: 400 });
    }

    const usersFound = await db
      .select()
      .from(dbUsers)
      .where(eq(sql`LOWER(${dbUsers.email})`, email.toLowerCase()));

    const user = usersFound[0];

    if (user) {
      await db
        .update(dbUsers)
        .set({ isEmailVerified: true, isPhoneVerified: true })
        .where(eq(dbUsers.id, user.id));

      user.isEmailVerified = true;
      user.isPhoneVerified = true;
      otps.delete(email.toLowerCase());
      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error verifying OTP.' }, { status: 500 });
  }
}
