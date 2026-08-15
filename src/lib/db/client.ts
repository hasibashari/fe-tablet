import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'app.db')

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Global declaration for Next.js hot-reloading singleton
declare global {
  var __sqlite_db: Database.Database | undefined
}

function createDatabaseConnection(): Database.Database {
  const db = new Database(DB_PATH, {
    verbose: process.env.NODE_ENV === 'development' ? undefined : undefined,
  })

  // Optimize performance and enforce integrity
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')

  // Ensure admin_nudges table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_nudges (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        schedule_id TEXT REFERENCES medication_schedules(id) ON DELETE SET NULL,
        medication_name TEXT,
        dosage TEXT,
        time_slot TEXT,
        message TEXT NOT NULL,
        channel TEXT NOT NULL DEFAULT 'app' CHECK(channel IN ('app', 'whatsapp')),
        status TEXT NOT NULL DEFAULT 'UNREAD' CHECK(status IN ('UNREAD', 'READ', 'DISMISSED')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_nudges_patient_status ON admin_nudges(patient_id, status);
  `)

  return db
}

const db = global.__sqlite_db || createDatabaseConnection()

if (process.env.NODE_ENV !== 'production') {
  global.__sqlite_db = db
}

export default db
