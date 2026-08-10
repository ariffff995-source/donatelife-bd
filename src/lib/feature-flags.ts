import { db } from '../db/index';
import { featureSettings as dbFeatureSettings } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { FeatureStatus, FeatureSetting } from '../types';

export interface ModuleDefinition {
  featureKey: string;
  name: string;
  category: 'active' | 'future';
  description: string;
}

export const INITIAL_MODULES: ModuleDefinition[] = [
  { featureKey: 'hospitals', name: 'Hospitals & Clinics', category: 'active', description: 'Public directory of medical centers, emergency wards, and departments.' },
  { featureKey: 'blood-banks', name: 'Blood Banks & Storage', category: 'active', description: 'Live blood group stock and blood bank contact directory.' },
  { featureKey: 'ambulances', name: 'Ambulance Directory', category: 'active', description: '24/7 emergency dispatch contact and ambulance fleet directory.' },
  
  // Future extension modules
  { featureKey: 'blog', name: 'Health & Donor Blog', category: 'future', description: 'Awareness blogs, medical guidelines, and donor stories.' },
  { featureKey: 'events', name: 'Blood Donation Drives', category: 'future', description: 'Community blood donation campaigns and event scheduling.' },
  { featureKey: 'volunteer', name: 'Volunteer Network', category: 'future', description: 'Volunteer onboarding, district coordinators, and area management.' },
  { featureKey: 'forum', name: 'Health Q&A Forum', category: 'future', description: 'Community medical Q&A and donor discussions.' },
  { featureKey: 'hospital-portal', name: 'Hospital Portal', category: 'future', description: 'Self-service requisition portal for verified medical institutions.' },
  { featureKey: 'blood-bank-portal', name: 'Blood Bank Inventory Portal', category: 'future', description: 'Live stock management portal for registered blood banks.' },
  { featureKey: 'ambulance-booking', name: 'Ambulance Booking System', category: 'future', description: 'Real-time GPS ambulance dispatch and instant booking.' },
  { featureKey: 'ai-assistant', name: 'AI Blood Assistant', category: 'future', description: 'Smart assistant for donor eligibility check and urgent help.' },
  { featureKey: 'certificates', name: 'Digital Donor Certificates', category: 'future', description: 'Automated donor recognition certificates and downloadable badges.' },
  { featureKey: 'qr-cards', name: 'Donor Digital QR Cards', category: 'future', description: 'Scannable digital identity cards with donor blood details.' },
  { featureKey: 'donation-ranking', name: 'Donor Leaderboard & Ranks', category: 'future', description: 'District and national donor honor roll ranking.' },
  { featureKey: 'notification-center', name: 'Realtime Alert Hub', category: 'future', description: 'Subscribed location-based push notification system.' },
];

export function deriveFeatureStatus(enabled: boolean, maintenanceMode: boolean): FeatureStatus {
  if (!enabled) return 'Hidden';
  if (maintenanceMode) return 'Maintenance';
  return 'Public';
}

/**
 * Ensures feature_settings table contains default rows for all initial modules.
 */
export async function ensureFeatureSettingsSeeded() {
  try {
    const existing = await db.select().from(dbFeatureSettings);
    const existingKeys = new Set(existing.map((f: any) => f.featureKey));

    const toInsert = INITIAL_MODULES.filter((m) => !existingKeys.has(m.featureKey)).map((m) => ({
      id: `feat-${m.featureKey}`,
      featureKey: m.featureKey,
      enabled: false, // Default is false as required by specification
      maintenanceMode: false,
      updatedBy: 'system',
      updatedAt: new Date(),
    }));

    if (toInsert.length > 0) {
      await db.insert(dbFeatureSettings).values(toInsert);
      console.log(`[FeatureSettings] Initialized ${toInsert.length} feature toggle settings.`);
    }
  } catch (err: any) {
    console.error('[FeatureSettings] Failed to seed feature settings:', err?.message || err);
  }
}

/**
 * Fetches all feature settings from DB and merges with initial definitions.
 */
export async function getAllFeatureSettings(): Promise<FeatureSetting[]> {
  try {
    await ensureFeatureSettingsSeeded();
    const rows = await db.select().from(dbFeatureSettings);

    const rowMap = new Map<string, any>();
    rows.forEach((r: any) => rowMap.set(r.featureKey, r));

    return INITIAL_MODULES.map((mod) => {
      const dbRow = rowMap.get(mod.featureKey);
      const enabled = dbRow ? Boolean(dbRow.enabled) : false;
      const maintenanceMode = dbRow ? Boolean(dbRow.maintenanceMode) : false;

      return {
        id: dbRow?.id || `feat-${mod.featureKey}`,
        featureKey: mod.featureKey,
        enabled,
        maintenanceMode,
        status: deriveFeatureStatus(enabled, maintenanceMode),
        updatedBy: dbRow?.updatedBy || 'system',
        updatedAt: dbRow?.updatedAt ? new Date(dbRow.updatedAt).toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[FeatureSettings] Error fetching all settings, returning fallback defaults:', err);
    return INITIAL_MODULES.map((mod) => ({
      id: `feat-${mod.featureKey}`,
      featureKey: mod.featureKey,
      enabled: false,
      maintenanceMode: false,
      status: 'Hidden' as const,
      updatedBy: 'system',
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Gets status for a specific feature key.
 */
export async function getFeatureSetting(featureKey: string): Promise<FeatureSetting> {
  try {
    const rows = await db
      .select()
      .from(dbFeatureSettings)
      .where(eq(dbFeatureSettings.featureKey, featureKey));

    if (rows && rows.length > 0) {
      const row = rows[0];
      const enabled = Boolean(row.enabled);
      const maintenanceMode = Boolean(row.maintenanceMode);
      return {
        id: row.id,
        featureKey: row.featureKey,
        enabled,
        maintenanceMode,
        status: deriveFeatureStatus(enabled, maintenanceMode),
        updatedBy: row.updatedBy || 'system',
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error(`[FeatureSettings] Error fetching setting for ${featureKey}:`, err);
  }

  return {
    id: `feat-${featureKey}`,
    featureKey,
    enabled: false,
    maintenanceMode: false,
    status: 'Hidden',
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Updates a feature setting in DB.
 */
export async function updateFeatureSetting(
  featureKey: string,
  enabled: boolean,
  maintenanceMode: boolean,
  updatedBy: string
): Promise<FeatureSetting> {
  await ensureFeatureSettingsSeeded();

  const existing = await db
    .select()
    .from(dbFeatureSettings)
    .where(eq(dbFeatureSettings.featureKey, featureKey));

  const id = existing[0]?.id || `feat-${featureKey}`;
  const now = new Date();

  if (existing.length > 0) {
    await db
      .update(dbFeatureSettings)
      .set({
        enabled,
        maintenanceMode,
        updatedBy,
        updatedAt: now,
      })
      .where(eq(dbFeatureSettings.featureKey, featureKey));
  } else {
    await db.insert(dbFeatureSettings).values({
      id,
      featureKey,
      enabled,
      maintenanceMode,
      updatedBy,
      updatedAt: now,
    });
  }

  return {
    id,
    featureKey,
    enabled,
    maintenanceMode,
    status: deriveFeatureStatus(enabled, maintenanceMode),
    updatedBy,
    updatedAt: now.toISOString(),
  };
}
