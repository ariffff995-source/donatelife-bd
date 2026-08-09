import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { activityLogs as dbActivityLogs } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }
    const logs = await db
      .select()
      .from(dbActivityLogs)
      .orderBy(desc(dbActivityLogs.timestamp));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Admin logs error:', error);
    return NextResponse.json({ error: 'Internal server error fetching activity logs.' }, { status: 500 });
  }
}
