import { NextRequest, NextResponse } from 'next/server';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }
    return NextResponse.json({ media: [] });
  } catch (error) {
    console.error('Admin media API error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}