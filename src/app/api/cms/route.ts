import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { cmsContent as dbCmsContent } from '@/src/db/schema';
import { ensureDbSeeded, getCmsCache, setCmsCache } from '@/src/lib/server-backend';
import { defaultCmsConfig } from '@/src/data/defaultCms';

export async function GET() {
  try {
    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn('Database seeding check skipped in CMS API:', seedErr);
    }

    const cache = getCmsCache();
    if (cache && Object.keys(cache).length > 0) {
      return NextResponse.json(cache);
    }

    let allContent: any[] = [];
    try {
      allContent = await db.select().from(dbCmsContent);
    } catch (dbErr) {
      console.error('Database query for CMS content failed, using fallback config:', dbErr);
    }

    const resultMap: Record<string, any> = { ...defaultCmsConfig };
    if (Array.isArray(allContent) && allContent.length > 0) {
      allContent.forEach((item) => {
        if (item && item.id) {
          resultMap[item.id] = item.published || item.draft || defaultCmsConfig[item.id];
        }
      });
    }

    setCmsCache(resultMap);
    return NextResponse.json(resultMap, { status: 200 });
  } catch (error) {
    console.error('Fetch CMS content exception, returning default CMS fallback:', error);
    return NextResponse.json(defaultCmsConfig, { status: 200 });
  }
}
