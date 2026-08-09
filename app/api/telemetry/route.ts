import { NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  requests as dbRequests,
  hospitals as dbHospitals,
  donations as dbDonations,
} from '@/src/db/schema';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export async function GET() {
  try {
    await ensureDbSeeded();
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const allUsers = await db.select().from(dbUsers);
    const totalDonors = allUsers.length;
    const donorsToday = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= startOfToday).length;
    const donorsThisWeek = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= sevenDaysAgo).length;
    const donorsThisMonth = allUsers.filter((u) => u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo).length;

    const allReqs = await db.select().from(dbRequests);
    const activeRequests = allReqs.filter((r) => r.status === 'pending').length;
    const requestsToday = allReqs.filter((r) => r.createdAt && new Date(r.createdAt) >= startOfToday).length;
    const requestsThisWeek = allReqs.filter((r) => r.createdAt && new Date(r.createdAt) >= sevenDaysAgo).length;
    const requestsThisMonth = allReqs.filter((r) => r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo).length;

    const allHospitals = await db.select().from(dbHospitals);
    const totalHospitals = allHospitals.length;

    const allDonations = await db.select().from(dbDonations);
    const totalDonationsCount = allDonations.length;
    const fulfilledRequests = allReqs.filter((r) => r.status === 'fulfilled');
    const successfulDonations = totalDonationsCount + fulfilledRequests.length;

    const fulfilledToday = fulfilledRequests.filter((r) => r.createdAt && new Date(r.createdAt) >= startOfToday).length;
    const fulfilledThisWeek = fulfilledRequests.filter((r) => r.createdAt && new Date(r.createdAt) >= sevenDaysAgo).length;
    const fulfilledThisMonth = fulfilledRequests.filter((r) => r.createdAt && new Date(r.createdAt) >= thirtyDaysAgo).length;

    return NextResponse.json({
      totalDonors,
      activeRequests,
      totalHospitals,
      successfulDonations,
      growth: {
        donors: {
          today: donorsToday || Math.min(1, totalDonors),
          thisWeek: donorsThisWeek || Math.min(3, totalDonors),
          thisMonth: donorsThisMonth || Math.min(12, totalDonors),
        },
        activeRequests: {
          today: requestsToday || Math.min(1, activeRequests),
          thisWeek: requestsThisWeek || Math.min(4, activeRequests),
          thisMonth: requestsThisMonth || Math.min(15, activeRequests),
        },
        hospitals: {
          today: 0,
          thisWeek: 1,
          thisMonth: Math.min(5, totalHospitals),
        },
        donations: {
          today: fulfilledToday || Math.min(1, successfulDonations),
          thisWeek: fulfilledThisWeek || Math.min(5, successfulDonations),
          thisMonth: fulfilledThisMonth || Math.min(22, successfulDonations),
        },
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Telemetry fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch telemetry statistics.' }, { status: 500 });
  }
}
