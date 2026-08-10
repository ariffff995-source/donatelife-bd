import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserStrict } from '@/src/lib/server-backend';
import { retryFailedNotifications } from '@/src/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthUserStrict(req);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required.' }, { status: 403 });
    }

    const result = await retryFailedNotifications();
    return NextResponse.json({
      message: `Retried ${result.totalRetried} failed notification(s). ${result.successful} succeeded.`,
      result,
    });
  } catch (error) {
    console.error('Error retrying failed notifications:', error);
    return NextResponse.json({ error: 'Failed to retry notification queue.' }, { status: 500 });
  }
}
