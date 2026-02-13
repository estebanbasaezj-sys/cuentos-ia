import { createClient, Client, InValue } from '@libsql/client';

const globalForDb = globalThis as unknown as { _db: Client | undefined; _initialized: boolean };

function getClient(): Client {
  if (!globalForDb._db) {
    if (process.env.TURSO_DATABASE_URL) {
      globalForDb._db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
    } else {
      globalForDb._db = createClient({
        url: 'file:./data/cuentos.db',
      });
    }
  }
  return globalForDb._db;
}

// Helper para queries - simula la API de better-sqlite3
export const db = {
  async get<T>(sql: string, ...params: unknown[]): Promise<T | undefined> {
    const client = getClient();
    const result = await client.execute({ sql, args: params as InValue[] });
    return result.rows[0] as T | undefined;
  },

  async all<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    const client = getClient();
    const result = await client.execute({ sql, args: params as InValue[] });
    return result.rows as T[];
  },

  async run(sql: string, ...params: unknown[]): Promise<void> {
    const client = getClient();
    await client.execute({ sql, args: params as InValue[] });
  },

  async execute(sql: string): Promise<void> {
    const client = getClient();
    await client.execute(sql);
  },
};

// Inicializar schema
export async function initializeDb() {
  if (globalForDb._initialized) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        password_hash TEXT,
        image TEXT,
        provider TEXT DEFAULT 'credentials',
        is_subscribed INTEGER DEFAULT 0,
        stories_today INTEGER DEFAULT 0,
        last_story_date TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS stories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        child_name TEXT NOT NULL,
        child_age_group TEXT NOT NULL,
        theme TEXT NOT NULL,
        tone TEXT NOT NULL,
        length TEXT NOT NULL,
        traits TEXT,
        status TEXT DEFAULT 'queued',
        generation_progress INTEGER DEFAULT 0,
        error_message TEXT,
        flagged_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        story_id TEXT NOT NULL,
        page_number INTEGER NOT NULL,
        text TEXT NOT NULL,
        image_url TEXT,
        image_prompt TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS shares (
        id TEXT PRIMARY KEY,
        story_id TEXT NOT NULL,
        share_token TEXT UNIQUE NOT NULL,
        expires_at TEXT NOT NULL,
        revoked INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    )`,
    `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        story_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
    )`,
    'CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status)',
    'CREATE INDEX IF NOT EXISTS idx_pages_story_id ON pages(story_id)',
    'CREATE INDEX IF NOT EXISTS idx_shares_token ON shares(share_token)',
    'CREATE INDEX IF NOT EXISTS idx_shares_story_id ON shares(story_id)',
    // --- Monetizacion ---
    `CREATE TABLE IF NOT EXISTS wallets (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        plan_type TEXT DEFAULT 'free',
        credits_balance INTEGER DEFAULT 0,
        monthly_credits_remaining INTEGER DEFAULT 0,
        monthly_credits_total INTEGER DEFAULT 0,
        renewal_date TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        subscription_status TEXT DEFAULT 'none',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )`,
    'CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id)',
    `CREATE TABLE IF NOT EXISTS credit_ledger (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        source TEXT NOT NULL,
        reference_id TEXT,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )`,
    'CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON credit_ledger(user_id)',
    `CREATE TABLE IF NOT EXISTS telemetry_events (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at TEXT DEFAULT (datetime('now'))
    )`,
    'CREATE INDEX IF NOT EXISTS idx_telemetry_type ON telemetry_events(event_type)',
  ];

  for (const stmt of statements) {
    await db.execute(stmt);
  }

  // Migraciones: agregar columnas a tablas existentes
  const migrations = [
    "ALTER TABLE stories ADD COLUMN credit_cost INTEGER DEFAULT 0",
    "ALTER TABLE stories ADD COLUMN image_quality TEXT DEFAULT 'standard'",
  ];
  for (const stmt of migrations) {
    try { await db.execute(stmt); } catch { /* columna ya existe */ }
  }

  globalForDb._initialized = true;
}

export default db;
