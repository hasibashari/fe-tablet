import fs from 'fs'
import path from 'path'
import db from './client'
import { initializeDatabase } from './init'

export function seedDatabase() {
  console.log(' Starting database seeding from seedData.json...')

  // Ensure schema exists
  initializeDatabase()

  // Load JSON seed data
  const dataPath = path.join(process.cwd(), 'src', 'lib', 'db', 'seedData.json')
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Seed data file not found at: ${dataPath}`)
  }

  const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

  // Helper date offset
  const getOffsetDate = (offsetDays: number = 0): string => {
    const d = new Date()
    d.setDate(d.getDate() + offsetDays)
    return d.toISOString().split('T')[0]
  }

  const today = getOffsetDate(0)

  // Atomic database transaction
  const seedTransaction = db.transaction(() => {
    // 1. Users
    console.log('  -> Seeding users...')
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (
        id, name, email, password_hash, role, phone, avatar, title, age, gender, date_of_birth, blood_type, height, weight, assigned_doctor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const u of seedData.users) {
      insertUser.run(
        u.id,
        u.name,
        u.email,
        u.passwordHash ?? null,
        u.role,
        u.phone ?? null,
        u.avatar ?? null,
        u.title ?? null,
        u.age ?? null,
        u.gender ?? null,
        u.dateOfBirth ?? null,
        u.bloodType ?? null,
        u.height ?? null,
        u.weight ?? null,
        u.assignedDoctorId ?? null
      )
    }

    // 2. Patient Profiles
    console.log('  -> Seeding patient profiles...')
    const insertPatientProfile = db.prepare(`
      INSERT OR REPLACE INTO patient_profiles (
        user_id, risk_level, status, medical_notes, last_reminder_sent, last_active, join_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    for (const p of seedData.patientProfiles) {
      insertPatientProfile.run(
        p.userId,
        p.riskLevel,
        p.status,
        p.medicalNotes ?? null,
        today + ' 08:00',
        today + ' 08:30',
        p.joinDate
      )
    }

    // 3. Products
    console.log('  -> Seeding products...')
    const insertProduct = db.prepare(`
      INSERT OR REPLACE INTO products (
        id, name, category, sku, stock, unit, price, status, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const prod of seedData.products) {
      insertProduct.run(
        prod.id,
        prod.name,
        prod.category,
        prod.sku,
        prod.stock,
        prod.unit,
        prod.price,
        prod.status,
        prod.description ?? null
      )
    }

    // 4. Medication Schedules & Time Slots
    console.log('  -> Seeding medication schedules...')
    const insertSchedule = db.prepare(`
      INSERT OR REPLACE INTO medication_schedules (
        id, patient_id, product_id, medication_name, dosage, frequency, start_date, end_date, status, category, instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertTimeSlot = db.prepare(`
      INSERT INTO schedule_time_slots (schedule_id, time) VALUES (?, ?)
    `)

    for (const sch of seedData.medicationSchedules) {
      insertSchedule.run(
        sch.id,
        sch.patientId,
        sch.productId ?? null,
        sch.medicationName,
        sch.dosage,
        sch.frequency,
        sch.startDate,
        sch.endDate,
        sch.status,
        sch.category,
        sch.instructions ?? null
      )

      if (sch.timeSlots && Array.isArray(sch.timeSlots)) {
        for (const slot of sch.timeSlots) {
          insertTimeSlot.run(sch.id, slot)
        }
      }
    }

    // 5. Reminders
    console.log('  -> Seeding reminders...')
    const insertReminder = db.prepare(`
      INSERT OR REPLACE INTO reminders (
        id, patient_id, schedule_id, title, description, date, time, status, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const rem of seedData.reminders) {
      const reminderDate = rem.date ? rem.date : getOffsetDate(rem.offsetDays ?? 0)
      insertReminder.run(
        rem.id,
        rem.patientId,
        rem.scheduleId ?? null,
        rem.title,
        rem.description ?? null,
        reminderDate,
        rem.time,
        rem.status,
        rem.type
      )
    }

    // 6. Consumption Logs
    console.log('  -> Seeding consumption logs...')
    const insertLog = db.prepare(`
      INSERT OR REPLACE INTO consumption_logs (
        id, patient_id, reminder_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const l of seedData.consumptionLogs) {
      const scheduledDate = l.scheduledDate ? l.scheduledDate : getOffsetDate(l.offsetDays ?? 0)
      insertLog.run(
        l.id,
        l.patientId,
        l.reminderId ?? null,
        l.scheduleId ?? null,
        l.title,
        l.category,
        l.dosage ?? null,
        scheduledDate,
        l.scheduledTime,
        l.takenAt ?? null,
        l.status,
        l.notes ?? null,
        l.takenBy ?? 'Self'
      )
    }

    // 7. Articles & Sections
    console.log('  -> Seeding articles & sections...')
    const insertArticle = db.prepare(`
      INSERT OR REPLACE INTO articles (
        id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views, published_at, author_id, author_name, author_role, author_avatar, author_bio, key_takeaways, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const insertSection = db.prepare(`
      INSERT INTO article_sections (
        article_id, order_index, heading, subheading, paragraphs, callout_type, callout_title, callout_text, bullet_points
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const art of seedData.articles) {
      insertArticle.run(
        art.id,
        art.title,
        art.summary,
        art.leadParagraph ?? null,
        art.imageUrl,
        art.imageCaption ?? null,
        art.readTime,
        art.category,
        art.status ?? 'Terbit',
        art.views ?? 0,
        art.publishedAt,
        art.authorId ?? null,
        art.authorName ?? null,
        art.authorRole ?? null,
        art.authorAvatar ?? null,
        art.authorBio ?? null,
        art.keyTakeaways ? JSON.stringify(art.keyTakeaways) : null,
        art.tags ? JSON.stringify(art.tags) : null
      )

      if (art.sections && Array.isArray(art.sections)) {
        for (const sec of art.sections) {
          insertSection.run(
            art.id,
            sec.orderIndex ?? 1,
            sec.heading ?? null,
            sec.subheading ?? null,
            JSON.stringify(sec.paragraphs ?? []),
            sec.calloutType ?? null,
            sec.calloutTitle ?? null,
            sec.calloutText ?? null,
            sec.bulletPoints ? JSON.stringify(sec.bulletPoints) : null
          )
        }
      }
    }

    // 8. Health Programs & Enrollments
    console.log('  -> Seeding health programs & enrollments...')
    const insertProgram = db.prepare(`
      INSERT OR REPLACE INTO health_programs (
        id, name, code, description, duration_weeks, status, target_category, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const prg of seedData.healthPrograms) {
      insertProgram.run(
        prg.id,
        prg.name,
        prg.code,
        prg.description ?? null,
        prg.durationWeeks ?? 4,
        prg.status ?? 'Aktif',
        prg.targetCategory,
        prg.createdBy ?? null
      )
    }

    const insertEnrollment = db.prepare(`
      INSERT OR REPLACE INTO health_program_enrollments (
        program_id, patient_id, enrolled_at, progress_percentage, status
      ) VALUES (?, ?, ?, ?, ?)
    `)

    for (const enr of seedData.healthProgramEnrollments) {
      insertEnrollment.run(
        enr.programId,
        enr.patientId,
        enr.enrolledAt,
        enr.progressPercentage ?? 0.0,
        enr.status ?? 'Aktif'
      )
    }
  })

  // Run transaction
  seedTransaction()

  console.log(' Database seeding completed successfully from seedData.json!')
}

// Auto execute if run directly via CLI (tsx src/lib/db/seed.ts)
if (require.main === module || process.argv[1]?.includes('seed.ts')) {
  try {
    seedDatabase()
  } catch (error) {
    console.error('❌ Failed to seed database:', error)
    process.exit(1)
  }
}
