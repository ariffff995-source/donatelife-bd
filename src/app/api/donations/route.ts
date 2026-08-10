import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { donations as dbDonations } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthUserStrict, ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const results = await db
      .select()
      .from(dbDonations)
      .where(eq(dbDonations.userId, user.id))
      .orderBy(desc(dbDonations.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Fetch donations error:', error);
    return NextResponse.json({ error: 'Internal server error fetching donation history.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientName, bloodGroup, donationDate, hospitalName, notes } = body;
    if (!recipientName || !donationDate || !hospitalName) {
      return NextResponse.json(
        { error: 'Recipient name, donation date and hospital name are mandatory.' },
        { status: 400 }
      );
    }

    const id = 'don-' + Math.floor(100000 + Math.random() * 900000);
    const newDonation = {
      id,
      userId: user.id,
      recipientName,
      bloodGroup: bloodGroup || user.bloodGroup,
      donationDate,
      hospitalName,
      notes: notes || null,
      createdAt: new Date(),
    };

    await db.insert(dbDonations).values(newDonation);
    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error('Record donation error:', error);
    return NextResponse.json({ error: 'Internal server error recording donation.' }, { status: 500 });
  }
}
