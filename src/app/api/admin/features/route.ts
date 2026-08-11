import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { activityLogs as dbActivityLogs } from '@/src/db/schema';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';
import {
  getAllFeatureSettings,
  updateFeatureSetting,
} from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const settings = await getAllFeatureSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error('[GET /api/admin/features] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch feature settings.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized admin access.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const featureKey = body.featureKey || body.feature_key;
    const status = body.status;
    const enabled = body.enabled;
    const maintenanceMode = body.maintenanceMode || body.maintenance_mode;

    if (!featureKey) {
      return NextResponse.json(
        { success: false, error: 'featureKey (or feature_key) is required.' },
        { status: 400 }
      );
    }

    let updated;
    if (status) {
      updated = await updateFeatureSetting(featureKey, status, undefined, admin.username);
    } else if (typeof enabled === 'boolean') {
      updated = await updateFeatureSetting(featureKey, enabled, Boolean(maintenanceMode), admin.username);
    } else {
      return NextResponse.json(
        { success: false, error: 'Either status or enabled state must be provided.' },
        { status: 400 }
      );
    }

    // Write activity log for admin auditing
    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    try {
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Updated Feature Visibility',
        details: `Set status of feature "${featureKey}" to ${updated.status}.`,
      });
    } catch (logErr) {
      console.warn('[PATCH /api/admin/features] Failed to write activity log:', logErr);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Feature "${featureKey}" status updated to ${updated.status}.`,
    });
  } catch (error: any) {
    console.error('[PATCH /api/admin/features] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update feature setting.' },
      { status: 500 }
    );
  }
}
