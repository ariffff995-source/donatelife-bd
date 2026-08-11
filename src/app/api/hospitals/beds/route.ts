import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { hospitals as dbHospitals } from '@/src/db/schema';
import { getAuthAdmin } from '@/src/lib/server-backend';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin permissions required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      hospitalId,
      icuBedsTotal,
      icuBedsAvailable,
      generalBedsTotal,
      generalBedsAvailable,
      emergencyBedsTotal,
      emergencyBedsAvailable
    } = body;

    if (!hospitalId) {
      return NextResponse.json({ error: 'hospitalId is required' }, { status: 400 });
    }

    await db
      .update(dbHospitals)
      .set({
        icuBedsTotal: Number(icuBedsTotal),
        icuBedsAvailable: Number(icuBedsAvailable),
        generalBedsTotal: Number(generalBedsTotal),
        generalBedsAvailable: Number(generalBedsAvailable),
        emergencyBedsTotal: Number(emergencyBedsTotal),
        emergencyBedsAvailable: Number(emergencyBedsAvailable),
        bedAvailabilityLastUpdated: new Date()
      })
      .where(eq(dbHospitals.id, hospitalId));

    return NextResponse.json({ success: true, message: 'Hospital bed availability updated.' });
  } catch (error) {
    console.error('Error updating hospital beds:', error);
    return NextResponse.json({ error: 'Failed to update hospital beds' }, { status: 500 });
  }
}
