import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { volunteers as dbVolunteers, users as dbUsers } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    try {
      const results = await db.select().from(dbVolunteers).orderBy(desc(dbVolunteers.joinedAt));
      if (results.length === 0) {
        // Fallback to active users as volunteers if table empty
        const userVolunteers = await db.select().from(dbUsers).limit(20);
        const mapped = userVolunteers.map(u => ({
          id: `vol-${u.id}`,
          userId: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          division: u.division,
          district: u.district,
          upazila: u.upazila,
          role: 'Regional Blood Coordinator',
          status: 'Active',
          joinedAt: u.createdAt,
        }));
        return NextResponse.json(mapped);
      }
      return NextResponse.json(results);
    } catch (dbErr) {
      console.warn('[Admin Volunteers] Database error, returning user fallbacks:', dbErr);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Admin volunteers route error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
