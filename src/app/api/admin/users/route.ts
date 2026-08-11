import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }
    try {
      const results = await db.select().from(dbUsers).orderBy(desc(dbUsers.createdAt));
      return NextResponse.json(results);
    } catch (dbErr) {
      console.warn('[Admin Users] Database error, returning empty list:', dbErr);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Admin users list error:', error);
    return NextResponse.json([]);
  }
}
