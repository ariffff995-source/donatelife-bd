import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  requests as dbRequests,
  hospitals as dbHospitals,
  bloodBanks as dbBloodBanks,
  ambulances as dbAmbulances,
  blogs as dbBlogs
} from '@/src/db/schema';
import { eq, or, ilike, and } from 'drizzle-orm';
import { ensureDbSeeded } from '@/src/lib/server-backend';
import { GlobalSearchResultItem, GlobalSearchResults } from '@/src/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) {
    return NextResponse.json({
      results: {
        donors: [],
        requests: [],
        hospitals: [],
        bloodBanks: [],
        ambulances: [],
        volunteers: [],
        blogs: [],
        faqs: []
      }
    });
  }

  try {
    await ensureDbSeeded();

    // 1. Search Donors
    const allUsers = await db.select().from(dbUsers).where(eq(dbUsers.isAdmin, false));
    const matchedDonors = allUsers.filter((u) => {
      const nameMatch = u.name.toLowerCase().includes(q);
      const bloodGroupMatch = u.bloodGroup.toLowerCase().includes(q);
      const districtMatch = u.district.toLowerCase().includes(q);
      const upazilaMatch = u.upazila.toLowerCase().includes(q);
      const donorIdMatch = u.donorId ? u.donorId.toLowerCase().includes(q) : false;
      return nameMatch || bloodGroupMatch || districtMatch || upazilaMatch || donorIdMatch;
    }).slice(0, 5);

    const donorsResults: GlobalSearchResultItem[] = matchedDonors.map((u) => ({
      id: u.id,
      type: 'donor',
      title: u.name,
      subtitle: `${u.bloodGroup} • ${u.upazila}, ${u.district}`,
      badge: u.isAvailable ? 'Available' : 'Busy',
      details: u.phone
    }));

    // 2. Search Blood Requests
    const allRequests = await db.select().from(dbRequests);
    const matchedRequests = allRequests.filter((r) => {
      const patientMatch = r.patientName.toLowerCase().includes(q);
      const bgMatch = r.bloodGroup.toLowerCase().includes(q);
      const hospitalMatch = r.hospitalName.toLowerCase().includes(q);
      const districtMatch = r.district.toLowerCase().includes(q);
      return patientMatch || bgMatch || hospitalMatch || districtMatch;
    }).slice(0, 5);

    const requestsResults: GlobalSearchResultItem[] = matchedRequests.map((r) => ({
      id: r.id,
      type: 'request',
      title: `${r.bloodGroup} needed for ${r.patientName}`,
      subtitle: `${r.hospitalName}, ${r.district}`,
      badge: r.status.toUpperCase(),
      details: r.reason
    }));

    // 3. Search Hospitals
    const allHospitals = await db.select().from(dbHospitals);
    const matchedHospitals = allHospitals.filter((h) => {
      const nameMatch = h.name.toLowerCase().includes(q);
      const distMatch = h.district.toLowerCase().includes(q);
      const addrMatch = h.address.toLowerCase().includes(q);
      return nameMatch || distMatch || addrMatch;
    }).slice(0, 5);

    const hospitalsResults: GlobalSearchResultItem[] = matchedHospitals.map((h) => ({
      id: h.id,
      type: 'hospital',
      title: h.name,
      subtitle: `${h.type.toUpperCase()} • ${h.district}`,
      badge: h.isVerified ? 'VERIFIED' : undefined,
      details: h.address
    }));

    // 4. Search Blood Banks
    const allBloodBanks = await db.select().from(dbBloodBanks);
    const matchedBanks = allBloodBanks.filter((b) => {
      return b.name.toLowerCase().includes(q) || b.district.toLowerCase().includes(q);
    }).slice(0, 5);

    const bloodBanksResults: GlobalSearchResultItem[] = matchedBanks.map((b) => ({
      id: b.id,
      type: 'blood_bank',
      title: b.name,
      subtitle: `${b.district} • Contact: ${b.contactPhone}`,
      details: b.address
    }));

    // 5. Search Ambulances
    const allAmbulances = await db.select().from(dbAmbulances);
    const matchedAmbulances = allAmbulances.filter((a) => {
      return a.name.toLowerCase().includes(q) || a.district.toLowerCase().includes(q) || (a.driverName && a.driverName.toLowerCase().includes(q));
    }).slice(0, 5);

    const ambulancesResults: GlobalSearchResultItem[] = matchedAmbulances.map((a) => ({
      id: a.id,
      type: 'ambulance',
      title: a.name,
      subtitle: `${a.district} • ETA: ${a.averageResponseTime || '15 min'}`,
      badge: a.liveStatus || 'Available',
      details: a.contactPhone
    }));

    // 6. Search Blog Articles
    const allBlogs = await db.select().from(dbBlogs);
    const matchedBlogs = allBlogs.filter((b: any) => {
      const enTitle = b.en?.seoTitle || b.slug;
      return enTitle.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
    }).slice(0, 3);

    const blogsResults: GlobalSearchResultItem[] = matchedBlogs.map((b: any) => ({
      id: b.id,
      type: 'blog',
      title: b.en?.seoTitle || b.slug,
      subtitle: `Category: ${b.category}`,
      url: `/blog/${b.slug}`
    }));

    const results: GlobalSearchResults = {
      donors: donorsResults,
      requests: requestsResults,
      hospitals: hospitalsResults,
      bloodBanks: bloodBanksResults,
      ambulances: ambulancesResults,
      volunteers: [],
      blogs: blogsResults,
      faqs: []
    };

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return NextResponse.json({
      results: {
        donors: [], requests: [], hospitals: [], bloodBanks: [], ambulances: [], volunteers: [], blogs: [], faqs: []
      }
    });
  }
}
