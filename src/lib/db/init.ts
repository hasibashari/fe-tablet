import fs from 'fs'
import path from 'path'
import db from './client'

export function initializeDatabase() {
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`)
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8')
  db.exec(schemaSql)
  console.log(' SQLite database schema initialized successfully at data/app.db')
}

// Auto execute if run directly via CLI (tsx src/lib/db/init.ts)
if (require.main === module || process.argv[1]?.includes('init.ts')) {
  try {
    initializeDatabase()
  } catch (error) {
    console.error('❌ Failed to initialize SQLite database:', error)
    process.exit(1)
  }
}
