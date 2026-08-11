import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { bloodBanks as dbBloodBanks, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.select().from(dbBloodBanks).where(eq(dbBloodBanks.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Blood bank not found.' }, { status: 404 });
    }

    const body = await req.json();
    await db
      .update(dbBloodBanks)
      .set(body)
      .where(eq(dbBloodBanks.id, id));

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Updated Blood Bank Details',
      details: `Modified inventory profile for blood bank "${existing[0].name}" (ID: ${id}).`,
    });

    const updated = await db.select().from(dbBloodBanks).where(eq(dbBloodBanks.id, id));
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Update blood bank error:', error);
    return NextResponse.json({ error: 'Internal server error updating blood bank.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }
    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.select().from(dbBloodBanks).where(eq(dbBloodBanks.id, id));
    const deletedBank = existing[0];

    if (deletedBank) {
      await db.delete(dbBloodBanks).where(eq(dbBloodBanks.id, id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Deleted Blood Bank',
        details: `Deleted blood bank entry "${deletedBank.name}" (ID: ${id}).`,
      });

      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Blood bank not found.' }, { status: 404 });
  } catch (error) {
    console.error('Delete blood bank error:', error);
    return NextResponse.json({ error: 'Internal server error deleting blood bank.' }, { status: 500 });
  }
}
