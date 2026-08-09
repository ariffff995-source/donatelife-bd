import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const { id } = await params;
    const currentFavs: string[] = Array.isArray(user.favoriteAmbulances) ? [...user.favoriteAmbulances] : [];
    let updatedFavs: string[];

    if (currentFavs.includes(id)) {
      updatedFavs = currentFavs.filter((fId) => fId !== id);
    } else {
      updatedFavs = [...currentFavs, id];
    }

    await db
      .update(dbUsers)
      .set({ favoriteAmbulances: updatedFavs })
      .where(eq(dbUsers.id, user.id));

    return NextResponse.json({ success: true, favoriteAmbulances: updatedFavs });
  } catch (error) {
    console.error('Toggle favorite ambulance error:', error);
    return NextResponse.json({ error: 'Internal server error toggling favorite ambulance.' }, { status: 500 });
  }
}
