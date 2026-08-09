import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { ambulances as dbAmbulances } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; reviewId: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { id, reviewId } = await params;
    const results = await db.select().from(dbAmbulances).where(eq(dbAmbulances.id, id));
    const amb = results[0];
    if (!amb) {
      return NextResponse.json({ error: 'Ambulance provider not found.' }, { status: 404 });
    }

    const reviews: any[] = Array.isArray(amb.reviews) ? [...amb.reviews] : [];
    let found = false;

    const updatedReviews = reviews.map((r) => {
      if (r.id === reviewId) {
        found = true;
        return { ...r, hidden: !r.hidden };
      }
      return r;
    });

    if (!found) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    const visibleReviews = updatedReviews.filter((r) => !r.hidden);
    const sumRatings = visibleReviews.reduce((acc, curr) => acc + Number(curr.rating), 0);
    const avgRating = visibleReviews.length > 0 ? (sumRatings / visibleReviews.length).toFixed(1) : '0.0';

    await db
      .update(dbAmbulances)
      .set({
        reviews: updatedReviews,
        averageRating: avgRating,
        totalReviews: visibleReviews.length,
      })
      .where(eq(dbAmbulances.id, id));

    return NextResponse.json({
      success: true,
      reviews: updatedReviews,
      averageRating: avgRating,
      totalReviews: visibleReviews.length,
    });
  } catch (error) {
    console.error('Toggle hide review error:', error);
    return NextResponse.json({ error: 'Internal server error toggling review visibility.' }, { status: 500 });
  }
}
