import { NextResponse } from 'next/server';
import { ensureDbSeeded } from '@/src/lib/server-backend';
import { getAllFeatureSettings } from '@/src/lib/feature-flags';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await ensureDbSeeded();
    const settings = await getAllFeatureSettings();
    
    // Map array into key-value map for fast frontend lookup
    const map: Record<string, { enabled: boolean; maintenanceMode: boolean; status: string }> = {};
    settings.forEach((item) => {
      map[item.featureKey] = {
        enabled: item.enabled,
        maintenanceMode: item.maintenanceMode,
        status: item.status,
      };
    });

    return NextResponse.json({
      success: true,
      data: settings,
      map,
    });
  } catch (error: any) {
    console.error('[GET /api/settings/features] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch public feature settings.' },
      { status: 500 }
    );
  }
}
