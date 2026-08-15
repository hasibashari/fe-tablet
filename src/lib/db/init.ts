import fs from 'fs'
import path from 'path'
import db, { pool } from './client'

export async function initializeDatabase() {
  const schemaPath = path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql')
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`)
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8')
  await db.query(schemaSql)
  console.log('✅ PostgreSQL database schema initialized successfully on Neon Database!')
}

// Auto execute if run directly via CLI (tsx src/lib/db/init.ts)
if (require.main === module || process.argv[1]?.includes('init.ts')) {
  initializeDatabase()
    .then(async () => {
      await pool.end()
      process.exit(0)
    })
    .catch(async (error) => {
      console.error('❌ Failed to initialize PostgreSQL database:', error)
      await pool.end()
      process.exit(1)
    })
}
