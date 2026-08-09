import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { media as dbMedia } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export async function GET() {
  try {
    await ensureDbSeeded();
    const assets = await db.select().from(dbMedia).orderBy(desc(dbMedia.uploadedAt));
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Fetch media list error:', error);
    return NextResponse.json({ error: 'Internal server error fetching media library.' }, { status: 500 });
  }
}
