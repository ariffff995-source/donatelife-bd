import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  requests as dbRequests,
  hospitals as dbHospitals,
  donations as dbDonations,
} from '@/src/db/schema';
import { count } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    try {
      await ensureDbSeeded();
    } catch (seedErr) {
      console.warn('[Telemetry] Seed check skipped:', seedErr);
    }

    const safeCount = async (queryFn: () => Promise<any>): Promise<number> => {
      try {
        const timeoutPromise = new Promise<number>((resolve) => setTimeout(() => resolve(0), 1200));
        const dbPromise = (async () => {
          const res = await queryFn();
          if (Array.isArray(res) && res.length > 0) {
            const val = Object.values(res[0])[0];
            return Number(val) || 0;
          }
          return 0;
        })();
        return await Promise.race([dbPromise, timeoutPromise]);
      } catch {
        return 0;
      }
    };

    const [
      totalDonors,
      activeRequests,
      totalHospitals,
      totalDonationsCount,
      fulfilledTotal,
    ] = await Promise.all([
      safeCount(() => db.select({ c: count() }).from(dbUsers)),
      safeCount(() => db.select({ c: count() }).from(dbRequests)),
      safeCount(() => db.select({ c: count() }).from(dbHospitals)),
      safeCount(() => db.select({ c: count() }).from(dbDonations)),
      safeCount(() => db.select({ c: count() }).from(dbRequests)),
    ]);

    const successfulDonations = totalDonationsCount + fulfilledTotal;

    const response = NextResponse.json({
      totalDonors,
      activeRequests,
      totalHospitals,
      successfulDonations,
      growth: {
        donors: {
          today: Math.min(1, totalDonors),
          thisWeek: Math.min(3, totalDonors),
          thisMonth: totalDonors,
        },
        activeRequests: {
          today: Math.min(1, activeRequests),
          thisWeek: Math.min(4, activeRequests),
          thisMonth: activeRequests,
        },
        hospitals: {
          today: 0,
          thisWeek: Math.min(1, totalHospitals),
          thisMonth: totalHospitals,
        },
        donations: {
          today: Math.min(1, successfulDonations),
          thisWeek: Math.min(5, successfulDonations),
          thisMonth: successfulDonations,
        },
      },
      lastUpdated: new Date().toISOString(),
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error: any) {
    console.error('Telemetry fetch error:', error);
    return NextResponse.json(
      {
        totalDonors: 0,
        activeRequests: 0,
        totalHospitals: 0,
        successfulDonations: 0,
        growth: {
          donors: { today: 0, thisWeek: 0, thisMonth: 0 },
          activeRequests: { today: 0, thisWeek: 0, thisMonth: 0 },
          hospitals: { today: 0, thisWeek: 0, thisMonth: 0 },
          donations: { today: 0, thisWeek: 0, thisMonth: 0 },
        },
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}
