export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid or expired admin session.' }, { status: 401 });
    }
    return NextResponse.json({
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        createdAt: admin.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin auth me error:', error);
    return NextResponse.json({ error: 'Internal server error validating administrative session.' }, { status: 500 });
  }
}
