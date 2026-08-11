import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, requests as dbRequests } from '@/src/db/schema';
import { sql } from 'drizzle-orm';
import { getAuthAdmin } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    let allUsers: any[] = [];
    let allReqs: any[] = [];
    let totalHospitals = 0;
    let totalBloodBanks = 0;
    let totalDonations = 0;

    try {
      allUsers = await db.select().from(dbUsers);
      allReqs = await db.select().from(dbRequests);

      const parseCount = (res: any) => Number(res?.rows?.[0]?.count ?? res?.[0]?.count ?? 0);

      const totalHospitalsRes = await db.execute(sql`SELECT count(*) FROM hospitals`);
      const totalBloodBanksRes = await db.execute(sql`SELECT count(*) FROM blood_banks`);
      const totalDonationsRes = await db.execute(sql`SELECT count(*) FROM donations`);

      totalHospitals = parseCount(totalHospitalsRes);
      totalBloodBanks = parseCount(totalBloodBanksRes);
      totalDonations = parseCount(totalDonationsRes);
    } catch (dbErr) {
      console.warn('[Admin Stats] Database unavailable or query failed, returning zeroed stats:', dbErr);
    }

    const bloodGroupDistribution: Record<string, number> = {
      'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0,
    };
    allUsers.forEach((u) => {
      if (bloodGroupDistribution[u.bloodGroup] !== undefined) {
        bloodGroupDistribution[u.bloodGroup]++;
      }
    });

    const requestStatusDistribution = {
      pending_approval: allReqs.filter((r) => r.status === 'pending_approval').length,
      pending: allReqs.filter((r) => r.status === 'pending').length,
      fulfilled: allReqs.filter((r) => r.status === 'fulfilled').length,
      cancelled: allReqs.filter((r) => r.status === 'cancelled').length,
      rejected: allReqs.filter((r) => r.status === 'rejected').length,
    };

    return NextResponse.json({
      totalDonors: allUsers.length,
      totalRequests: allReqs.length,
      activeRequests: allReqs.filter((r) => r.status === 'pending').length,
      totalHospitals,
      totalBloodBanks,
      successfulDonations: totalDonations + allReqs.filter((r) => r.status === 'fulfilled').length,
      bloodGroupDistribution,
      requestStatusDistribution,
    });
  } catch (error) {
    console.error('Stats aggregation error:', error);
    return NextResponse.json({
      totalDonors: 0,
      totalRequests: 0,
      activeRequests: 0,
      totalHospitals: 0,
      totalBloodBanks: 0,
      successfulDonations: 0,
      bloodGroupDistribution: { 'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0, 'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0 },
      requestStatusDistribution: { pending_approval: 0, pending: 0, fulfilled: 0, cancelled: 0, rejected: 0 },
    }, { status: 200 });
  }
}
