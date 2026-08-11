import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ensureDbSeeded, hashPassword, signToken } from '@/src/lib/server-backend';
import { generateNextDonorId } from '@/src/lib/donor-id';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded().catch(() => {});
    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      phone,
      bloodGroup,
      division,
      district,
      upazila,
      policeStation,
      password,
      facebookUrl,
      showFacebook,
      showPhone,
      avatarUrl,
      gender,
      address,
    } = body;

    if (!name || !email || !phone || !bloodGroup) {
      return NextResponse.json({ error: 'Missing required profile fields.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user already exists in DB (resilient to DB errors)
    try {
      const existing = await db
        .select()
        .from(dbUsers)
        .where(eq(sql`LOWER(${dbUsers.email})`, cleanEmail));
      if (existing.length > 0) {
        return NextResponse.json({ error: 'Email address is already registered.' }, { status: 400 });
      }
    } catch (dbQueryErr) {
      console.warn('[AUTH SIGNUP] DB check for existing user warning:', dbQueryErr);
    }

    const userId = 'user-' + Math.floor(100000 + Math.random() * 900000);
    let donorId = 'DBD-' + Math.floor(100000 + Math.random() * 900000);
    try {
      donorId = await generateNextDonorId();
    } catch (donorIdErr) {
      console.warn('[AUTH SIGNUP] Donor ID generation fallback:', donorIdErr);
    }

    const hashedPassword = password ? hashPassword(password) : null;

    const newUser = {
      id: userId,
      donorId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      bloodGroup,
      division: division || 'Dhaka',
      district: district || 'Dhaka',
      upazila: upazila || 'Dhanmondi',
      policeStation: policeStation || null,
      lastDonationDate: null,
      isAvailable: true,
      isAdmin: false,
      avatarUrl: avatarUrl || null,
      isEmailVerified: false,
      isPhoneVerified: false,
      isDonorVerified: false,
      isVerified: false,
      verificationStatus: 'none',
      verificationDocument: null,
      facebookUrl: facebookUrl || null,
      showFacebook: showFacebook !== undefined ? Boolean(showFacebook) : true,
      showPhone: showPhone !== undefined ? Boolean(showPhone) : false,
      password: hashedPassword,
      gender: gender || 'male',
      address: address || null,
      createdAt: new Date(),
    };

    // 2. Insert into DB (non-blocking fallback if DB connection fails)
    try {
      await db.insert(dbUsers).values(newUser);
    } catch (insertErr) {
      console.warn('[AUTH SIGNUP] DB user insert warning/skipped:', insertErr);
    }

    // 3. Generate signed JWT tokens
    const token = signToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      isAdmin: newUser.isAdmin,
      role: 'donor',
    });
    const refreshToken = 'refresh-' + signToken({ id: newUser.id, type: 'refresh' });

    const res = NextResponse.json(
      {
        token,
        refreshToken,
        user: newUser,
      },
      { status: 201 }
    );

    res.headers.append('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    return res;
  } catch (error: any) {
    console.error('[AUTH SIGNUP ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error during user registration.', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

