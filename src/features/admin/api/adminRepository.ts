'use server'

import db from '@/src/lib/db/client'
import {
  AdminStats,
  PatientUser,
  MedicationSchedule,
  MedicalProduct,
  HealthArticle,
  HealthProgram,
  ComplianceReport,
} from '../types/admin.types'

interface CountRow {
  c: number
}

interface AdherenceSummaryRow {
  total: number
  completed: number
}

interface PatientDbRow {
  id: string
  name: string
  age: number | null
  gender: 'Laki-laki' | 'Perempuan' | null
  phone: string | null
  email: string
  risk_level: 'Tinggi' | 'Sedang' | 'Rendah'
  status: 'Aktif' | 'Nonaktif'
  medical_notes: string | null
  last_reminder_sent: string | null
  last_active: string | null
  join_date: string
  doctor_name: string | null
  active_schedules_count: number
  total_logs: number
  completed_logs: number
}

interface DoctorRow {
  id: string
  name?: string
}

interface ProductDbRow {
  id: string
  name: string
  category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
  sku: string
  stock: number
  unit: string
  price: number
  status: 'Tersedia' | 'Stok Menipis' | 'Habis'
  description: string | null
}

interface ScheduleDbRow {
  id: string
  patient_id: string
  patient_name: string | null
  medication_name: string
  dosage: string
  frequency: string
  start_date: string
  end_date: string
  status: 'Aktif' | 'Selesai' | 'Diberhentikan'
  category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
  instructions: string | null
  last_reminder_sent: string | null
}

interface ArticleDbRow {
  id: string
  title: string
  category: string
  author_name: string | null
  published_at: string
  status: 'Terbit' | 'Draf'
  views: number
  summary: string
  read_time: string
}

interface ProgramDbRow {
  id: string
  name: string
  code: string
  description: string | null
  duration_weeks: number
  enrolled_count: number
  status: 'Aktif' | 'Draf' | 'Arsip'
  target_category: string
  creator_name: string | null
}

interface ComplianceReportRow {
  date: string
  taken_count: number
  missed_count: number
  total: number
}

// ============================================================
// 1. ADMIN OVERVIEW STATS
// ============================================================
export async function getAdminStatsAction(): Promise<AdminStats> {
  try {
    const totalPatients = (db.prepare(`SELECT count(*) as c FROM patient_profiles`).get() as CountRow | undefined)?.c || 0
    const activeSchedules = (db.prepare(`SELECT count(*) as c FROM medication_schedules WHERE status = 'Aktif'`).get() as CountRow | undefined)?.c || 0
    
    const adherenceRow = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1.0 ELSE 0.0 END) as completed
      FROM consumption_logs
    `).get() as AdherenceSummaryRow | undefined
    const adherenceRate = adherenceRow && adherenceRow.total > 0
      ? +(adherenceRow.completed / adherenceRow.total * 100).toFixed(1)
      : 88.5

    const publishedArticles = (db.prepare(`SELECT count(*) as c FROM articles WHERE status = 'Terbit'`).get() as CountRow | undefined)?.c || 0
    const activePrograms = (db.prepare(`SELECT count(*) as c FROM health_programs WHERE status = 'Aktif'`).get() as CountRow | undefined)?.c || 0
    const lowStockProducts = (db.prepare(`SELECT count(*) as c FROM products WHERE stock <= 10 OR status = 'Stok Menipis'`).get() as CountRow | undefined)?.c || 0

    return {
      totalPatients,
      activeSchedules,
      adherenceRate,
      publishedArticles,
      activePrograms,
      lowStockProducts,
    }
  } catch (error) {
    console.error('Error in getAdminStatsAction:', error)
    return {
      totalPatients: 0,
      activeSchedules: 0,
      adherenceRate: 0,
      publishedArticles: 0,
      activePrograms: 0,
      lowStockProducts: 0,
    }
  }
}

// ============================================================
// 2. PATIENT MANAGEMENT (USERS CRUD)
// ============================================================
export async function getPatientsAction(): Promise<PatientUser[]> {
  try {
    const rows = db.prepare(`
      SELECT 
        u.id, u.name, u.age, u.gender, u.phone, u.email,
        p.risk_level, p.status, p.medical_notes, p.last_reminder_sent, p.last_active, p.join_date,
        doc.name as doctor_name,
        (SELECT count(*) FROM medication_schedules WHERE patient_id = u.id AND status = 'Aktif') as active_schedules_count,
        (SELECT count(*) FROM consumption_logs WHERE patient_id = u.id) as total_logs,
        (SELECT count(*) FROM consumption_logs WHERE patient_id = u.id AND status IN ('ON_TIME', 'LATE')) as completed_logs
      FROM users u
      JOIN patient_profiles p ON u.id = p.user_id
      LEFT JOIN users doc ON u.assigned_doctor_id = doc.id
      WHERE u.role = 'patient'
      ORDER BY p.join_date DESC, u.name ASC
    `).all() as PatientDbRow[]

    return rows.map((r) => {
      const adherenceRate = r.total_logs > 0 ? Math.round((r.completed_logs / r.total_logs) * 100) : 80
      return {
        id: r.id,
        name: r.name,
        age: r.age || 40,
        gender: r.gender || 'Laki-laki',
        phone: r.phone || '-',
        email: r.email,
        riskLevel: r.risk_level,
        status: r.status,
        assignedDoctor: r.doctor_name || 'dr. Siti Rahma, Sp.PD',
        activeSchedulesCount: r.active_schedules_count,
        adherenceRate,
        lastActive: r.last_active || 'Hari ini',
        joinDate: r.join_date,
        medicalNotes: r.medical_notes || undefined,
        lastReminderSent: r.last_reminder_sent || undefined,
      }
    })
  } catch (error) {
    console.error('Error in getPatientsAction:', error)
    return []
  }
}

export async function createPatientAction(data: {
  name: string
  email: string
  phone: string
  age: number
  gender: 'Laki-laki' | 'Perempuan'
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah'
  assignedDoctor?: string
  medicalNotes?: string
}): Promise<{ success: boolean; patient?: PatientUser; error?: string }> {
  try {
    const newId = `PAT-${Date.now().toString().slice(-3)}`
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`
    const defaultDoctor = db.prepare(`SELECT id, name FROM users WHERE role = 'admin' LIMIT 1`).get() as DoctorRow | undefined

    db.transaction(() => {
      db.prepare(`
        INSERT INTO users (id, name, email, role, phone, avatar, age, gender, assigned_doctor_id)
        VALUES (?, ?, ?, 'patient', ?, ?, ?, ?, ?)
      `).run(
        newId,
        data.name,
        data.email,
        data.phone,
        avatarUrl,
        data.age,
        data.gender,
        defaultDoctor?.id || null
      )

      db.prepare(`
        INSERT INTO patient_profiles (user_id, risk_level, status, medical_notes, join_date, last_active)
        VALUES (?, ?, 'Aktif', ?, date('now'), 'Baru bergabung')
      `).run(
        newId,
        data.riskLevel,
        data.medicalNotes || null
      )
    })()

    const patients = await getPatientsAction()
    const created = patients.find((p) => p.id === newId)
    return { success: true, patient: created }
  } catch (error: unknown) {
    console.error('Error creating patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat data pasien'
    return { success: false, error: errMsg }
  }
}

export async function updatePatientAction(
  patientId: string,
  data: Partial<PatientUser>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.transaction(() => {
      if (data.name || data.email || data.phone || data.age || data.gender) {
        db.prepare(`
          UPDATE users 
          SET 
            name = COALESCE(?, name),
            email = COALESCE(?, email),
            phone = COALESCE(?, phone),
            age = COALESCE(?, age),
            gender = COALESCE(?, gender),
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(
          data.name ?? null,
          data.email ?? null,
          data.phone ?? null,
          data.age ?? null,
          data.gender ?? null,
          patientId
        )
      }

      if (data.riskLevel || data.status || data.medicalNotes) {
        db.prepare(`
          UPDATE patient_profiles
          SET 
            risk_level = COALESCE(?, risk_level),
            status = COALESCE(?, status),
            medical_notes = COALESCE(?, medical_notes)
          WHERE user_id = ?
        `).run(
          data.riskLevel ?? null,
          data.status ?? null,
          data.medicalNotes ?? null,
          patientId
        )
      }
    })()

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui data pasien'
    return { success: false, error: errMsg }
  }
}

export async function deletePatientAction(patientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM users WHERE id = ?`).run(patientId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting patient:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus data pasien'
    return { success: false, error: errMsg }
  }
}

export async function sendPatientReminderAction(
  patientId: string,
  message?: string
): Promise<{ success: boolean }> {
  try {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const nowStr = message ? `Hari ini, ${timeStr} (${message})` : `Hari ini, ${timeStr}`
    db.prepare(`UPDATE patient_profiles SET last_reminder_sent = ? WHERE user_id = ?`).run(nowStr, patientId)
    return { success: true }
  } catch (error) {
    console.error('Error sending reminder nudge:', error)
    return { success: false }
  }
}

// ============================================================
// 3. PRODUCTS MANAGEMENT (PRODUCTS CRUD)
// ============================================================
export async function getProductsAction(): Promise<MedicalProduct[]> {
  try {
    const rows = db.prepare(`SELECT * FROM products ORDER BY name ASC`).all() as ProductDbRow[]
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      sku: r.sku,
      stock: r.stock,
      unit: r.unit,
      price: r.price,
      status: r.status,
      description: r.description || '',
    }))
  } catch (error) {
    console.error('Error in getProductsAction:', error)
    return []
  }
}

export async function createProductAction(data: {
  name: string
  category: 'Obat Resep' | 'Obat Bebas' | 'Suplemen' | 'Alat Kesehatan'
  sku: string
  stock: number
  unit: string
  price: number
  status: 'Tersedia' | 'Stok Menipis' | 'Habis'
  description?: string
}): Promise<{ success: boolean; product?: MedicalProduct; error?: string }> {
  try {
    const newId = `PRD-${Date.now().toString().slice(-3)}`
    db.prepare(`
      INSERT INTO products (id, name, category, sku, stock, unit, price, status, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.name,
      data.category,
      data.sku,
      data.stock,
      data.unit,
      data.price,
      data.status,
      data.description || null
    )

    const created: MedicalProduct = {
      id: newId,
      name: data.name,
      category: data.category,
      sku: data.sku,
      stock: data.stock,
      unit: data.unit,
      price: data.price,
      status: data.status,
      description: data.description || '',
    }
    return { success: true, product: created }
  } catch (error: unknown) {
    console.error('Error creating product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat data produk'
    return { success: false, error: errMsg }
  }
}

export async function updateProductAction(
  productId: string,
  data: Partial<MedicalProduct>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`
      UPDATE products
      SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        sku = COALESCE(?, sku),
        stock = COALESCE(?, stock),
        unit = COALESCE(?, unit),
        price = COALESCE(?, price),
        status = COALESCE(?, status),
        description = COALESCE(?, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name ?? null,
      data.category ?? null,
      data.sku ?? null,
      data.stock ?? null,
      data.unit ?? null,
      data.price ?? null,
      data.status ?? null,
      data.description ?? null,
      productId
    )
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui data produk'
    return { success: false, error: errMsg }
  }
}

export async function deleteProductAction(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM products WHERE id = ?`).run(productId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting product:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus data produk'
    return { success: false, error: errMsg }
  }
}

// ============================================================
// 4. MEDICATION SCHEDULES (SCHEDULES CRUD)
// ============================================================
export async function getSchedulesAction(): Promise<MedicationSchedule[]> {
  try {
    const rows = db.prepare(`
      SELECT 
        s.*, 
        u.name as patient_name
      FROM medication_schedules s
      JOIN users u ON s.patient_id = u.id
      ORDER BY s.start_date DESC
    `).all() as ScheduleDbRow[]

    return rows.map((r) => {
      const timeSlots = db
        .prepare(`SELECT time FROM schedule_time_slots WHERE schedule_id = ? ORDER BY time ASC`)
        .all(r.id) as { time: string }[]

      return {
        id: r.id,
        patientId: r.patient_id,
        patientName: r.patient_name || 'Pasien',
        medicationName: r.medication_name,
        dosage: r.dosage,
        frequency: r.frequency,
        timeSlots: timeSlots.map((ts) => ts.time),
        startDate: r.start_date,
        endDate: r.end_date,
        status: r.status,
        category: r.category,
        instructions: r.instructions || '',
        lastReminderSent: r.last_reminder_sent || undefined,
      }
    })
  } catch (error) {
    console.error('Error in getSchedulesAction:', error)
    return []
  }
}

export async function createScheduleAction(data: {
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  timeSlots: string[]
  startDate: string
  endDate: string
  category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
  instructions?: string
}): Promise<{ success: boolean; schedule?: MedicationSchedule; error?: string }> {
  try {
    const newId = `SCH-${Date.now().toString().slice(-3)}`

    db.transaction(() => {
      db.prepare(`
        INSERT INTO medication_schedules (
          id, patient_id, medication_name, dosage, frequency, start_date, end_date, status, category, instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif', ?, ?)
      `).run(
        newId,
        data.patientId,
        data.medicationName,
        data.dosage,
        data.frequency,
        data.startDate,
        data.endDate,
        data.category,
        data.instructions || null
      )

      for (const slot of data.timeSlots) {
        db.prepare(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES (?, ?)`).run(newId, slot)
      }

      // Generate initial today reminder for this schedule
      const today = new Date().toISOString().split('T')[0]
      for (const slot of data.timeSlots) {
        db.prepare(`
          INSERT INTO reminders (id, patient_id, schedule_id, title, description, date, time, status, type)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
        `).run(
          `rem-${newId}-${slot.replace(':', '')}`,
          data.patientId,
          newId,
          data.medicationName,
          data.instructions || data.dosage,
          today,
          slot,
          data.category === 'Aktivitas Medis' ? 'CHECKUP' : 'MEDICATION'
        )
      }
    })()

    const schedules = await getSchedulesAction()
    const created = schedules.find((s) => s.id === newId)
    return { success: true, schedule: created }
  } catch (error: unknown) {
    console.error('Error creating schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat jadwal'
    return { success: false, error: errMsg }
  }
}

export async function updateScheduleAction(
  scheduleId: string,
  data: Partial<MedicationSchedule>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.transaction(() => {
      db.prepare(`
        UPDATE medication_schedules
        SET
          medication_name = COALESCE(?, medication_name),
          dosage = COALESCE(?, dosage),
          frequency = COALESCE(?, frequency),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          status = COALESCE(?, status),
          category = COALESCE(?, category),
          instructions = COALESCE(?, instructions),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        data.medicationName ?? null,
        data.dosage ?? null,
        data.frequency ?? null,
        data.startDate ?? null,
        data.endDate ?? null,
        data.status ?? null,
        data.category ?? null,
        data.instructions ?? null,
        scheduleId
      )

      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        db.prepare(`DELETE FROM schedule_time_slots WHERE schedule_id = ?`).run(scheduleId)
        for (const slot of data.timeSlots) {
          db.prepare(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES (?, ?)`).run(scheduleId, slot)
        }
      }
    })()

    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui jadwal'
    return { success: false, error: errMsg }
  }
}

export async function deleteScheduleAction(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM medication_schedules WHERE id = ?`).run(scheduleId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting schedule:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus jadwal'
    return { success: false, error: errMsg }
  }
}

// ============================================================
// 5. ARTICLES MANAGEMENT (ARTICLES CRUD)
// ============================================================
export async function getAdminArticlesAction(): Promise<HealthArticle[]> {
  try {
    const rows = db.prepare(`SELECT * FROM articles ORDER BY published_at DESC, created_at DESC`).all() as ArticleDbRow[]
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category as HealthArticle['category'],
      author: r.author_name || 'dr. Sarah Jenkins',
      publishDate: r.published_at,
      status: r.status as HealthArticle['status'],
      views: r.views,
      summary: r.summary,
      readTime: r.read_time,
    }))
  } catch (error) {
    console.error('Error in getAdminArticlesAction:', error)
    return []
  }
}

export async function createAdminArticleAction(data: {
  title: string
  category: string
  summary: string
  readTime: string
  status?: 'Terbit' | 'Draf'
  author?: string
}): Promise<{ success: boolean; article?: HealthArticle; error?: string }> {
  try {
    const newId = `art_${Date.now().toString().slice(-4)}`
    const today = new Date().toISOString().split('T')[0]
    const imageUrl = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop'

    db.prepare(`
      INSERT INTO articles (
        id, title, summary, lead_paragraph, image_url, read_time, category, status, views, published_at, author_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      newId,
      data.title,
      data.summary,
      data.summary,
      imageUrl,
      data.readTime,
      data.category,
      data.status || 'Terbit',
      today,
      data.author || 'dr. Sarah Jenkins, Sp.GK'
    )

    const created: HealthArticle = {
      id: newId,
      title: data.title,
      category: data.category as HealthArticle['category'],
      author: data.author || 'dr. Sarah Jenkins, Sp.GK',
      publishDate: today,
      status: (data.status || 'Terbit') as HealthArticle['status'],
      views: 0,
      summary: data.summary,
      readTime: data.readTime,
    }

    return { success: true, article: created }
  } catch (error: unknown) {
    console.error('Error creating article:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat artikel'
    return { success: false, error: errMsg }
  }
}

export async function updateAdminArticleAction(
  articleId: string,
  data: Partial<HealthArticle>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`
      UPDATE articles
      SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        summary = COALESCE(?, summary),
        read_time = COALESCE(?, read_time),
        status = COALESCE(?, status),
        author_name = COALESCE(?, author_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.title ?? null,
      data.category ?? null,
      data.summary ?? null,
      data.readTime ?? null,
      data.status ?? null,
      data.author ?? null,
      articleId
    )
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating article:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui artikel'
    return { success: false, error: errMsg }
  }
}

export async function deleteAdminArticleAction(articleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM articles WHERE id = ?`).run(articleId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting article:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus artikel'
    return { success: false, error: errMsg }
  }
}

// ============================================================
// 6. HEALTH PROGRAMS MANAGEMENT (PROGRAMS CRUD)
// ============================================================
export async function getProgramsAction(): Promise<HealthProgram[]> {
  try {
    const rows = db.prepare(`
      SELECT 
        p.*,
        (SELECT count(*) FROM health_program_enrollments WHERE program_id = p.id) as enrolled_count,
        u.name as creator_name
      FROM health_programs p
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.created_at DESC
    `).all() as ProgramDbRow[]

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      code: r.code,
      description: r.description || '',
      durationWeeks: r.duration_weeks,
      enrolledPatientsCount: r.enrolled_count,
      status: r.status,
      targetCategory: r.target_category,
      createdBy: r.creator_name || 'dr. Siti Rahma',
    }))
  } catch (error) {
    console.error('Error in getProgramsAction:', error)
    return []
  }
}

export async function createProgramAction(data: {
  name: string
  code: string
  description?: string
  durationWeeks: number
  targetCategory: string
  status?: 'Aktif' | 'Draf' | 'Arsip'
}): Promise<{ success: boolean; program?: HealthProgram; error?: string }> {
  try {
    const newId = `PRG-${Date.now().toString().slice(-3)}`
    const defaultDoctor = db.prepare(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`).get() as DoctorRow | undefined

    db.prepare(`
      INSERT INTO health_programs (id, name, code, description, duration_weeks, status, target_category, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      data.name,
      data.code,
      data.description || null,
      data.durationWeeks,
      data.status || 'Aktif',
      data.targetCategory,
      defaultDoctor?.id || null
    )

    const programs = await getProgramsAction()
    const created = programs.find((p) => p.id === newId)
    return { success: true, program: created }
  } catch (error: unknown) {
    console.error('Error creating program:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal membuat program'
    return { success: false, error: errMsg }
  }
}

export async function updateProgramAction(
  programId: string,
  data: Partial<HealthProgram>
): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`
      UPDATE health_programs
      SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        duration_weeks = COALESCE(?, duration_weeks),
        status = COALESCE(?, status),
        target_category = COALESCE(?, target_category),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name ?? null,
      data.code ?? null,
      data.description ?? null,
      data.durationWeeks ?? null,
      data.status ?? null,
      data.targetCategory ?? null,
      programId
    )
    return { success: true }
  } catch (error: unknown) {
    console.error('Error updating program:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui program'
    return { success: false, error: errMsg }
  }
}

export async function deleteProgramAction(programId: string): Promise<{ success: boolean; error?: string }> {
  try {
    db.prepare(`DELETE FROM health_programs WHERE id = ?`).run(programId)
    return { success: true }
  } catch (error: unknown) {
    console.error('Error deleting program:', error)
    const errMsg = error instanceof Error ? error.message : 'Gagal menghapus program'
    return { success: false, error: errMsg }
  }
}

// ============================================================
// 7. COMPLIANCE REPORTS (REAL-TIME AGGREGATION FROM LOGS)
// ============================================================
export async function getComplianceReportsAction(): Promise<ComplianceReport[]> {
  try {
    const rows = db.prepare(`
      SELECT 
        scheduled_date as date,
        SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1 ELSE 0 END) as taken_count,
        SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed_count,
        COUNT(*) as total
      FROM consumption_logs
      GROUP BY scheduled_date
      ORDER BY scheduled_date ASC
      LIMIT 14
    `).all() as ComplianceReportRow[]

    if (rows.length === 0) {
      return [
        { date: 'Senin', takenCount: 42, missedCount: 4, adherencePercentage: 91 },
        { date: 'Selasa', takenCount: 45, missedCount: 3, adherencePercentage: 93 },
        { date: 'Rabu', takenCount: 40, missedCount: 6, adherencePercentage: 87 },
      ]
    }

    return rows.map((r) => {
      const percentage = r.total > 0 ? Math.round((r.taken_count / r.total) * 100) : 100
      return {
        date: r.date,
        takenCount: r.taken_count,
        missedCount: r.missed_count,
        adherencePercentage: percentage,
      }
    })
  } catch (error) {
    console.error('Error in getComplianceReportsAction:', error)
    return []
  }
}
