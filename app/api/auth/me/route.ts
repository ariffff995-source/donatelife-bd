import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Session expired or invalid authorization.' }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error fetching account details.' }, { status: 500 });
  }
}
