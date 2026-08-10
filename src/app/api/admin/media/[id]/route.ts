import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { media as dbMedia, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.select().from(dbMedia).where(eq(dbMedia.id, id));
    const deletedMedia = existing[0];

    if (deletedMedia) {
      await db.delete(dbMedia).where(eq(dbMedia.id, id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Deleted Media Asset',
        details: `Deleted media file "${deletedMedia.name}" (ID: ${id}) from CDN storage catalog.`,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  } catch (error) {
    console.error('Delete media error:', error);
    return NextResponse.json({ error: 'Internal server error deleting media.' }, { status: 500 });
  }
}
