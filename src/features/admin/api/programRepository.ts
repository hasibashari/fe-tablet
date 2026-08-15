'use server'

import db from '@/src/lib/db/client'
import { HealthProgram } from '../types/admin.types'

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

interface DoctorRow {
  id: string
  name?: string
}

// ============================================================
// HEALTH PROGRAMS MANAGEMENT (PROGRAMS CRUD)
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
