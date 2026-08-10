import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  requests as dbRequests,
  users as dbUsers,
  notifications as dbNotifications,
} from '@/src/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getAuthUserStrict, broadcastSse } from '@/src/lib/server-backend';
import { dispatchNotificationsForRequest } from '@/src/lib/notifications';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthUserStrict(req);
    if (!admin || !admin.isAdmin) {
      return NextResponse.json({ error: 'Administrative privileges are mandatory for approval.' }, { status: 403 });
    }
    const { id } = await params;

    const campaigns = await db.select().from(dbRequests).where(eq(dbRequests.id, id));
    const approvedReq = campaigns[0];

    if (!approvedReq) {
      return NextResponse.json({ error: 'Requested blood campaign not found.' }, { status: 404 });
    }

    await db
      .update(dbRequests)
      .set({ status: 'pending' })
      .where(eq(dbRequests.id, id));

    approvedReq.status = 'pending';

    // Dispatch In-App, Email, and Future Notifications with strict deduplication
    await dispatchNotificationsForRequest({
      id: approvedReq.id,
      patientName: approvedReq.patientName,
      bloodGroup: approvedReq.bloodGroup,
      unitsNeeded: approvedReq.unitsNeeded,
      hospitalName: approvedReq.hospitalName,
      division: approvedReq.division,
      district: approvedReq.district,
      upazila: approvedReq.upazila,
      contactPhone: approvedReq.contactPhone,
      reason: approvedReq.reason,
      requiredDate: approvedReq.requiredDate,
    });

    if (approvedReq.userId !== 'guest-user') {
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const authorNotif = {
        id: notifId,
        userId: approvedReq.userId,
        title: 'Blood Request Approved',
        message: `Your request for ${approvedReq.patientName} was approved. Eligible matching donors are being notified.`,
        isRead: false,
        type: 'system',
        relatedId: id,
        createdAt: new Date(),
      };

      await db.insert(dbNotifications).values(authorNotif);
      broadcastSse(approvedReq.userId, authorNotif);
    }

    return NextResponse.json(approvedReq);
  } catch (error) {
    console.error('Approve request error:', error);
    return NextResponse.json({ error: 'Internal server error approving request.' }, { status: 500 });
  }
}
