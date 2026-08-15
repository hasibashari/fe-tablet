import fs from 'fs'
import path from 'path'
import { pool } from './client'
import { initializeDatabase } from './init'

export async function seedDatabase() {
  console.log('🌱 Starting PostgreSQL database seeding from seedData.json...')

  // Ensure schema exists
  await initializeDatabase()

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

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Users
    console.log('  -> Seeding users...')
    const insertUserQuery = `
      INSERT INTO users (
        id, name, email, password_hash, role, phone, avatar, title, age, gender, date_of_birth, blood_type, height, weight, assigned_doctor_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        title = EXCLUDED.title,
        age = EXCLUDED.age,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        blood_type = EXCLUDED.blood_type,
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        assigned_doctor_id = EXCLUDED.assigned_doctor_id,
        updated_at = CURRENT_TIMESTAMP
    `

    for (const u of seedData.users) {
      await client.query(insertUserQuery, [
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
        u.assignedDoctorId ?? null,
      ])
    }

    // 2. Patient Profiles
    console.log('  -> Seeding patient profiles...')
    const insertPatientProfileQuery = `
      INSERT INTO patient_profiles (
        user_id, risk_level, status, medical_notes, last_reminder_sent, last_active, join_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET
        risk_level = EXCLUDED.risk_level,
        status = EXCLUDED.status,
        medical_notes = EXCLUDED.medical_notes,
        last_reminder_sent = EXCLUDED.last_reminder_sent,
        last_active = EXCLUDED.last_active,
        join_date = EXCLUDED.join_date
    `

    for (const p of seedData.patientProfiles) {
      await client.query(insertPatientProfileQuery, [
        p.userId,
        p.riskLevel,
        p.status,
        p.medicalNotes ?? null,
        today + ' 08:00',
        today + ' 08:30',
        p.joinDate,
      ])
    }

    // 3. Products
    console.log('  -> Seeding products...')
    const insertProductQuery = `
      INSERT INTO products (
        id, name, category, sku, stock, unit, price, status, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        sku = EXCLUDED.sku,
        stock = EXCLUDED.stock,
        unit = EXCLUDED.unit,
        price = EXCLUDED.price,
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    `

    for (const prod of seedData.products) {
      await client.query(insertProductQuery, [
        prod.id,
        prod.name,
        prod.category,
        prod.sku,
        prod.stock,
        prod.unit,
        prod.price,
        prod.status,
        prod.description ?? null,
      ])
    }

    // 4. Medication Schedules & Time Slots
    console.log('  -> Seeding medication schedules...')
    const insertScheduleQuery = `
      INSERT INTO medication_schedules (
        id, patient_id, product_id, medication_name, dosage, frequency, start_date, end_date, status, category, instructions
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        product_id = EXCLUDED.product_id,
        medication_name = EXCLUDED.medication_name,
        dosage = EXCLUDED.dosage,
        frequency = EXCLUDED.frequency,
        start_date = EXCLUDED.start_date,
        end_date = EXCLUDED.end_date,
        status = EXCLUDED.status,
        category = EXCLUDED.category,
        instructions = EXCLUDED.instructions,
        updated_at = CURRENT_TIMESTAMP
    `

    // Clean existing schedule time slots before re-seeding
    await client.query('DELETE FROM schedule_time_slots')

    const insertTimeSlotQuery = `
      INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)
    `

    for (const sch of seedData.medicationSchedules) {
      await client.query(insertScheduleQuery, [
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
        sch.instructions ?? null,
      ])

      if (sch.timeSlots && Array.isArray(sch.timeSlots)) {
        for (const slot of sch.timeSlots) {
          await client.query(insertTimeSlotQuery, [sch.id, slot])
        }
      }
    }

    // 5. Reminders
    console.log('  -> Seeding reminders...')
    const insertReminderQuery = `
      INSERT INTO reminders (
        id, patient_id, schedule_id, title, description, date, time, status, type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        schedule_id = EXCLUDED.schedule_id,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        date = EXCLUDED.date,
        time = EXCLUDED.time,
        status = EXCLUDED.status,
        type = EXCLUDED.type
    `

    for (const rem of seedData.reminders) {
      const reminderDate = rem.date ? rem.date : getOffsetDate(rem.offsetDays ?? 0)
      await client.query(insertReminderQuery, [
        rem.id,
        rem.patientId,
        rem.scheduleId ?? null,
        rem.title,
        rem.description ?? null,
        reminderDate,
        rem.time,
        rem.status,
        rem.type,
      ])
    }

    // 6. Consumption Logs
    console.log('  -> Seeding consumption logs...')
    const insertLogQuery = `
      INSERT INTO consumption_logs (
        id, patient_id, reminder_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        reminder_id = EXCLUDED.reminder_id,
        schedule_id = EXCLUDED.schedule_id,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        dosage = EXCLUDED.dosage,
        scheduled_date = EXCLUDED.scheduled_date,
        scheduled_time = EXCLUDED.scheduled_time,
        taken_at = EXCLUDED.taken_at,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        taken_by = EXCLUDED.taken_by
    `

    for (const l of seedData.consumptionLogs) {
      const scheduledDate = l.scheduledDate ? l.scheduledDate : getOffsetDate(l.offsetDays ?? 0)
      await client.query(insertLogQuery, [
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
        l.takenBy ?? 'Self',
      ])
    }

    // 7. Articles & Sections
    console.log('  -> Seeding articles & sections...')
    const insertArticleQuery = `
      INSERT INTO articles (
        id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views, published_at, author_id, author_name, author_role, author_avatar, author_bio, key_takeaways, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        lead_paragraph = EXCLUDED.lead_paragraph,
        image_url = EXCLUDED.image_url,
        image_caption = EXCLUDED.image_caption,
        read_time = EXCLUDED.read_time,
        category = EXCLUDED.category,
        status = EXCLUDED.status,
        views = EXCLUDED.views,
        published_at = EXCLUDED.published_at,
        author_id = EXCLUDED.author_id,
        author_name = EXCLUDED.author_name,
        author_role = EXCLUDED.author_role,
        author_avatar = EXCLUDED.author_avatar,
        author_bio = EXCLUDED.author_bio,
        key_takeaways = EXCLUDED.key_takeaways,
        tags = EXCLUDED.tags,
        updated_at = CURRENT_TIMESTAMP
    `

    await client.query('DELETE FROM article_sections')

    const insertSectionQuery = `
      INSERT INTO article_sections (
        article_id, order_index, heading, subheading, paragraphs, callout_type, callout_title, callout_text, bullet_points
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `

    for (const art of seedData.articles) {
      await client.query(insertArticleQuery, [
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
        art.tags ? JSON.stringify(art.tags) : null,
      ])

      if (art.sections && Array.isArray(art.sections)) {
        for (const sec of art.sections) {
          await client.query(insertSectionQuery, [
            art.id,
            sec.orderIndex ?? 1,
            sec.heading ?? null,
            sec.subheading ?? null,
            JSON.stringify(sec.paragraphs ?? []),
            sec.calloutType ?? null,
            sec.calloutTitle ?? null,
            sec.calloutText ?? null,
            sec.bulletPoints ? JSON.stringify(sec.bulletPoints) : null,
          ])
        }
      }
    }

    // 8. Health Programs & Enrollments
    console.log('  -> Seeding health programs & enrollments...')
    const insertProgramQuery = `
      INSERT INTO health_programs (
        id, name, code, description, duration_weeks, status, target_category, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        code = EXCLUDED.code,
        description = EXCLUDED.description,
        duration_weeks = EXCLUDED.duration_weeks,
        status = EXCLUDED.status,
        target_category = EXCLUDED.target_category,
        created_by = EXCLUDED.created_by,
        updated_at = CURRENT_TIMESTAMP
    `

    for (const prg of seedData.healthPrograms) {
      await client.query(insertProgramQuery, [
        prg.id,
        prg.name,
        prg.code,
        prg.description ?? null,
        prg.durationWeeks ?? 4,
        prg.status ?? 'Aktif',
        prg.targetCategory,
        prg.createdBy ?? null,
      ])
    }

    const insertEnrollmentQuery = `
      INSERT INTO health_program_enrollments (
        program_id, patient_id, enrolled_at, progress_percentage, status
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (program_id, patient_id) DO UPDATE SET
        enrolled_at = EXCLUDED.enrolled_at,
        progress_percentage = EXCLUDED.progress_percentage,
        status = EXCLUDED.status
    `

    for (const enr of seedData.healthProgramEnrollments) {
      await client.query(insertEnrollmentQuery, [
        enr.programId,
        enr.patientId,
        enr.enrolledAt,
        enr.progressPercentage ?? 0.0,
        enr.status ?? 'Aktif',
      ])
    }

    await client.query('COMMIT')
    console.log('✅ PostgreSQL database seeding completed successfully from seedData.json!')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Auto execute if run directly via CLI (tsx src/lib/db/seed.ts)
if (require.main === module || process.argv[1]?.includes('seed.ts')) {
  seedDatabase()
    .then(async () => {
      await pool.end()
      process.exit(0)
    })
    .catch(async (error) => {
      console.error('❌ Failed to seed PostgreSQL database:', error)
      await pool.end()
      process.exit(1)
    })
}
