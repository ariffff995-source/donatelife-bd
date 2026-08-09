import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { ambulances as dbAmbulances } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db
      .update(dbAmbulances)
      .set({ totalWaClicks: sql`${dbAmbulances.totalWaClicks} + 1` })
      .where(eq(dbAmbulances.id, id));

    const results = await db.select().from(dbAmbulances).where(eq(dbAmbulances.id, id));
    return NextResponse.json({ success: true, totalWaClicks: results[0]?.totalWaClicks || 0 });
  } catch (error) {
    console.error('Click WA track error:', error);
    return NextResponse.json({ error: 'Internal server error tracking WhatsApp click.' }, { status: 500 });
  }
}
