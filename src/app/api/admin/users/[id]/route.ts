import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  donations as dbDonations,
  notifications as dbNotifications,
  requests as dbRequests,
  activityLogs as dbActivityLogs,
} from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
    const userToEdit = existing[0];

    if (!userToEdit) {
      return NextResponse.json({ error: 'Donor record not found.' }, { status: 404 });
    }

    const body = await req.json();
    delete body.donorId;
    delete body.id;

    await db
      .update(dbUsers)
      .set(body)
      .where(eq(dbUsers.id, id));

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Updated Donor Details',
      details: `Modified profile for donor "${userToEdit.name}" (ID: ${id}).`,
    });

    const updated = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Admin user edit error:', error);
    return NextResponse.json({ error: 'Internal server error updating donor record.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }
    if (admin.role !== 'super-admin') {
      return NextResponse.json({ error: 'Super Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
    const deletedUser = existing[0];

    if (deletedUser) {
      await db.delete(dbDonations).where(eq(dbDonations.userId, id));
      await db.delete(dbNotifications).where(eq(dbNotifications.userId, id));
      await db.delete(dbRequests).where(eq(dbRequests.userId, id));
      await db.delete(dbUsers).where(eq(dbUsers.id, id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Deleted User Profile',
        details: `Permanently deleted user account "${deletedUser.name}" (Email: ${deletedUser.email}, ID: ${id}).`,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error removing donor profile.' }, { status: 500 });
  }
}
