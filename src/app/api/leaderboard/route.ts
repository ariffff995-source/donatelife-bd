import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, donations as dbDonations } from '@/src/db/schema';
import { eq, or } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';
import { calculateReputationScore } from '@/src/utils/gamification';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const timeframe = searchParams.get('timeframe') || 'monthly';
  const sortBy = searchParams.get('sortBy') || 'donations';

  try {
    await ensureDbSeeded();

    const allUsers = await db
      .select()
      .from(dbUsers)
      .where(eq(dbUsers.isAdmin, false));

    const userIds = allUsers.map(u => u.id);
    let donationCountMap = new Map<string, number>();

    if (userIds.length > 0) {
      const allDonations = await db
        .select({ userId: dbDonations.userId })
        .from(dbDonations);

      for (const d of allDonations) {
        donationCountMap.set(d.userId, (donationCountMap.get(d.userId) ?? 0) + 1);
      }
    }

    const processedDonors = allUsers.map((u) => {
      const totalDonations = donationCountMap.get(u.id) ?? u.totalDonationsCount ?? 0;
      const repScore = calculateReputationScore(u, totalDonations);
      return {
        ...u,
        totalDonationsCount: totalDonations,
        reputationScore: repScore
      };
    });

    // Sort according to query
    processedDonors.sort((a, b) => {
      if (sortBy === 'reputation') {
        return (b.reputationScore || 0) - (a.reputationScore || 0);
      }
      if (sortBy === 'streak') {
        return (b.donationStreak || 0) - (a.donationStreak || 0);
      }
      return (b.totalDonationsCount || 0) - (a.totalDonationsCount || 0);
    });

    const topDonors = processedDonors.slice(0, 20).map((u) => ({
      id: u.id,
      donorId: u.donorId || `DL-${u.id.slice(-6).toUpperCase()}`,
      name: u.name,
      avatarUrl: u.avatarUrl || null,
      bloodGroup: u.bloodGroup,
      division: u.division,
      district: u.district,
      upazila: u.upazila,
      isAvailable: u.isAvailable,
      isVerified: Boolean(u.isVerified || u.isDonorVerified || u.verificationStatus === 'approved'),
      totalDonationsCount: u.totalDonationsCount,
      reputationScore: u.reputationScore,
      donationStreak: u.donationStreak || 0,
      createdAt: u.createdAt
    }));

    return NextResponse.json({ donors: topDonors });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json({ donors: [] });
  }
}
