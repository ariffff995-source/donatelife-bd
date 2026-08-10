import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { ambulances as dbAmbulances } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to submit a review.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || Number(rating) < 1 || Number(rating) > 5 || !comment) {
      return NextResponse.json({ error: 'Rating (1-5) and review comment are required.' }, { status: 400 });
    }

    const results = await db.select().from(dbAmbulances).where(eq(dbAmbulances.id, id));
    const amb = results[0];
    if (!amb) {
      return NextResponse.json({ error: 'Ambulance service provider not found.' }, { status: 404 });
    }

    const existingReviews: any[] = Array.isArray(amb.reviews) ? [...amb.reviews] : [];
    const newReview = {
      id: 'rev-' + Math.floor(100000 + Math.random() * 900000),
      userId: user.id,
      userName: user.name,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      hidden: false,
    };

    existingReviews.unshift(newReview);

    const visibleReviews = existingReviews.filter((r) => !r.hidden);
    const sumRatings = visibleReviews.reduce((acc, curr) => acc + Number(curr.rating), 0);
    const avgRating = visibleReviews.length > 0 ? (sumRatings / visibleReviews.length).toFixed(1) : '0.0';

    await db
      .update(dbAmbulances)
      .set({
        reviews: existingReviews,
        averageRating: avgRating,
        totalReviews: visibleReviews.length,
      })
      .where(eq(dbAmbulances.id, id));

    return NextResponse.json({
      success: true,
      review: newReview,
      averageRating: avgRating,
      totalReviews: visibleReviews.length,
    });
  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Internal server error submitting review.' }, { status: 500 });
  }
}
