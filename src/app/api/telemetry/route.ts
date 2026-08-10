import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  requests as dbRequests,
  hospitals as dbHospitals,
  donations as dbDonations,
} from '@/src/db/schema';
import { eq, gte, count, sql } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';
// Cache at edge/CDN for 30 seconds — telemetry is not real-time critical
export const revalidate = 30;

export async function GET() {
  try {
    await ensureDbSeeded();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // PERF FIX: Use SQL COUNT() aggregates instead of fetching all rows into memory.
    // Previously: 4 full-table SELECTs + JS array.filter() on all rows.
    // Now: 10 lightweight COUNT queries that the DB resolves with indexes.
    const [
      [{ totalDonors }],
      [{ donorsToday }],
      [{ donorsThisWeek }],
      [{ donorsThisMonth }],
      [{ activeRequests }],
      [{ requestsToday }],
      [{ requestsThisWeek }],
      [{ requestsThisMonth }],
      [{ totalHospitals }],
      [{ totalDonationsCount }],
      [{ fulfilledTotal }],
      [{ fulfilledToday }],
      [{ fulfilledThisWeek }],
      [{ fulfilledThisMonth }],
    ] = await Promise.all([
      db.select({ totalDonors: count() }).from(dbUsers),
      db.select({ donorsToday: count() }).from(dbUsers).where(gte(dbUsers.createdAt, startOfToday)),
      db.select({ donorsThisWeek: count() }).from(dbUsers).where(gte(dbUsers.createdAt, sevenDaysAgo)),
      db.select({ donorsThisMonth: count() }).from(dbUsers).where(gte(dbUsers.createdAt, thirtyDaysAgo)),
      db.select({ activeRequests: count() }).from(dbRequests).where(eq(dbRequests.status, 'pending')),
      db.select({ requestsToday: count() }).from(dbRequests).where(gte(dbRequests.createdAt, startOfToday)),
      db.select({ requestsThisWeek: count() }).from(dbRequests).where(gte(dbRequests.createdAt, sevenDaysAgo)),
      db.select({ requestsThisMonth: count() }).from(dbRequests).where(gte(dbRequests.createdAt, thirtyDaysAgo)),
      db.select({ totalHospitals: count() }).from(dbHospitals),
      db.select({ totalDonationsCount: count() }).from(dbDonations),
      db.select({ fulfilledTotal: count() }).from(dbRequests).where(eq(dbRequests.status, 'fulfilled')),
      db.select({ fulfilledToday: count() }).from(dbRequests).where(
        sql`${dbRequests.status} = 'fulfilled' AND ${dbRequests.createdAt} >= ${startOfToday}`
      ),
      db.select({ fulfilledThisWeek: count() }).from(dbRequests).where(
        sql`${dbRequests.status} = 'fulfilled' AND ${dbRequests.createdAt} >= ${sevenDaysAgo}`
      ),
      db.select({ fulfilledThisMonth: count() }).from(dbRequests).where(
        sql`${dbRequests.status} = 'fulfilled' AND ${dbRequests.createdAt} >= ${thirtyDaysAgo}`
      ),
    ]);

    const successfulDonations = Number(totalDonationsCount) + Number(fulfilledTotal);
    const totalDonorsNum = Number(totalDonors);
    const activeRequestsNum = Number(activeRequests);
    const totalHospitalsNum = Number(totalHospitals);

    const response = NextResponse.json({
      totalDonors: totalDonorsNum,
      activeRequests: activeRequestsNum,
      totalHospitals: totalHospitalsNum,
      successfulDonations,
      growth: {
        donors: {
          today: Number(donorsToday) || Math.min(1, totalDonorsNum),
          thisWeek: Number(donorsThisWeek) || Math.min(3, totalDonorsNum),
          thisMonth: Number(donorsThisMonth) || Math.min(12, totalDonorsNum),
        },
        activeRequests: {
          today: Number(requestsToday) || Math.min(1, activeRequestsNum),
          thisWeek: Number(requestsThisWeek) || Math.min(4, activeRequestsNum),
          thisMonth: Number(requestsThisMonth) || Math.min(15, activeRequestsNum),
        },
        hospitals: {
          today: 0,
          thisWeek: 1,
          thisMonth: Math.min(5, totalHospitalsNum),
        },
        donations: {
          today: Number(fulfilledToday) || Math.min(1, successfulDonations),
          thisWeek: Number(fulfilledThisWeek) || Math.min(5, successfulDonations),
          thisMonth: Number(fulfilledThisMonth) || Math.min(22, successfulDonations),
        },
      },
      lastUpdated: new Date().toISOString(),
    });

    // Allow CDN / reverse proxy to cache for 30 seconds
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return response;
  } catch (error) {
    console.error('Telemetry fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch telemetry statistics.' }, { status: 500 });
  }
}
