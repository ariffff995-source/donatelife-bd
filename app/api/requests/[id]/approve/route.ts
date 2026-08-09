import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  requests as dbRequests,
  users as dbUsers,
  notifications as dbNotifications,
} from '@/src/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getAuthUserStrict, broadcastSse } from '@/src/lib/server-backend';

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

    const matchingDonors = await db
      .select()
      .from(dbUsers)
      .where(
        and(
          eq(dbUsers.bloodGroup, approvedReq.bloodGroup),
          eq(dbUsers.isAvailable, true),
          ne(dbUsers.id, approvedReq.userId)
        )
      );

    for (const donor of matchingDonors) {
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const donorNotif = {
        id: notifId,
        userId: donor.id,
        title: 'Emergency Match Alert!',
        message: `Urgent! A patient needs ${approvedReq.unitsNeeded} units of ${approvedReq.bloodGroup} blood at ${approvedReq.hospitalName}, ${approvedReq.upazila}.`,
        isRead: false,
        type: 'request_match',
        relatedId: id,
        createdAt: new Date(),
      };

      await db.insert(dbNotifications).values(donorNotif);
      broadcastSse(donor.id, donorNotif);
    }

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
