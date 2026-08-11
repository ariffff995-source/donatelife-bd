import { NextRequest, NextResponse } from 'next/server';
import { getAuthAdmin, manualSeedDatabase } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized admin access.' }, { status: 401 });
    }
    if (admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin authority required for manual database seeding.' }, { status: 403 });
    }

    await manualSeedDatabase();
    return NextResponse.json({ success: true, message: 'Database manual seeding completed successfully.' });
  } catch (error: any) {
    console.error('Manual seed error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to complete manual database seed.' }, { status: 500 });
  }
}
