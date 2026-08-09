import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const {
      name,
      email,
      phone,
      bloodGroup,
      division,
      district,
      upazila,
      password,
      facebookUrl,
      showFacebook,
      avatarUrl,
      gender,
      address,
    } = body;

    if (!name || !email || !phone || !bloodGroup) {
      return NextResponse.json({ error: 'Missing required profile fields.' }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(dbUsers)
      .where(eq(dbUsers.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email address is already registered.' }, { status: 400 });
    }

    const userId = 'user-' + Math.floor(100000 + Math.random() * 900000);
    const newUser = {
      id: userId,
      name,
      email,
      phone,
      bloodGroup,
      division: division || 'Dhaka',
      district: district || 'Dhaka',
      upazila: upazila || 'Dhanmondi',
      lastDonationDate: null,
      isAvailable: true,
      isAdmin: false,
      avatarUrl: avatarUrl || null,
      isEmailVerified: false,
      isPhoneVerified: false,
      isDonorVerified: false,
      verificationStatus: 'none',
      verificationDocument: null,
      facebookUrl: facebookUrl || null,
      showFacebook: showFacebook !== undefined ? Boolean(showFacebook) : true,
      password: password || null,
      gender: gender || 'male',
      address: address || null,
      createdAt: new Date(),
    };

    await db.insert(dbUsers).values(newUser);

    return NextResponse.json(
      {
        token: newUser.id,
        refreshToken: 'refresh-' + newUser.id,
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error during user registration.' }, { status: 500 });
  }
}
