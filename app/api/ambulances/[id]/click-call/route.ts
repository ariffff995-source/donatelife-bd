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
      .set({ totalCalls: sql`${dbAmbulances.totalCalls} + 1` })
      .where(eq(dbAmbulances.id, id));

    const results = await db.select().from(dbAmbulances).where(eq(dbAmbulances.id, id));
    return NextResponse.json({ success: true, totalCalls: results[0]?.totalCalls || 0 });
  } catch (error) {
    console.error('Click call track error:', error);
    return NextResponse.json({ error: 'Internal server error tracking call.' }, { status: 500 });
  }
}
