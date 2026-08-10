import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { requests as dbRequests } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUserStrict } from '@/src/lib/server-backend';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserStrict(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const campaigns = await db.select().from(dbRequests).where(eq(dbRequests.id, id));
    const reqToUpdate = campaigns[0];

    if (!reqToUpdate) {
      return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
    }

    if (reqToUpdate.userId !== user.id && !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await db
      .update(dbRequests)
      .set({ status })
      .where(eq(dbRequests.id, id));

    reqToUpdate.status = status;
    return NextResponse.json(reqToUpdate);
  } catch (error) {
    console.error('Update request status error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
