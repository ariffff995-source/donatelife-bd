import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { requests as dbRequests, activityLogs as dbActivityLogs } from '@/src/db/schema';
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
    const existing = await db.select().from(dbRequests).where(eq(dbRequests.id, id));
    const requestToEdit = existing[0];

    if (!requestToEdit) {
      return NextResponse.json({ error: 'Blood request not found.' }, { status: 404 });
    }

    const body = await req.json();
    await db
      .update(dbRequests)
      .set(body)
      .where(eq(dbRequests.id, id));

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Updated Blood Request',
      details: `Modified blood campaign details for patient "${requestToEdit.patientName}" (ID: ${id}).`,
    });

    const updated = await db.select().from(dbRequests).where(eq(dbRequests.id, id));
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Admin edit request error:', error);
    return NextResponse.json({ error: 'Internal server error updating blood request.' }, { status: 500 });
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
    const existing = await db.select().from(dbRequests).where(eq(dbRequests.id, id));
    const deletedRequest = existing[0];

    if (deletedRequest) {
      await db.delete(dbRequests).where(eq(dbRequests.id, id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Deleted Blood Request',
        details: `Permanently deleted blood campaign for patient "${deletedRequest.patientName}" (ID: ${id}).`,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Blood request not found.' }, { status: 404 });
  } catch (error) {
    console.error('Admin delete request error:', error);
    return NextResponse.json({ error: 'Internal server error deleting blood request.' }, { status: 500 });
  }
}
