import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { cmsContent as dbCmsContent, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

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
    const body = await req.json();
    const { draft } = body;

    if (!draft) {
      return NextResponse.json({ error: 'Draft content body is required.' }, { status: 400 });
    }

    const existing = await db.select().from(dbCmsContent).where(eq(dbCmsContent.id, id));

    if (existing.length === 0) {
      await db.insert(dbCmsContent).values({
        id,
        draft,
        published: null,
        isPublished: false,
        updatedBy: admin.username,
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(dbCmsContent)
        .set({
          draft,
          updatedBy: admin.username,
          updatedAt: new Date(),
        })
        .where(eq(dbCmsContent.id, id));
    }

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Saved CMS Draft',
      details: `Updated draft configuration for page section "${id}".`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save CMS draft error:', error);
    return NextResponse.json({ error: 'Internal server error saving CMS draft.' }, { status: 500 });
  }
}
