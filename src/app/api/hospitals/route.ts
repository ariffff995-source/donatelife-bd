import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { hospitals as dbHospitals, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq, ilike, and, or } from 'drizzle-orm';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn('[GET /api/hospitals] Seeding check skipped:', seedErr);
    }

    const searchParams = req.nextUrl.searchParams;
    const division = searchParams.get('division');
    const search = searchParams.get('search');

    const conditions = [];
    if (division) {
      conditions.push(eq(dbHospitals.division, division));
    }
    if (search) {
      conditions.push(
        or(
          ilike(dbHospitals.name, `%${search}%`),
          ilike(dbHospitals.district, `%${search}%`),
          ilike(dbHospitals.upazila, `%${search}%`),
          ilike(dbHospitals.address, `%${search}%`)
        )
      );
    }

    let results: any[] = [];
    try {
      results = await db
        .select()
        .from(dbHospitals)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
    } catch (dbErr: any) {
      console.error('[GET /api/hospitals] Query error:', dbErr?.message || dbErr);
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
    console.error('[GET /api/hospitals] Unexpected route exception:', error);
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
      console.warn('[POST /api/hospitals] Seeding check skipped:', seedErr);
    }

    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, division, district, upazila, address, contactPhone, services, type } = body;
    if (!name || !division || !district || !contactPhone) {
      return NextResponse.json(
        { success: false, error: 'Hospital name, division, district, and contact phone are required.' },
        { status: 400 }
      );
    }

    const id = 'hosp-' + Math.floor(100000 + Math.random() * 900000);
    const newHospital = {
      id,
      name,
      division,
      district,
      upazila: upazila || 'Sadar',
      address: address || '',
      contactPhone,
      services: Array.isArray(services) ? services : ['Emergency Care'],
      type: type || 'private',
    };

    try {
      await db.insert(dbHospitals).values(newHospital);

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Created Hospital Listing',
        details: `Added new medical center "${name}" (${division}) to directory.`,
      });
    } catch (dbErr: any) {
      console.error(
        '[POST /api/hospitals] Query: INSERT INTO hospitals | Error:',
        dbErr?.message || dbErr,
        '\nStack trace:',
        dbErr?.stack || 'No stack trace'
      );
    }

    return NextResponse.json(
      { success: true, data: newHospital },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(
      '[POST /api/hospitals] Unexpected route exception | Stack trace:',
      error?.stack || 'No stack trace',
      '| Original error:',
      error
    );
    return NextResponse.json(
      { success: false, error: 'Internal server error creating hospital.' },
      { status: 500 }
    );
  }
}
