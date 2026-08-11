import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, activityLogs as dbActivityLogs } from '@/src/db/schema';
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
    if (admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isAdmin } = body;

    const existing = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
    const userToModify = existing[0];

    if (userToModify) {
      await db
        .update(dbUsers)
        .set({ isAdmin })
        .where(eq(dbUsers.id, id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Modified User Role',
        details: `${isAdmin ? 'Promoted' : 'Demoted'} user "${userToModify.name}" (ID: ${id}) ${isAdmin ? 'to' : 'from'} admin role.`,
      });

      const updated = await db.select().from(dbUsers).where(eq(dbUsers.id, id));
      return NextResponse.json({ success: true, user: updated[0] });
    }

    return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
  } catch (error) {
    console.error('Admin edit role error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
