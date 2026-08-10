import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const [freshUser] = await db.select().from(dbUsers).where(eq(dbUsers.id, user.id));
    if (!freshUser) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    return NextResponse.json({
      notifyEmail: freshUser.notifyEmail,
      notifySms: freshUser.notifySms,
      notifyPush: freshUser.notifyPush,
      showPhone: freshUser.showPhone,
      about: freshUser.about,
      age: freshUser.age,
      gender: freshUser.gender,
      donorId: freshUser.donorId,
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
    }

    const body = await req.json();
    const { notifyEmail, notifySms, notifyPush, showPhone, about, age, gender } = body;

    const updateFields: Record<string, any> = {};

    if (typeof notifyEmail === 'boolean') updateFields.notifyEmail = notifyEmail;
    if (typeof notifySms === 'boolean') updateFields.notifySms = notifySms;
    if (typeof notifyPush === 'boolean') updateFields.notifyPush = notifyPush;
    if (typeof showPhone === 'boolean') updateFields.showPhone = showPhone;
    if (typeof about === 'string') updateFields.about = about;
    if (typeof age === 'number') updateFields.age = age;
    if (typeof gender === 'string') updateFields.gender = gender;

    await db
      .update(dbUsers)
      .set(updateFields)
      .where(eq(dbUsers.id, user.id));

    const [updatedUser] = await db.select().from(dbUsers).where(eq(dbUsers.id, user.id));

    return NextResponse.json({
      message: 'Settings updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
