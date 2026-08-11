import { db } from '../db/index';
import { featureFlags as dbFeatureFlags, featureSettings as dbFeatureSettings } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { FeatureStatus, FeatureSetting } from '../types';
import { broadcastRealtimeEvent } from './supabase';

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
  { featureKey: 'blog', name: 'Health & Donor Blog', category: 'active', description: 'Awareness blogs, medical guidelines, and donor stories.' },
  { featureKey: 'events', name: 'Blood Donation Drives', category: 'future', description: 'Community blood donation campaigns and event scheduling.' },
  { featureKey: 'volunteers', name: 'Volunteer Network', category: 'future', description: 'Volunteer onboarding, district coordinators, and area management.' },
  { featureKey: 'testimonials', name: 'Donor Testimonials', category: 'future', description: 'Patient stories and verified donor feedback.' },
  { featureKey: 'ai-features', name: 'AI Blood Assistant', category: 'future', description: 'Smart assistant for donor eligibility check and urgent help.' },
  { featureKey: 'notifications', name: 'Realtime Alert Hub', category: 'future', description: 'Subscribed location-based push notification system.' },
  { featureKey: 'maps', name: 'Interactive Donor Maps', category: 'future', description: 'Live geographic donor and emergency request maps.' },
  { featureKey: 'qr-cards', name: 'Donor Digital QR Cards', category: 'future', description: 'Scannable digital identity cards with donor blood details.' },
  { featureKey: 'certificates', name: 'Digital Donor Certificates', category: 'future', description: 'Automated donor recognition certificates and downloadable badges.' },
];

// Key alias resolution for flexible lookup
export function normalizeFeatureKey(key: string): string {
  const k = key.trim().toLowerCase();
  if (k === 'blogs') return 'blog';
  if (k === 'volunteer') return 'volunteers';
  if (k === 'ai_features' || k === 'ai-assistant' || k === 'ai_assistant') return 'ai-features';
  if (k === 'qr_cards' || k === 'qr-card' || k === 'qr_card') return 'qr-cards';
  if (k === 'notification-center' || k === 'notification') return 'notifications';
  if (k === 'hospital') return 'hospitals';
  if (k === 'blood-bank' || k === 'blood_bank' || k === 'blood_banks') return 'blood-banks';
  if (k === 'ambulance') return 'ambulances';
  if (k === 'testimonial') return 'testimonials';
  if (k === 'certificate') return 'certificates';
  if (k === 'map') return 'maps';
  if (k === 'event') return 'events';
  return k;
}

export function deriveFeatureStatus(enabled: boolean, maintenanceMode: boolean): FeatureStatus {
  if (!enabled) return 'Hidden';
  if (maintenanceMode) return 'Maintenance';
  return 'Public';
}

export function normalizeStatus(rawStatus: string): FeatureStatus {
  const s = rawStatus ? rawStatus.toLowerCase() : 'public';
  if (s === 'maintenance') return 'Maintenance';
  if (s === 'hidden') return 'Hidden';
  return 'Public';
}

/**
 * Ensures feature_flags table exists in PostgreSQL and is seeded with defaults.
 */
export async function ensureFeatureSettingsSeeded() {
  try {
    // 1. Ensure table exists in DB with correct snake_case columns
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id TEXT PRIMARY KEY,
        feature_key TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'public',
        updated_by TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS feature_key TEXT;
      ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'public';
      ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS updated_by TEXT;
      ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feature_flags' AND column_name='featureKey') THEN
          EXECUTE 'UPDATE feature_flags SET feature_key = "featureKey" WHERE feature_key IS NULL';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feature_flags' AND column_name='updatedBy') THEN
          EXECUTE 'UPDATE feature_flags SET updated_by = "updatedBy" WHERE updated_by IS NULL';
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='feature_flags' AND column_name='updatedAt') THEN
          EXECUTE 'UPDATE feature_flags SET updated_at = "updatedAt" WHERE updated_at IS NULL';
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END $$;
    `);

    // Also legacy feature_settings table fallback
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feature_settings (
        id TEXT PRIMARY KEY,
        feature_key TEXT NOT NULL UNIQUE,
        enabled BOOLEAN NOT NULL DEFAULT FALSE,
        maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
        updated_by TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Fetch existing keys from feature_flags
    const existing = await db.select().from(dbFeatureFlags);
    const existingKeys = new Set(existing.map((f: any) => f.featureKey));

    const toInsert = INITIAL_MODULES.filter((m) => !existingKeys.has(m.featureKey)).map((m) => ({
      id: `feat-${m.featureKey}`,
      featureKey: m.featureKey,
      status: m.category === 'active' ? 'public' : 'hidden',
      updatedBy: 'system',
      updatedAt: new Date(),
    }));

    if (toInsert.length > 0) {
      await db.insert(dbFeatureFlags).values(toInsert as any);
      console.log(`[FeatureFlags] Initialized ${toInsert.length} feature flag settings in feature_flags.`);
    }

    // Seed feature_settings table as well for legacy sync
    const existingLegacy = await db.select().from(dbFeatureSettings);
    const existingLegacyKeys = new Set(existingLegacy.map((f: any) => f.featureKey));
    const toInsertLegacy = INITIAL_MODULES.filter((m) => !existingLegacyKeys.has(m.featureKey)).map((m) => ({
      id: `feat-${m.featureKey}`,
      featureKey: m.featureKey,
      enabled: m.category === 'active',
      maintenanceMode: false,
      updatedBy: 'system',
      updatedAt: new Date(),
    }));
    if (toInsertLegacy.length > 0) {
      await db.insert(dbFeatureSettings).values(toInsertLegacy as any);
    }
  } catch (err: any) {
    console.error('[FeatureFlags] Failed to seed feature settings:', err?.message || err);
  }
}

/**
 * Fetches all feature settings from DB and merges with initial definitions.
 */
export async function getAllFeatureSettings(): Promise<FeatureSetting[]> {
  try {
    await ensureFeatureSettingsSeeded();
    const rows = await db.select().from(dbFeatureFlags);

    const rowMap = new Map<string, any>();
    rows.forEach((r: any) => rowMap.set(r.featureKey, r));

    return INITIAL_MODULES.map((mod) => {
      const dbRow = rowMap.get(mod.featureKey);
      const rawStatus = dbRow?.status || (mod.category === 'active' ? 'public' : 'hidden');
      const status = normalizeStatus(rawStatus);

      const enabled = status !== 'Hidden';
      const maintenanceMode = status === 'Maintenance';

      return {
        id: dbRow?.id || `feat-${mod.featureKey}`,
        featureKey: mod.featureKey,
        enabled,
        maintenanceMode,
        status,
        updatedBy: dbRow?.updatedBy || 'system',
        updatedAt: dbRow?.updatedAt ? new Date(dbRow.updatedAt).toISOString() : new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('[FeatureFlags] Error fetching all settings, returning fallback defaults:', err);
    return INITIAL_MODULES.map((mod) => ({
      id: `feat-${mod.featureKey}`,
      featureKey: mod.featureKey,
      enabled: mod.category === 'active',
      maintenanceMode: false,
      status: mod.category === 'active' ? ('Public' as const) : ('Hidden' as const),
      updatedBy: 'system',
      updatedAt: new Date().toISOString(),
    }));
  }
}

/**
 * Gets status for a specific feature key.
 */
export async function getFeatureSetting(rawFeatureKey: string): Promise<FeatureSetting> {
  const featureKey = normalizeFeatureKey(rawFeatureKey);
  try {
    await ensureFeatureSettingsSeeded();
    const rows = await db
      .select()
      .from(dbFeatureFlags)
      .where(eq(dbFeatureFlags.featureKey, featureKey));

    if (rows && rows.length > 0) {
      const row = rows[0];
      const status = normalizeStatus(row.status);
      const enabled = status !== 'Hidden';
      const maintenanceMode = status === 'Maintenance';
      return {
        id: row.id,
        featureKey: row.featureKey,
        enabled,
        maintenanceMode,
        status,
        updatedBy: row.updatedBy || 'system',
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error(`[FeatureFlags] Error fetching setting for ${featureKey}:`, err);
  }

  const isDefaultActive = ['hospitals', 'blood-banks', 'ambulances', 'blog'].includes(featureKey);
  const defaultStatus: FeatureStatus = isDefaultActive ? 'Public' : 'Hidden';

  return {
    id: `feat-${featureKey}`,
    featureKey,
    enabled: isDefaultActive,
    maintenanceMode: false,
    status: defaultStatus,
    updatedBy: 'system',
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Updates a feature setting in DB (feature_flags & feature_settings tables) and broadcasts via Supabase Realtime.
 */
export async function updateFeatureSetting(
  rawFeatureKey: string,
  targetEnabled: boolean | string,
  targetMaintenance?: boolean,
  updatedBy: string = 'admin'
): Promise<FeatureSetting> {
  const featureKey = normalizeFeatureKey(rawFeatureKey);
  await ensureFeatureSettingsSeeded();

  let finalStatus: FeatureStatus = 'Public';
  if (typeof targetEnabled === 'string') {
    finalStatus = normalizeStatus(targetEnabled);
  } else {
    finalStatus = deriveFeatureStatus(targetEnabled, Boolean(targetMaintenance));
  }

  const dbStatusString = finalStatus.toLowerCase(); // 'public' | 'hidden' | 'maintenance'
  const enabledBool = finalStatus !== 'Hidden';
  const maintenanceBool = finalStatus === 'Maintenance';

  const existing = await db
    .select()
    .from(dbFeatureFlags)
    .where(eq(dbFeatureFlags.featureKey, featureKey));

  const id = existing[0]?.id || `feat-${featureKey}`;
  const now = new Date();

  // 1. Write to feature_flags
  if (existing.length > 0) {
    await db
      .update(dbFeatureFlags)
      .set({
        status: dbStatusString,
        updatedBy,
        updatedAt: now,
      })
      .where(eq(dbFeatureFlags.featureKey, featureKey));
  } else {
    await db.insert(dbFeatureFlags).values({
      id,
      featureKey,
      status: dbStatusString,
      updatedBy,
      updatedAt: now,
    });
  }

  // 2. Also write to feature_settings for legacy compatibility
  try {
    const existingLegacy = await db
      .select()
      .from(dbFeatureSettings)
      .where(eq(dbFeatureSettings.featureKey, featureKey));

    if (existingLegacy.length > 0) {
      await db
        .update(dbFeatureSettings)
        .set({
          enabled: enabledBool,
          maintenanceMode: maintenanceBool,
          updatedBy,
          updatedAt: now,
        })
        .where(eq(dbFeatureSettings.featureKey, featureKey));
    } else {
      await db.insert(dbFeatureSettings).values({
        id,
        featureKey,
        enabled: enabledBool,
        maintenanceMode: maintenanceBool,
        updatedBy,
        updatedAt: now,
      });
    }
  } catch (legacyErr) {
    console.warn('[FeatureFlags] Legacy feature_settings sync error:', legacyErr);
  }

  const resultSetting: FeatureSetting = {
    id,
    featureKey,
    enabled: enabledBool,
    maintenanceMode: maintenanceBool,
    status: finalStatus,
    updatedBy,
    updatedAt: now.toISOString(),
  };

  // 3. Broadcast real-time change event to all clients via Supabase Realtime
  broadcastRealtimeEvent('feature_flags', 'feature_update', {
    featureKey,
    status: finalStatus,
    enabled: enabledBool,
    maintenanceMode: maintenanceBool,
    updatedBy,
    updatedAt: now.toISOString(),
  });

  return resultSetting;
}
