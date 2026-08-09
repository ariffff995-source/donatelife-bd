import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  requests as dbRequests,
  users as dbUsers,
  notifications as dbNotifications,
} from '@/src/db/schema';
import { eq, ne, or, and, desc } from 'drizzle-orm';
import { getAuthUserStrict, ensureDbSeeded, broadcastSse } from '@/src/lib/server-backend';

export async function GET(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const user = await getAuthUserStrict(req);

    if (user && user.isAdmin) {
      const results = await db.select().from(dbRequests).orderBy(desc(dbRequests.createdAt));
      return NextResponse.json(results);
    }

    const conditions = [
      and(
        ne(dbRequests.status, 'pending_approval'),
        ne(dbRequests.status, 'rejected')
      ),
    ];
    if (user) {
      conditions.push(eq(dbRequests.userId, user.id));
    }

    const results = await db
      .select()
      .from(dbRequests)
      .where(or(...conditions))
      .orderBy(desc(dbRequests.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.warn('List requests fallback:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const user = await getAuthUserStrict(req);
    const body = await req.json();
    const {
      patientName,
      bloodGroup,
      unitsNeeded,
      hospitalName,
      division,
      district,
      upazila,
      contactPhone,
      reason,
      requiredDate,
    } = body;

    if (!patientName || !bloodGroup || !contactPhone || !hospitalName) {
      return NextResponse.json(
        { error: 'Please complete all mandatory blood request fields.' },
        { status: 400 }
      );
    }

    const reqId = 'req-' + Math.floor(100000 + Math.random() * 900000);
    const newRequest = {
      id: reqId,
      userId: user ? user.id : 'guest-user',
      patientName,
      bloodGroup,
      unitsNeeded: unitsNeeded ? Number(unitsNeeded) : 1,
      hospitalName,
      division: division || 'Dhaka',
      district: district || 'Dhaka',
      upazila: upazila || 'Dhanmondi',
      contactPhone,
      reason: reason || 'Emergency transfusion requirement.',
      status: 'pending_approval',
      requiredDate: requiredDate || new Date().toISOString().split('T')[0],
      createdAt: new Date(),
    };

    await db.insert(dbRequests).values(newRequest);

    const allAdmins = await db.select().from(dbUsers).where(eq(dbUsers.isAdmin, true));
    for (const admin of allAdmins) {
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const adminNotif = {
        id: notifId,
        userId: admin.id,
        title: 'New Request Awaiting Review',
        message: `A blood request for ${patientName} (${bloodGroup}) at ${hospitalName} requires administrative verification.`,
        isRead: false,
        type: 'system',
        relatedId: newRequest.id,
        createdAt: new Date(),
      };

      await db.insert(dbNotifications).values(adminNotif);
      broadcastSse(admin.id, adminNotif);
    }

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Internal server error creating blood request.' }, { status: 500 });
  }
}
