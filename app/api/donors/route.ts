import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, donations as dbDonations } from '@/src/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';

export const dynamic = 'force-dynamic';

// Seeded fallback donors for when Postgres database connection is offline
const FALLBACK_DONORS = [
  {
    id: 'user-admin',
    name: 'Dr. Arif Rahman',
    email: 'ariffff995@gmail.com',
    phone: '01712345678',
    bloodGroup: 'A+',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    lastDonationDate: '2026-03-15',
    isAvailable: true,
    isAdmin: true,
    isEmailVerified: true,
    isPhoneVerified: true,
    isDonorVerified: true,
    verificationStatus: 'approved',
    totalDonations: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-2',
    name: 'Tariqul Islam',
    email: 'tariq@gmail.com',
    phone: '01811223344',
    bloodGroup: 'O-',
    division: 'Chittagong',
    district: 'Chittagong',
    upazila: 'Hathazari',
    lastDonationDate: null,
    isAvailable: true,
    isAdmin: false,
    totalDonations: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-3',
    name: 'Nadia Sultana',
    email: 'nadia@gmail.com',
    phone: '01911223344',
    bloodGroup: 'B+',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Sylhet Sadar',
    lastDonationDate: null,
    isAvailable: true,
    isAdmin: false,
    totalDonations: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-4',
    name: 'Mustafizur Rahman',
    email: 'mustafiz@gmail.com',
    phone: '01555555555',
    bloodGroup: 'AB-',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Sylhet Sadar',
    lastDonationDate: '2026-05-10',
    isAvailable: false,
    isAdmin: false,
    totalDonations: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-5',
    name: 'Anika Tabassum',
    email: 'anika@gmail.com',
    phone: '01666778899',
    bloodGroup: 'O+',
    division: 'Rajshahi',
    district: 'Rajshahi',
    upazila: 'Boalia',
    lastDonationDate: null,
    isAvailable: true,
    isAdmin: false,
    totalDonations: 4,
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const bloodGroup = searchParams.get('bloodGroup') || '';
  const rawDivision = searchParams.get('division') || '';
  const rawDistrict = searchParams.get('district') || '';
  const rawUpazila = searchParams.get('upazila') || '';
  const rawFullAddress = searchParams.get('fullAddress') || searchParams.get('address') || '';
  const availableOnly = searchParams.get('availableOnly');

  const division = rawDivision.includes('|') ? rawDivision.split('|')[0].trim() : rawDivision.trim();
  const district = rawDistrict.includes('|') ? rawDistrict.split('|')[0].trim() : rawDistrict.trim();
  const upazila = rawUpazila.includes('|') ? rawUpazila.split('|')[0].trim() : rawUpazila.trim();
  const fullAddress = rawFullAddress.trim();

  try {
    await ensureDbSeeded();

    const conditions = [];

    if (bloodGroup) {
      conditions.push(eq(dbUsers.bloodGroup, bloodGroup as any));
    }
    if (division) {
      conditions.push(ilike(dbUsers.division, `%${division}%`));
    }
    if (district) {
      conditions.push(ilike(dbUsers.district, `%${district}%`));
    }
    if (upazila) {
      conditions.push(ilike(dbUsers.upazila, `%${upazila}%`));
    }
    if (fullAddress) {
      conditions.push(ilike(dbUsers.address, `%${fullAddress}%`));
    }
    if (availableOnly === 'true') {
      conditions.push(eq(dbUsers.isAvailable, true));
    }

    const results = await db
      .select()
      .from(dbUsers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const donorsWithCounts = await Promise.all(
      results.map(async (u) => {
        const userDonations = await db
          .select()
          .from(dbDonations)
          .where(eq(dbDonations.userId, u.id));
        return {
          ...u,
          totalDonations: userDonations.length,
        };
      })
    );

    return NextResponse.json(donorsWithCounts);
  } catch (error) {
    console.warn('Donors search DB query failed, serving filtered fallback rosters:', error);
    
    // Filter fallback donors array gracefully
    let filtered = [...FALLBACK_DONORS];
    if (bloodGroup) {
      filtered = filtered.filter(d => d.bloodGroup === bloodGroup);
    }
    if (division) {
      filtered = filtered.filter(d => d.division.toLowerCase().includes(division.toLowerCase()));
    }
    if (district) {
      filtered = filtered.filter(d => d.district.toLowerCase().includes(district.toLowerCase()));
    }
    if (upazila) {
      filtered = filtered.filter(d => d.upazila.toLowerCase().includes(upazila.toLowerCase()));
    }
    if (fullAddress) {
      filtered = filtered.filter(d => 
        (d as any).address?.toLowerCase().includes(fullAddress.toLowerCase()) ||
        d.division.toLowerCase().includes(fullAddress.toLowerCase()) ||
        d.district.toLowerCase().includes(fullAddress.toLowerCase()) ||
        d.upazila.toLowerCase().includes(fullAddress.toLowerCase())
      );
    }
    if (availableOnly === 'true') {
      filtered = filtered.filter(d => d.isAvailable);
    }

    return NextResponse.json(filtered);
  }
}
