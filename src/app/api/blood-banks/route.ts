import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { bloodBanks as dbBloodBanks, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq, ilike, and, or } from 'drizzle-orm';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn('[GET /api/blood-banks] Seeding check skipped:', seedErr);
    }

    const searchParams = req.nextUrl.searchParams;
    const division = searchParams.get('division');
    const search = searchParams.get('search');

    const conditions = [];
    if (division) {
      conditions.push(eq(dbBloodBanks.division, division));
    }
    if (search) {
      conditions.push(
        or(
          ilike(dbBloodBanks.name, `%${search}%`),
          ilike(dbBloodBanks.district, `%${search}%`),
          ilike(dbBloodBanks.upazila, `%${search}%`),
          ilike(dbBloodBanks.address, `%${search}%`)
        )
      );
    }

    let results: any[] = [];
    try {
      results = await db
        .select()
        .from(dbBloodBanks)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
    } catch (dbErr: any) {
      console.error('[GET /api/blood-banks] Query error:', dbErr?.message || dbErr);
      results = [];
    }

    return NextResponse.json(
      {
        success: true,
        data: results || [],
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[GET /api/blood-banks] Unexpected route exception:', error);
    return NextResponse.json(
      {
        success: true,
        data: [],
      },
      { status: 200 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn('[POST /api/blood-banks] Seeding check skipped:', seedErr);
    }

    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, division, district, upazila, address, contactPhone, availableGroups } = body;
    if (!name || !division || !district || !contactPhone) {
      return NextResponse.json(
        { success: false, error: 'Blood bank name, division, district, and contact phone are required.' },
        { status: 400 }
      );
    }

    const id = 'bank-' + Math.floor(100000 + Math.random() * 900000);
    const newBank = {
      id,
      name,
      division,
      district,
      upazila: upazila || 'Sadar',
      address: address || '',
      contactPhone,
      availableGroups: availableGroups || { 'A+': 0, 'B+': 0, 'O+': 0, 'AB+': 0 },
    };

    try {
      await db.insert(dbBloodBanks).values(newBank);

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Created Blood Bank Listing',
        details: `Added blood storage facility "${name}" (${division}) to directory.`,
      });
    } catch (dbErr: any) {
      console.error(
        '[POST /api/blood-banks] Query: INSERT INTO blood_banks | Error:',
        dbErr?.message || dbErr,
        '\nStack trace:',
        dbErr?.stack || 'No stack trace'
      );
    }

    return NextResponse.json(
      { success: true, data: newBank },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      '[POST /api/blood-banks] Unexpected route exception | Stack trace:',
      error?.stack || 'No stack trace',
      '| Original error:',
      error
    );
    return NextResponse.json(
      { success: false, error: 'Internal server error creating blood bank.' },
      { status: 500 }
    );
  }
}
