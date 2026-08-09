import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { cmsContent as dbCmsContent } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ensureDbSeeded, getCmsCache } from '@/src/lib/server-backend';
import { defaultCmsConfig } from '@/src/data/defaultCms';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isPreview = req.nextUrl.searchParams.get('preview') === 'true';

    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn(`Database seeding check skipped in CMS API for segment "${id}":`, seedErr);
    }

    if (!isPreview) {
      const cache = getCmsCache();
      if (cache && cache[id]) {
        return NextResponse.json(cache[id], { status: 200 });
      }
    }

    let item: any = null;
    try {
      const itemResults = await db.select().from(dbCmsContent).where(eq(dbCmsContent.id, id));
      item = itemResults[0];
    } catch (dbErr) {
      console.error(`Database query for CMS segment "${id}" failed:`, dbErr);
    }

    if (!item && defaultCmsConfig[id]) {
      return NextResponse.json(defaultCmsConfig[id], { status: 200 });
    }

    if (!item) {
      return NextResponse.json(
        { error: `CMS Content configuration for segment "${id}" was not found.` },
        { status: 404 }
      );
    }

    const payload = isPreview ? item.draft : item.published || item.draft || defaultCmsConfig[id];
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    console.error('Fetch single CMS section error:', error);
    if (defaultCmsConfig) {
      const { id } = await params;
      if (defaultCmsConfig[id]) {
        return NextResponse.json(defaultCmsConfig[id], { status: 200 });
      }
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
