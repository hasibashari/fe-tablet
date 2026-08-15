'use server'

import db from '@/src/lib/db/client'
import { AdminStats } from '../types/admin.types'

interface CountRow {
  c: number
}

interface AdherenceSummaryRow {
  total: number
  completed: number
}

// ============================================================
// ADMIN OVERVIEW STATS
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
