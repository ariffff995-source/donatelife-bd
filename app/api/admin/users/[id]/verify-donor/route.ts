import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  notifications as dbNotifications,
  activityLogs as dbActivityLogs,
} from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { approve } = body;

    const existing = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
    const userToVerify = existing[0];

    if (userToVerify) {
      const isDonorVerified = Boolean(approve);
      const verificationStatus = approve ? 'approved' : 'rejected';

      await db
        .update(dbUsers)
        .set({ isDonorVerified, verificationStatus })
        .where(eq(dbUsers.id, id));

      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const userNotif = approve
        ? {
            id: notifId,
            userId: id,
            title: 'Medical Donor Badge Approved! 🎖️',
            message: "Congratulations! Your profile has been officially verified by our medical panel. A 'Verified Donor' badge is now displayed next to your name.",
            isRead: false,
            type: 'system',
            relatedId: 'system',
            createdAt: new Date(),
          }
        : {
            id: notifId,
            userId: id,
            title: 'Verification Attempt Notice',
            message: 'Your submitted medical verification document was rejected. Please upload a clear photo of your Blood Card or medical report.',
            isRead: false,
            type: 'system',
            relatedId: 'system',
            createdAt: new Date(),
          };

      await db.insert(dbNotifications).values(userNotif);

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: approve ? 'Approved Verification' : 'Rejected Verification',
        details: `${approve ? 'Approved' : 'Rejected'} medical verification request for donor "${userToVerify.name}" (ID: ${id}).`,
      });

      const updated = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
      return NextResponse.json({ success: true, user: updated[0] });
    }

    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  } catch (error) {
    console.error('Verify donor error:', error);
    return NextResponse.json({ error: 'Internal server error processing donor badge.' }, { status: 500 });
  }
}
