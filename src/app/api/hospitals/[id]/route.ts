import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { hospitals as dbHospitals, activityLogs as dbActivityLogs } from '@/src/db/schema';
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
    const existing = await db.select().from(dbHospitals).where(eq(dbHospitals.id, id));
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Hospital not found.' }, { status: 404 });
    }

    const body = await req.json();
    await db
      .update(dbHospitals)
      .set(body)
      .where(eq(dbHospitals.id, id));

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Updated Hospital Details',
      details: `Modified hospital profile for "${existing[0].name}" (ID: ${id}).`,
    });

    const updated = await db.select().from(dbHospitals).where(eq(dbHospitals.id, id));
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Update hospital error:', error);
    return NextResponse.json({ error: 'Internal server error updating hospital.' }, { status: 500 });
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
    if (admin.role !== 'super-admin') {
      return NextResponse.json({ error: 'Super Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.select().from(dbHospitals).where(eq(dbHospitals.id, id));
    const deletedHosp = existing[0];

    if (deletedHosp) {
      await db.delete(dbHospitals).where(eq(dbHospitals.id, id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Deleted Hospital',
        details: `Deleted hospital entry "${deletedHosp.name}" (ID: ${id}).`,
      });

      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Hospital not found.' }, { status: 404 });
  } catch (error) {
    console.error('Delete hospital error:', error);
    return NextResponse.json({ error: 'Internal server error deleting hospital.' }, { status: 500 });
  }
}
