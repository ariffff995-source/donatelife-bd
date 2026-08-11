import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { notificationLogs as dbNotificationLogs } from '@/src/db/schema';
import { desc, eq, count } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthUserStrict(req);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required.' }, { status: 403 });
    }

    let logs: any[] = [];
    try {
      logs = await db
        .select()
        .from(dbNotificationLogs)
        .orderBy(desc(dbNotificationLogs.sentAt));
    } catch (dbErr) {
      console.warn('[Admin Notification Logs] Database error, returning empty logs:', dbErr);
    }

    const totalSent = logs.filter(l => l.status === 'sent').length;
    const failedCount = logs.filter(l => l.status === 'failed').length;
    const pendingCount = logs.filter(l => l.status === 'pending').length;

    return NextResponse.json({
      logs,
      stats: {
        total: logs.length,
        totalSent,
        failedCount,
        pendingCount,
      },
    });
  } catch (error) {
    console.error('Error fetching notification logs:', error);
    return NextResponse.json({
      logs: [],
      stats: { total: 0, totalSent: 0, failedCount: 0, pendingCount: 0 },
    }, { status: 200 });
  }
}
