import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { cmsContent as dbCmsContent, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin, clearCmsCache } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

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
    const existing = await db.select().from(dbCmsContent).where(eq(dbCmsContent.id, id));
    const targetItem = existing[0];

    if (!targetItem) {
      return NextResponse.json({ error: 'CMS Section not found.' }, { status: 404 });
    }

    await db
      .update(dbCmsContent)
      .set({
        published: targetItem.draft,
        isPublished: true,
        updatedBy: admin.username,
        updatedAt: new Date(),
      })
      .where(eq(dbCmsContent.id, id));

    clearCmsCache();

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Published CMS Changes',
      details: `Published live changes for page section "${id}".`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Publish CMS error:', error);
    return NextResponse.json({ error: 'Internal server error publishing CMS section.' }, { status: 500 });
  }
}
