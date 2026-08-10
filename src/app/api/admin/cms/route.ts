import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { cmsContent as dbCmsContent } from '@/src/db/schema';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn('[GET /api/admin/cms] Seeding check skipped:', seedErr);
    }

    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    let allContent: any[] = [];
    try {
      allContent = await db.select().from(dbCmsContent);
    } catch (dbErr) {
      console.error('[GET /api/admin/cms] DB query failed:', dbErr);
    }

    return NextResponse.json(allContent || []);
  } catch (error) {
    console.error('Admin CMS fetch error:', error);
    return NextResponse.json({ error: 'Internal server error fetching administrative CMS listings.' }, { status: 500 });
  }
}
