import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { notifications as dbNotifications } from '@/src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const results = await db
      .select()
      .from(dbNotifications)
      .where(eq(dbNotifications.userId, user.id))
      .orderBy(desc(dbNotifications.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Internal server error fetching notifications.' }, { status: 500 });
  }
}
