import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { notifications as dbNotifications } from '@/src/db/schema';
import { eq, and } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    await db
      .update(dbNotifications)
      .set({ isRead: true })
      .where(and(eq(dbNotifications.id, id), eq(dbNotifications.userId, user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Internal server error marking notification as read.' }, { status: 500 });
  }
}
