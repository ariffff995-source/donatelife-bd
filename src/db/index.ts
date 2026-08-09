import { drizzle } from 'drizzle-orm/node-postgres';
import Database from 'better-sqlite3';
import pkg from 'pg';
import * as schema from './schema';

const { Pool } = pkg;

let dbInstance: any = null;
let sqliteDb: any = null;
let isMemDb = false;

// SQLite Table creation SQL statements for embedded fallback
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  police_station TEXT,
  last_donation_date TEXT,
  is_available INTEGER DEFAULT 1,
  is_admin INTEGER DEFAULT 0,
  avatar_url TEXT,
  is_email_verified INTEGER DEFAULT 0,
  is_phone_verified INTEGER DEFAULT 0,
  is_donor_verified INTEGER DEFAULT 0,
  is_verified INTEGER DEFAULT 0,
  verified_at TEXT,
  verified_by TEXT,
  verification_note TEXT,
  verification_document TEXT,
  verification_status TEXT DEFAULT 'none',
  facebook_url TEXT,
  show_facebook INTEGER DEFAULT 0,
  gender TEXT,
  address TEXT,
  password TEXT,
  favorite_ambulances TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_needed INTEGER NOT NULL,
  hospital_name TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  police_station TEXT,
  contact_phone TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  required_date TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  recipient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  donation_date TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  type TEXT NOT NULL,
  related_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  police_station TEXT,
  address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  services TEXT NOT NULL,
  type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blood_banks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  police_station TEXT,
  address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  available_groups TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT DEFAULT (datetime('now')),
  admin_username TEXT NOT NULL,
  admin_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS blogs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  tags TEXT NOT NULL,
  featured_image_idea TEXT NOT NULL,
  en TEXT NOT NULL,
  bn TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cms_content (
  id TEXT PRIMARY KEY,
  draft TEXT NOT NULL,
  published TEXT,
  is_published INTEGER DEFAULT 1,
  updated_by TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  uploaded_at TEXT DEFAULT (datetime('now')),
  uploaded_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ambulances (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  division TEXT NOT NULL,
  district TEXT NOT NULL,
  upazila TEXT NOT NULL,
  police_station TEXT,
  address TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  service_area TEXT,
  available_types TEXT NOT NULL,
  opening_hours TEXT,
  provider TEXT,
  is_available_247 INTEGER DEFAULT 1,
  whatsapp TEXT,
  google_maps_link TEXT,
  average_response_time TEXT,
  image_url TEXT,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  updated_at TEXT DEFAULT (datetime('now')),
  driver_name TEXT,
  org_logo_url TEXT,
  vehicle_number TEXT,
  starting_fare INTEGER,
  payment_methods TEXT,
  emergency_contact_person TEXT,
  live_status TEXT DEFAULT 'Available',
  average_rating TEXT DEFAULT '5.0',
  total_reviews INTEGER DEFAULT 0,
  reviews TEXT,
  coverage_radius INTEGER,
  is_featured INTEGER DEFAULT 0,
  total_calls INTEGER DEFAULT 0,
  total_wa_clicks INTEGER DEFAULT 0
);
`;

let tableInitPromise: Promise<void> | null = null;

function convertPgToSqlite(sql: string) {
  let s = sql.replace(/\$\d+/g, '?');
  s = s.replace(/NOW\(\)/gi, "datetime('now')");
  s = s.replace(/ILIKE/gi, 'LIKE');
  if (/^\s*insert\s+into/gi.test(s)) {
    s = s.replace(/\bdefault\b/gi, 'NULL');
  }
  return s;
}

function processParam(p: any) {
  if (p === null || p === undefined) return null;
  if (typeof p === 'boolean') return p ? 1 : 0;
  if (typeof p === 'object') {
    if (p instanceof Date) return p.toISOString();
    return JSON.stringify(p);
  }
  return p;
}

function processRow(row: any) {
  if (!row || typeof row !== 'object') return row;
  const newRow: any = Array.isArray(row) ? [...row] : { ...row };

  const parseVal = (val: any) => {
    if (val === 1 || val === '1') return true;
    if (val === 0 || val === '0') return false;
    if (typeof val === 'string') {
      if (val === 'true') return true;
      if (val === 'false') return false;
      if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('[') && val.endsWith(']'))) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
    }
    return val;
  };

  if (Array.isArray(newRow)) {
    return newRow.map(parseVal);
  }

  for (const k of Object.keys(newRow)) {
    newRow[k] = parseVal(newRow[k]);
  }
  return newRow;
}

export function getDb() {
  if (dbInstance) return dbInstance;

  const sqlHost = process.env.SQL_HOST;
  if (sqlHost && sqlHost !== 'localhost' && sqlHost !== '127.0.0.1') {
    try {
      const pool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        connectionTimeoutMillis: 5000,
      });
      dbInstance = drizzle(pool, { schema });
      return dbInstance;
    } catch (e) {
      console.warn('[DB] External PostgreSQL pool creation failed, falling back to embedded DB:', e);
    }
  }

  // Fallback to in-memory SQLite engine
  try {
    sqliteDb = new Database(':memory:');
    sqliteDb.pragma('journal_mode = WAL');

    const mockPool = {
      connect: (cb?: any) => {
        if (cb) cb(null, mockPool, () => {});
        return Promise.resolve(mockPool);
      },
      on: () => {},
      query: (queryConfig: any, values?: any, callback?: any) => {
        let text = typeof queryConfig === 'string' ? queryConfig : queryConfig.text;
        let rawParams = typeof queryConfig === 'object' && queryConfig.values ? queryConfig.values : (values || []);
        let rowMode = typeof queryConfig === 'object' ? queryConfig.rowMode : undefined;
        if (typeof values === 'function') callback = values;

        try {
          const sql = convertPgToSqlite(text);
          const params = rawParams.map(processParam);
          const stmt = sqliteDb.prepare(sql);
          let rows: any[];
          if (stmt.reader) {
            if (rowMode === 'array') {
              rows = stmt.raw().all(...params).map(processRow);
            } else {
              rows = stmt.all(...params).map(processRow);
            }
          } else {
            stmt.run(...params);
            rows = [];
          }
          const columns = stmt.reader && stmt.columns ? stmt.columns().map((c: any) => ({ name: c.name })) : [];
          const res = { rows, fields: columns, rowCount: rows.length };
          if (callback) callback(null, res);
          return Promise.resolve(res);
        } catch (err) {
          if (callback) callback(err);
          return Promise.reject(err);
        }
      },
    };

    dbInstance = drizzle(mockPool as any, { schema });
    isMemDb = true;
  } catch (err) {
    console.error('[DB] Failed to initialize embedded SQLite database:', err);
    throw err;
  }

  return dbInstance;
}

export async function ensureTablesCreated() {
  getDb();
  if (isMemDb && sqliteDb) {
    if (!tableInitPromise) {
      tableInitPromise = (async () => {
        try {
          sqliteDb.exec(CREATE_TABLES_SQL);
          console.log('[DB] Embedded SQLite tables initialized successfully.');
        } catch (err) {
          console.error('[DB] Failed to create tables in SQLite:', err);
        }
      })();
    }
    await tableInitPromise;
  }
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
