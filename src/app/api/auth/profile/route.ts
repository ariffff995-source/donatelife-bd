import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/src/lib/server-backend';

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      bloodGroup,
      division,
      district,
      upazila,
      lastDonationDate,
      isAvailable,
      facebookUrl,
      showFacebook,
      showPhone,
      avatarUrl,
      gender,
      address,
    } = body;

    await db
      .update(dbUsers)
      .set({
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bloodGroup && { bloodGroup }),
        ...(division && { division }),
        ...(district && { district }),
        ...(upazila && { upazila }),
        ...(lastDonationDate !== undefined && { lastDonationDate }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(showFacebook !== undefined && { showFacebook: Boolean(showFacebook) }),
        ...(showPhone !== undefined && { showPhone: Boolean(showPhone) }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(gender && { gender }),
        ...(address !== undefined && { address }),
      })
      .where(eq(dbUsers.id, user.id));

    const updatedResults = await db.select().from(dbUsers).where(eq(dbUsers.id, user.id));
    return NextResponse.json({ user: updatedResults[0] });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error updating profile.' }, { status: 500 });
  }
}
