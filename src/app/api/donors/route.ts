import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, donations as dbDonations } from '@/src/db/schema';
import { eq, and, ilike, or, not } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = (searchParams.get('q') || searchParams.get('search') || '').trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12', 10)));
  
  // Specific filters (if provided)
  const bloodGroup = searchParams.get('bloodGroup') || '';
  const rawDivision = searchParams.get('division') || '';
  const rawDistrict = searchParams.get('district') || '';
  const rawUpazila = searchParams.get('upazila') || '';
  const availableOnly = searchParams.get('availableOnly') === 'true';
  const verifiedOnly = searchParams.get('verifiedOnly') === 'true';

  const division = rawDivision.includes('|') ? rawDivision.split('|')[0].trim() : rawDivision.trim();
  const district = rawDistrict.includes('|') ? rawDistrict.split('|')[0].trim() : rawDistrict.trim();
  const upazila = rawUpazila.includes('|') ? rawUpazila.split('|')[0].trim() : rawUpazila.trim();

  try {
    await ensureDbSeeded();

    // 1. Fetch all non-admin registered users (public donors)
    const allUsers = await db
      .select()
      .from(dbUsers)
      .where(eq(dbUsers.isAdmin, false));

    // 2. Global statistics across ALL registered public donors
    const totalDonors = allUsers.length;
    const verifiedDonors = allUsers.filter(u => u.isVerified || u.isDonorVerified || u.verificationStatus === 'approved').length;
    const availableDonors = allUsers.filter(u => u.isAvailable).length;

    // 3. Batch fetch donation counts to calculate totalDonations without N+1 queries
    const userIds = allUsers.map(u => u.id);
    let donationCountMap = new Map<string, number>();

    if (userIds.length > 0) {
      const allDonations = await db
        .select({ userId: dbDonations.userId })
        .from(dbDonations)
        .where(
          userIds.length === 1
            ? eq(dbDonations.userId, userIds[0])
            : or(...userIds.map(id => eq(dbDonations.userId, id)))
        );

      for (const d of allDonations) {
        donationCountMap.set(d.userId, (donationCountMap.get(d.userId) ?? 0) + 1);
      }
    }

    // Helper function to match blood group query (e.g. "A+", "O-", "A positive", etc.)
    const normalizeSearchQuery = (term: string) => {
      const lower = term.toLowerCase();
      if (lower.includes('positive') || lower.includes('pos')) {
        return lower.replace(/positive|pos/g, '+').replace(/\s+/g, '');
      }
      if (lower.includes('negative') || lower.includes('neg')) {
        return lower.replace(/negative|neg/g, '-').replace(/\s+/g, '');
      }
      return lower;
    };

    const normalizedQ = normalizeSearchQuery(q);

    // 4. Apply filtering to matching donors
    let filtered = allUsers.filter((u) => {
      // Real-time search query matching
      if (q) {
        const nameMatch = u.name.toLowerCase().includes(q.toLowerCase());
        const donorIdMatch = u.donorId ? u.donorId.toLowerCase().includes(q.toLowerCase()) : false;
        const bloodGroupMatch = u.bloodGroup ? u.bloodGroup.toLowerCase().includes(normalizedQ) : false;
        const divisionMatch = u.division ? u.division.toLowerCase().includes(q.toLowerCase()) : false;
        const districtMatch = u.district ? u.district.toLowerCase().includes(q.toLowerCase()) : false;
        const upazilaMatch = u.upazila ? u.upazila.toLowerCase().includes(q.toLowerCase()) : false;

        const matchesQuery = nameMatch || donorIdMatch || bloodGroupMatch || divisionMatch || districtMatch || upazilaMatch;
        if (!matchesQuery) return false;
      }

      // Explicit filter parameters if passed
      if (bloodGroup && bloodGroup !== 'All' && u.bloodGroup !== bloodGroup) {
        return false;
      }
      if (division && division !== 'All' && !u.division.toLowerCase().includes(division.toLowerCase())) {
        return false;
      }
      if (district && district !== 'All' && !u.district.toLowerCase().includes(district.toLowerCase())) {
        return false;
      }
      if (upazila && upazila !== 'All' && !u.upazila.toLowerCase().includes(upazila.toLowerCase())) {
        return false;
      }
      if (availableOnly && !u.isAvailable) {
        return false;
      }
      if (verifiedOnly && !(u.isVerified || u.isDonorVerified || u.verificationStatus === 'approved')) {
        return false;
      }

      return true;
    });

    // 5. Multi-level Sorting Priority:
    //    a) Verified donors first
    //    b) Emergency Available donors
    //    c) Highest donation count
    //    d) Most recently active (lastDonationDate)
    //    e) Newest registered (createdAt)
    filtered.sort((a, b) => {
      const isVerifiedA = Boolean(a.isVerified || a.isDonorVerified || a.verificationStatus === 'approved');
      const isVerifiedB = Boolean(b.isVerified || b.isDonorVerified || b.verificationStatus === 'approved');
      if (isVerifiedA !== isVerifiedB) return isVerifiedA ? -1 : 1;

      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;

      const donationsA = donationCountMap.get(a.id) ?? 0;
      const donationsB = donationCountMap.get(b.id) ?? 0;
      if (donationsA !== donationsB) return donationsB - donationsA;

      if (a.lastDonationDate && b.lastDonationDate) {
        const dateA = new Date(a.lastDonationDate).getTime();
        const dateB = new Date(b.lastDonationDate).getTime();
        if (dateA !== dateB) return dateB - dateA;
      } else if (a.lastDonationDate && !b.lastDonationDate) {
        return -1;
      } else if (!a.lastDonationDate && b.lastDonationDate) {
        return 1;
      }

      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return createdB - createdA;
    });

    // 6. Pagination
    const totalMatching = filtered.length;
    const totalPages = Math.ceil(totalMatching / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedSlice = filtered.slice(startIndex, startIndex + limit);

    // 7. Sanitize Sensitive Information
    //    Publicly visible: Profile photo, Donor ID, Full Name, Blood Group, Division, District, Upazila,
    //    Total Donations, Last Donation Date, Next Eligible Date, Verified Badge, Availability Status.
    //    Hidden: Email, Address, Password, Verification Document, DB ID, Phone (unless showPhone is true).
    const sanitizedDonors = paginatedSlice.map((u) => {
      const totalDonations = donationCountMap.get(u.id) ?? 0;

      // Calculate Next Eligible Donation Date (90 days after last donation date)
      let nextEligibleDate: string | null = null;
      let isEligibleNow = true;

      if (u.lastDonationDate) {
        const lastDate = new Date(u.lastDonationDate);
        if (!isNaN(lastDate.getTime())) {
          const eligibleDate = new Date(lastDate);
          eligibleDate.setDate(eligibleDate.getDate() + 90);
          nextEligibleDate = eligibleDate.toISOString().split('T')[0];
          isEligibleNow = new Date() >= eligibleDate;
        }
      }

      const publicDonor = {
        donorId: u.donorId || `DL-${u.id.slice(-6).toUpperCase()}`,
        name: u.name,
        avatarUrl: u.avatarUrl || null,
        bloodGroup: u.bloodGroup,
        division: u.division,
        district: u.district,
        upazila: u.upazila,
        gender: u.gender || 'male',
        isAvailable: u.isAvailable,
        isVerified: Boolean(u.isVerified || u.isDonorVerified || u.verificationStatus === 'approved'),
        totalDonations,
        lastDonationDate: u.lastDonationDate || null,
        nextEligibleDate,
        isEligibleNow,
        showPhone: Boolean(u.showPhone),
        phone: u.showPhone ? u.phone : null,
        showFacebook: Boolean(u.showFacebook),
        facebookUrl: u.showFacebook ? u.facebookUrl : null,
        createdAt: u.createdAt,
      };

      return publicDonor;
    });

    // Response includes sanitized donors list, global stats bar counts, and pagination state
    return NextResponse.json({
      donors: sanitizedDonors,
      stats: {
        totalDonors,
        verifiedDonors,
        availableDonors,
      },
      pagination: {
        page,
        limit,
        total: totalMatching,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Public donors API search failed:', error);
    return NextResponse.json(
      {
        donors: [],
        stats: { totalDonors: 0, verifiedDonors: 0, availableDonors: 0 },
        pagination: { page: 1, limit: 12, total: 0, totalPages: 1, hasMore: false },
      },
      { status: 200 }
    );
  }
}
