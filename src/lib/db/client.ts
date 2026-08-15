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

  return db
}

const db = global.__sqlite_db || createDatabaseConnection()

if (process.env.NODE_ENV !== 'production') {
  global.__sqlite_db = db
}

export default db
