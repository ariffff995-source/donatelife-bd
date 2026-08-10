import { db } from '../db/index';
import {
  users as dbUsers,
  notifications as dbNotifications,
  notificationLogs as dbNotificationLogs,
  requests as dbRequests,
} from '../db/schema';
import { eq, and, ne, or, sql } from 'drizzle-orm';
import { broadcastSse, getTransporter } from './server-backend';

export interface BloodRequestMatchPayload {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospitalName: string;
  division: string;
  district: string;
  upazila: string;
  contactPhone: string;
  reason: string;
  requiredDate: string;
}

/**
 * Sends formatted HTML email using Resend API or Nodemailer SMTP fallback
 */
async function sendMatchEmail(recipient: { email: string; name: string; donorId?: string | null }, reqData: BloodRequestMatchPayload) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://donatelifebd.com';
  const requestUrl = `${siteUrl}/requests`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 560px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .header { text-align: center; border-b: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { color: #f43f5e; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { display: inline-block; background: #f43f5e; color: #ffffff; font-weight: 900; font-size: 18px; padding: 6px 16px; border-radius: 8px; margin: 12px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
          .info-table td { padding: 10px; border-bottom: 1px solid #334155; color: #cbd5e1; }
          .info-table td.label { font-weight: 700; color: #94a3b8; width: 40%; }
          .btn-group { text-align: center; margin-top: 28px; }
          .btn { display: inline-block; padding: 12px 24px; font-weight: 700; text-decoration: none; border-radius: 10px; font-size: 14px; margin: 6px; }
          .btn-primary { background: #f43f5e; color: #ffffff; }
          .btn-secondary { background: #10b981; color: #ffffff; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #334155; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div class="logo">DonateLife BD</div>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Emergency Voluntary Blood Match Alert</p>
          </div>
          
          <p style="font-size: 15px; font-weight: 600;">Dear ${recipient.name},</p>
          <p style="font-size: 14px; color: #cbd5e1; leading-height: 1.5;">
            An urgent blood transfusion is required for a matching recipient in your location area.
          </p>

          <div style="text-align: center;">
            <span class="badge">${reqData.bloodGroup} Needed (${reqData.unitsNeeded} ${reqData.unitsNeeded > 1 ? 'Units' : 'Unit'})</span>
          </div>

          <table class="info-table">
            <tr>
              <td class="label">Patient Name:</td>
              <td><strong>${reqData.patientName}</strong></td>
            </tr>
            <tr>
              <td class="label">Hospital / Center:</td>
              <td>${reqData.hospitalName}</td>
            </tr>
            <tr>
              <td class="label">Location:</td>
              <td>${reqData.upazila}, ${reqData.district}, ${reqData.division}</td>
            </tr>
            <tr>
              <td class="label">Required Date:</td>
              <td>${reqData.requiredDate}</td>
            </tr>
            <tr>
              <td class="label">Contact Person Phone:</td>
              <td><strong style="color: #34d399;">${reqData.contactPhone}</strong></td>
            </tr>
            <tr>
              <td class="label">Clinical Reason:</td>
              <td>${reqData.reason}</td>
            </tr>
          </table>

          <div class="btn-group">
            <a href="${requestUrl}" class="btn btn-primary">View Full Request Details</a>
            <a href="tel:${reqData.contactPhone}" class="btn btn-secondary">I Can Donate (Call Now)</a>
          </div>

          <div class="footer">
            <p>You received this emergency message because your DonateLife BD profile is set to Available and Verified.</p>
            <p>© DonateLife BD Emergency Network, Bangladesh.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Resend API integration (if RESEND_API_KEY is present)
  if (process.env.RESEND_API_KEY) {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'DonateLife BD Alert <alert@donatelifebd.com>',
        to: [recipient.email],
        subject: `[URGENT] ${reqData.bloodGroup} Blood Required at ${reqData.hospitalName}`,
        html: htmlContent,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      throw new Error(`Resend API HTTP error: ${resendRes.status} - ${errText}`);
    }

    return { provider: 'resend', success: true };
  }

  // Nodemailer SMTP fallback (if SMTP config is present)
  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"DonateLife BD Alert" <no-reply@donatelifebd.com>',
      to: recipient.email,
      subject: `[URGENT] ${reqData.bloodGroup} Blood Required at ${reqData.hospitalName}`,
      html: htmlContent,
    });
    return { provider: 'smtp', success: true };
  }

  // If no email server is configured in environment, log attempt gracefully
  console.log(`[Email Notice] Simulated dispatch to ${recipient.email} for request ${reqData.id}`);
  return { provider: 'simulated', success: true };
}

/**
 * Dispatches In-App, Email, and Future Alerts for an approved blood request to eligible donors.
 * Strictly prevents duplicate emails for the same request to the same donor.
 */
export async function dispatchNotificationsForRequest(approvedReq: BloodRequestMatchPayload) {
  try {
    // Query matching verified, available, non-blocked donors
    const matchingDonors = await db
      .select()
      .from(dbUsers)
      .where(
        and(
          eq(dbUsers.bloodGroup, approvedReq.bloodGroup),
          eq(dbUsers.division, approvedReq.division),
          eq(dbUsers.district, approvedReq.district),
          eq(dbUsers.isAvailable, true),
          ne(dbUsers.verificationStatus, 'blocked')
        )
      );

    for (const donor of matchingDonors) {
      // 1. In-App Notification (Instant)
      const notifId = 'notif-' + Math.floor(100000 + Math.random() * 900000);
      const donorNotif = {
        id: notifId,
        userId: donor.id,
        title: `Urgent ${approvedReq.bloodGroup} Match Alert!`,
        message: `Patient ${approvedReq.patientName} needs ${approvedReq.unitsNeeded} unit(s) of ${approvedReq.bloodGroup} blood at ${approvedReq.hospitalName}, ${approvedReq.upazila}.`,
        isRead: false,
        type: 'request_match',
        relatedId: approvedReq.id,
        createdAt: new Date(),
      };

      await db.insert(dbNotifications).values(donorNotif);
      broadcastSse(donor.id, donorNotif);

      // 2. Check Notification Logs to prevent duplicate email dispatches
      const existingLogs = await db
        .select()
        .from(dbNotificationLogs)
        .where(
          and(
            eq(dbNotificationLogs.donorId, donor.id),
            eq(dbNotificationLogs.requestId, approvedReq.id),
            eq(dbNotificationLogs.type, 'email')
          )
        );

      if (existingLogs.length > 0) {
        console.log(`[NotificationQueue] Skipped duplicate email for donor ${donor.id} on request ${approvedReq.id}`);
        continue;
      }

      // Check if donor has enabled email notifications
      if (donor.notifyEmail !== false && donor.email) {
        const logId = 'nlog-' + Math.floor(100000 + Math.random() * 900000);
        try {
          await sendMatchEmail({ email: donor.email, name: donor.name, donorId: donor.donorId }, approvedReq);

          await db.insert(dbNotificationLogs).values({
            id: logId,
            donorId: donor.donorId || donor.id,
            requestId: approvedReq.id,
            type: 'email',
            recipientEmail: donor.email,
            status: 'sent',
            sentAt: new Date(),
            errorMessage: null,
            createdAt: new Date(),
          });
        } catch (err: any) {
          console.error(`[NotificationQueue] Email failed for donor ${donor.id}:`, err?.message || err);

          await db.insert(dbNotificationLogs).values({
            id: logId,
            donorId: donor.donorId || donor.id,
            requestId: approvedReq.id,
            type: 'email',
            recipientEmail: donor.email,
            status: 'failed',
            sentAt: new Date(),
            errorMessage: String(err?.message || err).slice(0, 255),
            createdAt: new Date(),
          });
        }
      }
    }
  } catch (err) {
    console.error('Error dispatching notifications for blood request:', err);
  }
}

/**
 * Retries all failed notification logs
 */
export async function retryFailedNotifications() {
  const failedLogs = await db
    .select()
    .from(dbNotificationLogs)
    .where(eq(dbNotificationLogs.status, 'failed'));

  let retriedCount = 0;
  let successCount = 0;

  for (const log of failedLogs) {
    retriedCount++;
    const [reqObj] = await db.select().from(dbRequests).where(eq(dbRequests.id, log.requestId));

    if (!reqObj || !log.recipientEmail) {
      await db
        .update(dbNotificationLogs)
        .set({ status: 'failed', errorMessage: 'Associated request or email address missing' })
        .where(eq(dbNotificationLogs.id, log.id));
      continue;
    }

    try {
      await sendMatchEmail({ email: log.recipientEmail, name: 'Volunteer Donor' }, reqObj);

      await db
        .update(dbNotificationLogs)
        .set({ status: 'sent', sentAt: new Date(), errorMessage: null })
        .where(eq(dbNotificationLogs.id, log.id));

      successCount++;
    } catch (err: any) {
      await db
        .update(dbNotificationLogs)
        .set({ sentAt: new Date(), errorMessage: String(err?.message || err).slice(0, 255) })
        .where(eq(dbNotificationLogs.id, log.id));
    }
  }

  return { totalRetried: retriedCount, successful: successCount };
}
