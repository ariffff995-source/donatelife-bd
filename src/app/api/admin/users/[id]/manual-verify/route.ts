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
    const { isVerified, verificationNote } = body;

    const existing = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
    const userToVerify = existing[0];

    if (userToVerify) {
      const verifiedAt = isVerified ? new Date().toISOString() : null;
      const verifiedBy = isVerified ? admin.username : null;

      await db
        .update(dbUsers)
        .set({
          isVerified,
          verifiedAt,
          verifiedBy,
          verificationNote: verificationNote || null,
        })
        .where(eq(dbUsers.id, id));

      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const userNotif = isVerified
        ? {
            id: notifId,
            userId: id,
            title: 'Donor Profile Manually Verified! 🎖️',
            message: `Congratulations! Your donor profile has been manually verified by Admin (${admin.name}). A green 'Verified' badge is now displayed.`,
            isRead: false,
            type: 'system',
            relatedId: 'system',
            createdAt: new Date(),
          }
        : {
            id: notifId,
            userId: id,
            title: 'Verification Revoked',
            message: 'Your manual verification badge has been unverified or modified by Admin.',
            isRead: false,
            type: 'system',
            relatedId: 'system',
            createdAt: new Date(),
          };

      await db.insert(dbNotifications).values(userNotif).catch(() => {});

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: isVerified ? 'Manual Donor Verified' : 'Manual Donor Unverified',
        details: `${isVerified ? 'Verified' : 'Unverified'} donor "${userToVerify.name}" (ID: ${id}).${verificationNote ? ` Note: ${verificationNote}` : ''}`,
      });

      const updated = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
      return NextResponse.json({ success: true, user: updated[0] });
    }

    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  } catch (error) {
    console.error('Manual verify donor error:', error);
    return NextResponse.json({ error: 'Internal server error processing manual verification.' }, { status: 500 });
  }
}
