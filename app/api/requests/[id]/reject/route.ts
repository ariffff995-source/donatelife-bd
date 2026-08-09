import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  requests as dbRequests,
  notifications as dbNotifications,
} from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUserStrict, broadcastSse } from '@/src/lib/server-backend';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthUserStrict(req);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Administrative privileges are mandatory.' }, { status: 403 });
    }
    const { id } = await params;

    const campaigns = await db.select().from(dbRequests).where(eq(dbRequests.id, id));
    const rejectedReq = campaigns[0];

    if (!rejectedReq) {
      return NextResponse.json({ error: 'Requested blood campaign not found.' }, { status: 404 });
    }

    await db
      .update(dbRequests)
      .set({ status: 'rejected' })
      .where(eq(dbRequests.id, id));

    rejectedReq.status = 'rejected';

    if (rejectedReq.userId !== 'guest-user') {
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const authorNotif = {
        id: notifId,
        userId: rejectedReq.userId,
        title: 'Blood Request Rejected',
        message: `Your emergency request for ${rejectedReq.patientName} was declined during medical validation.`,
        isRead: false,
        type: 'system',
        relatedId: id,
        createdAt: new Date(),
      };

      await db.insert(dbNotifications).values(authorNotif);
      broadcastSse(rejectedReq.userId, authorNotif);
    }

    return NextResponse.json(rejectedReq);
  } catch (error) {
    console.error('Reject request error:', error);
    return NextResponse.json({ error: 'Internal server error rejecting request.' }, { status: 500 });
  }
}
