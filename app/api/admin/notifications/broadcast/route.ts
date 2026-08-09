import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import {
  users as dbUsers,
  notifications as dbNotifications,
  activityLogs as dbActivityLogs,
} from '@/src/db/schema';
import { eq, or, sql } from 'drizzle-orm';
import { getAuthAdmin, broadcastSse } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, bloodGroup, targetUser } = body;
    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required for broadcasting.' }, { status: 400 });
    }

    let targetUsers: any[] = [];
    let descriptionScope = 'all active platform users';

    if (targetUser) {
      targetUsers = await db
        .select()
        .from(dbUsers)
        .where(
          or(
            eq(dbUsers.id, targetUser),
            eq(sql`LOWER(${dbUsers.email})`, targetUser.toLowerCase())
          )
        );
      descriptionScope = `user "${targetUser}"`;
    } else if (bloodGroup) {
      targetUsers = await db
        .select()
        .from(dbUsers)
        .where(eq(dbUsers.bloodGroup, bloodGroup));
      descriptionScope = `all ${bloodGroup} registered donors`;
    } else {
      targetUsers = await db.select().from(dbUsers);
    }

    for (const u of targetUsers) {
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const bNotif = {
        id: notifId,
        userId: u.id,
        title,
        message,
        isRead: false,
        type: 'system',
        relatedId: 'broadcast',
        createdAt: new Date(),
      };
      await db.insert(dbNotifications).values(bNotif);
      broadcastSse(u.id, bNotif);
    }

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Dispatched Broadcast Notification',
      details: `Dispatched announcement "${title}" to ${descriptionScope} (${targetUsers.length} total recipients).`,
    });

    return NextResponse.json({ success: true, count: targetUsers.length });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    return NextResponse.json({ error: 'Internal server error dispatching broadcast.' }, { status: 500 });
  }
}
