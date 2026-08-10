import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { activityLogs as dbActivityLogs } from '@/src/db/schema';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';
import {
  getAllFeatureSettings,
  updateFeatureSetting,
  deriveFeatureStatus,
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
    console.error('[GET /api/admin/settings/features] Error:', error);
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
    const { featureKey, status, enabled, maintenanceMode } = body;

    if (!featureKey) {
      return NextResponse.json(
        { success: false, error: 'featureKey is required.' },
        { status: 400 }
      );
    }

    let targetEnabled = false;
    let targetMaintenance = false;

    if (status) {
      if (status === 'Public') {
        targetEnabled = true;
        targetMaintenance = false;
      } else if (status === 'Maintenance') {
        targetEnabled = true;
        targetMaintenance = true;
      } else if (status === 'Hidden') {
        targetEnabled = false;
        targetMaintenance = false;
      }
    } else {
      targetEnabled = typeof enabled === 'boolean' ? enabled : false;
      targetMaintenance = typeof maintenanceMode === 'boolean' ? maintenanceMode : false;
    }

    const updated = await updateFeatureSetting(
      featureKey,
      targetEnabled,
      targetMaintenance,
      admin.username
    );

    const derivedStatus = deriveFeatureStatus(targetEnabled, targetMaintenance);
    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    try {
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Updated Feature Visibility',
        details: `Set status of feature module "${featureKey}" to ${derivedStatus} (enabled: ${targetEnabled}, maintenance: ${targetMaintenance}).`,
      });
    } catch (logErr) {
      console.warn('[PATCH /api/admin/settings/features] Failed to write activity log:', logErr);
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Feature "${featureKey}" status updated to ${derivedStatus}.`,
    });
  } catch (error: any) {
    console.error('[PATCH /api/admin/settings/features] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update feature setting.' },
      { status: 500 }
    );
  }
}
