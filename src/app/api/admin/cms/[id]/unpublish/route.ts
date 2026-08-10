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
    await db
      .update(dbCmsContent)
      .set({
        isPublished: false,
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
      action: 'Unpublished CMS Section',
      details: `Reverted section "${id}" to unpublished state.`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unpublish CMS error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
