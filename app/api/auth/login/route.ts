import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const { email, password } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    let matchedUsers = await db
      .select()
      .from(dbUsers)
      .where(eq(sql`LOWER(${dbUsers.email})`, email.toLowerCase()));

    let matchedUser = matchedUsers[0];

    if (!matchedUser) {
      const userId = 'user-' + Math.floor(100000 + Math.random() * 900000);
      matchedUser = {
        id: userId,
        name: email.split('@')[0].toUpperCase(),
        email: email.toLowerCase(),
        phone: '01700000000',
        bloodGroup: 'A+',
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Dhanmondi',
        policeStation: null,
        lastDonationDate: null,
        isAvailable: true,
        isAdmin: email === 'ariffff995@gmail.com',
        avatarUrl: null,
        isEmailVerified: false,
        isPhoneVerified: false,
        isDonorVerified: false,
        verificationStatus: 'none',
        verificationDocument: null,
        facebookUrl: null,
        showFacebook: true,
        password: password || null,
        gender: 'male',
        address: null,
        isVerified: false,
        verifiedAt: null,
        verifiedBy: null,
        verificationNote: null,
        createdAt: new Date(),
        favoriteAmbulances: [],
      };

      await db.insert(dbUsers).values(matchedUser);
    }

    return NextResponse.json({
      token: matchedUser.id,
      refreshToken: 'refresh-' + matchedUser.id,
      user: matchedUser,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during authentication.' }, { status: 500 });
  }
}
