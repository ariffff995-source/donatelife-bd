import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthUser } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { document } = body;
    if (!document) {
      return NextResponse.json({ error: 'Medical verification document/ID card is required.' }, { status: 400 });
    }

    await db
      .update(dbUsers)
      .set({ verificationStatus: 'pending', verificationDocument: document })
      .where(eq(dbUsers.id, user.id));

    const updatedResults = await db.select().from(dbUsers).where(eq(dbUsers.id, user.id));
    return NextResponse.json({ success: true, user: updatedResults[0] });
  } catch (error) {
    console.error('Submit verification error:', error);
    return NextResponse.json({ error: 'Internal server error submitting verification.' }, { status: 500 });
  }
}
