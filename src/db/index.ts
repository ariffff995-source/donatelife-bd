import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let dbInstance: any = null;
let sqlClient: any = null;

export function getDb() {
  if (dbInstance) return dbInstance;

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.warn('[DB] DATABASE_URL is missing. Please configure DATABASE_URL in environment variables.');
    // Lazy client to prevent build-time crashes when secrets are injected at runtime
    sqlClient = postgres('postgresql://postgres:postgres@localhost:5432/postgres', {
      prepare: false,
      max: 1,
      connect_timeout: 3,
      idle_timeout: 5,
    });
    dbInstance = drizzle(sqlClient, { schema });
    return dbInstance;
  }

  // Supabase PostgreSQL connection via postgres.js
  sqlClient = postgres(connectionString, {
    prepare: false, // Disables prepared statements for PgBouncer / Transaction pooler compatibility
    ssl: 'require',  // Enforces SSL for Supabase cloud database connection
    connect_timeout: 3,
    idle_timeout: 10,
  });
  dbInstance = drizzle(sqlClient, { schema });
  return dbInstance;
}

export async function ensureTablesCreated() {
  // Tables in Supabase PostgreSQL are managed via Drizzle migrations
  return Promise.resolve();
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
