import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { users as dbUsers, notifications as dbNotifications } from '@/src/db/schema';
import { eq, sql } from 'drizzle-orm';
import { ensureDbSeeded, otps, getTransporter, broadcastSse } from '@/src/lib/server-backend';

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const body = await req.json();
    const { email } = body;
    if (!email) {
      return NextResponse.json({ error: 'Email is required to request an OTP.' }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otps.set(email.toLowerCase(), code);

    let isSmtpSent = false;
    const mailTransporter = getTransporter();

    if (mailTransporter) {
      try {
        await mailTransporter.sendMail({
          from: `"DonateLife BD" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Your DonateLife BD Verification Code',
          text: `Your secure 6-digit verification code is: ${code}. Please do not share this with anyone.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #1e293b; border-radius: 12px; background-color: #0f172a; color: #f8fafc;">
              <h2 style="color: #f43f5e; text-align: center; border-bottom: 2px solid #334155; padding-bottom: 10px;">DonateLife BD</h2>
              <p style="font-size: 16px; margin-top: 20px;">Hello,</p>
              <p style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">You have requested a secure verification code for your DonateLife BD account. Please use the following 6-digit code to complete the verification process:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f43f5e; background-color: #1e293b; padding: 10px 25px; border-radius: 8px; border: 1px solid #334155;">${code}</span>
              </div>
              <p style="font-size: 12px; color: #64748b; text-align: center;">This code will expire shortly. If you did not make this request, please disregard this email.</p>
              <hr style="border: none; border-top: 1px solid #334155; margin-top: 30px;">
              <p style="font-size: 11px; text-align: center; color: #475569;">© ${new Date().getFullYear()} DonateLife BD. All Rights Reserved.</p>
            </div>
          `,
        });
        isSmtpSent = true;
        console.log(`[SMTP DISPATCH SUCCESS] Real OTP email dispatched to ${email}`);
      } catch (mailError) {
        console.error('[SMTP DISPATCH ERROR] Failed to send real email via SMTP, falling back...', mailError);
      }
    } else {
      console.log(`[CONSOLE FALLBACK] SMTP settings not configured. OTP verification code ${code} printed to console for ${email}`);
    }

    const usersFound = await db
      .select()
      .from(dbUsers)
      .where(eq(sql`LOWER(${dbUsers.email})`, email.toLowerCase()));

    const user = usersFound[0];

    if (user) {
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const newNotif = {
        id: notifId,
        userId: user.id,
        title: 'DonateLife BD Security OTP',
        message: `Your secure 6-digit verification code is: ${code}. Do not share this with anyone.`,
        isRead: false,
        type: 'system',
        relatedId: 'system',
        createdAt: new Date(),
      };

      await db.insert(dbNotifications).values(newNotif);
      broadcastSse(user.id, newNotif);
    }

    return NextResponse.json({
      success: true,
      message: isSmtpSent
        ? `Verification code successfully dispatched to ${email} (via Real SMTP)`
        : `Verification code successfully dispatched to ${email} (Console Fallback Enabled)`,
      code,
    });
  } catch (error) {
    console.error('OTP Send error:', error);
    return NextResponse.json({ error: 'Internal server error sending OTP.' }, { status: 500 });
  }
}
