'use server'

import db from '@/src/lib/db/client'
import { AdminStats } from '../types/admin.types'

interface CountRow {
  c: string | number
}

interface AdherenceSummaryRow {
  total: string | number
  completed: string | number
}

// ============================================================
// ADMIN OVERVIEW STATS
// ============================================================
export async function getAdminStatsAction(): Promise<AdminStats> {
  try {
    const patientsRes = await db.query<CountRow>(`SELECT count(*) as c FROM patient_profiles`)
    const totalPatients = Number(patientsRes.rows[0]?.c) || 0

    const schedulesRes = await db.query<CountRow>(`SELECT count(*) as c FROM medication_schedules WHERE status = 'Aktif'`)
    const activeSchedules = Number(schedulesRes.rows[0]?.c) || 0

    const adherenceRes = await db.query<AdherenceSummaryRow>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1.0 ELSE 0.0 END) as completed
      FROM consumption_logs
    `)
    const adherenceRow = adherenceRes.rows[0]
    const totalLogs = Number(adherenceRow?.total) || 0
    const completedLogs = Number(adherenceRow?.completed) || 0
    const adherenceRate = totalLogs > 0
      ? +(completedLogs / totalLogs * 100).toFixed(1)
      : 88.5

    const articlesRes = await db.query<CountRow>(`SELECT count(*) as c FROM articles WHERE status = 'Terbit'`)
    const publishedArticles = Number(articlesRes.rows[0]?.c) || 0

    const programsRes = await db.query<CountRow>(`SELECT count(*) as c FROM health_programs WHERE status = 'Aktif'`)
    const activePrograms = Number(programsRes.rows[0]?.c) || 0

    const productsRes = await db.query<CountRow>(`SELECT count(*) as c FROM products WHERE stock <= 10 OR status = 'Stok Menipis'`)
    const lowStockProducts = Number(productsRes.rows[0]?.c) || 0

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
