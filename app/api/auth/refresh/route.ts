import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const { refreshToken } = body;
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token is required.' }, { status: 400 });
    }
    const userId = refreshToken.replace('refresh-', '');
    const results = await db
      .select()
      .from(dbUsers)
      .where(eq(dbUsers.id, userId));

    let user = results[0];
    if (!user) {
      const firstUser = await db.select().from(dbUsers).limit(1);
      user = firstUser[0];
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      token: user.id,
      refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error during token refresh.' }, { status: 500 });
  }
}
