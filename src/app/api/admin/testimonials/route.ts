import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { testimonials as dbTestimonials } from '@/src/db/schema';
import { desc } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    try {
      const results = await db.select().from(dbTestimonials).orderBy(desc(dbTestimonials.createdAt));
      return NextResponse.json(results);
    } catch (dbErr) {
      console.warn('[Admin Testimonials] Database query error:', dbErr);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Admin testimonials error:', error);
    return NextResponse.json([]);
  }
}
