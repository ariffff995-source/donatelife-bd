import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { requests as dbRequests } from '@/src/db/schema';
import { getAuthUserStrict, getAuthAdmin } from '@/src/lib/server-backend';
import { eq } from 'drizzle-orm';
import { RequestTimelineEvent } from '@/src/types';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const requestId = resolvedParams.id;
    const user = await getAuthUserStrict(req);
    const admin = await getAuthAdmin(req);

    if (!user && !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { newStatus, note } = body;

    if (!newStatus) {
      return NextResponse.json({ error: 'newStatus is required' }, { status: 400 });
    }

    const existingRows = await db
      .select()
      .from(dbRequests)
      .where(eq(dbRequests.id, requestId));

    if (!existingRows[0]) {
      return NextResponse.json({ error: 'Blood request not found' }, { status: 404 });
    }

    const requestObj = existingRows[0];

    // Build updated timeline array
    const existingTimeline: RequestTimelineEvent[] = (requestObj.timeline as any) || [
      {
        status: 'created',
        label: 'Request Created',
        timestamp: new Date(requestObj.createdAt).toISOString()
      }
    ];

    const newEvent: RequestTimelineEvent = {
      status: newStatus,
      label: getStatusLabel(newStatus),
      timestamp: new Date().toISOString(),
      note: note || undefined,
      updatedBy: admin ? admin.name : user?.name
    };

    const updatedTimeline = [...existingTimeline, newEvent];

    const updateFields: any = {
      status: newStatus,
      timeline: updatedTimeline
    };

    if (newStatus === 'accepted') updateFields.donorAcceptedAt = new Date();
    if (newStatus === 'donated') updateFields.donatedAt = new Date();
    if (newStatus === 'fulfilled') updateFields.completedAt = new Date();
    if (newStatus === 'cancelled' || newStatus === 'rejected') updateFields.cancelledAt = new Date();

    await db
      .update(dbRequests)
      .set(updateFields)
      .where(eq(dbRequests.id, requestId));

    return NextResponse.json({ success: true, timeline: updatedTimeline });
  } catch (error) {
    console.error('Error updating request timeline:', error);
    return NextResponse.json({ error: 'Failed to update timeline' }, { status: 500 });
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'approved': return 'Request Approved';
    case 'matched': return 'Donor Matched';
    case 'accepted': return 'Donor Accepted';
    case 'donated': return 'Blood Donated';
    case 'fulfilled': return 'Completed';
    case 'cancelled': return 'Request Cancelled';
    case 'rejected': return 'Request Rejected';
    default: return status;
  }
}
