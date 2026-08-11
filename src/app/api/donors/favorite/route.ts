import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { donorFavorites, users as dbUsers } from '@/src/db/schema';
import { getAuthUserStrict } from '@/src/lib/server-backend';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET User's Favorite Donors
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUserStrict(req);
    if (!authUser) {
      return NextResponse.json({ favorites: [] }, { status: 200 });
    }

    const favRows = await db
      .select({ favoriteDonorId: donorFavorites.favoriteDonorId })
      .from(donorFavorites)
      .where(eq(donorFavorites.userId, authUser.id));

    const favIds = favRows.map(r => r.favoriteDonorId);
    return NextResponse.json({ favorites: favIds }, { status: 200 });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ favorites: [] }, { status: 500 });
  }
}

// POST Save / Toggle Favorite Donor (Prevent duplicates)
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUserStrict(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { favoriteDonorId } = body;

    if (!favoriteDonorId) {
      return NextResponse.json({ error: 'favoriteDonorId is required' }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(donorFavorites)
      .where(
        and(
          eq(donorFavorites.userId, authUser.id),
          eq(donorFavorites.favoriteDonorId, favoriteDonorId)
        )
      );

    if (existing.length > 0) {
      // Remove favorite
      await db
        .delete(donorFavorites)
        .where(
          and(
            eq(donorFavorites.userId, authUser.id),
            eq(donorFavorites.favoriteDonorId, favoriteDonorId)
          )
        );
      return NextResponse.json({ favorited: false, message: 'Removed from favorites' });
    } else {
      // Add favorite
      await db.insert(donorFavorites).values({
        id: `fav-${crypto.randomUUID()}`,
        userId: authUser.id,
        favoriteDonorId: favoriteDonorId,
        createdAt: new Date()
      });
      return NextResponse.json({ favorited: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
  }
}
