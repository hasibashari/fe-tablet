import {
  ConsumptionLog,
  ConsumptionStats,
  ConsumptionCategory,
  DateRangeFilter,
  CategoryFilter,
  StatusFilter,
} from '../types'
import {
  getConsumptionLogsAction,
  getConsumptionStatsAction,
  logManualConsumptionAction,
} from './consumptionRepository'

export const getConsumptionLogs = async (
  range: DateRangeFilter = 'ALL',
  category: CategoryFilter = 'ALL',
  status: StatusFilter = 'ALL',
  patientId: string = 'usr_1'
): Promise<ConsumptionLog[]> => {
  return await getConsumptionLogsAction(range, category, status, patientId)
}

export const getConsumptionStats = async (patientId: string = 'usr_1'): Promise<ConsumptionStats> => {
  return await getConsumptionStatsAction(patientId)
}

export const calculateConsumptionStats = (logs: ConsumptionLog[]): ConsumptionStats => {
  const total = logs.length
  if (total === 0) {
    return {
      adherenceRate: 100,
      currentStreakDays: 0,
      totalCompleted: 0,
      totalOnTime: 0,
      totalLate: 0,
      totalMissed: 0,
      totalScheduled: 0,
    }
  }

  const onTimeCount = logs.filter((l) => l.status === 'ON_TIME').length
  const lateCount = logs.filter((l) => l.status === 'LATE').length
  const missedCount = logs.filter((l) => l.status === 'MISSED').length
  const completedCount = onTimeCount + lateCount

  const adherenceRate = Math.round((completedCount / total) * 100)

  const dateMap = new Map<string, boolean>()
  logs.forEach((l) => {
    const isSuccess = l.status === 'ON_TIME' || l.status === 'LATE'
    const prev = dateMap.get(l.scheduledDate) ?? true
    dateMap.set(l.scheduledDate, prev && isSuccess)
  })

  const sortedDates = Array.from(dateMap.keys()).sort((a, b) => b.localeCompare(a))
  let streak = 0
  for (const date of sortedDates) {
    if (dateMap.get(date)) {
      streak++
    } else {
      break
    }
  }

  return {
    adherenceRate,
    currentStreakDays: streak,
    totalCompleted: completedCount,
    totalOnTime: onTimeCount,
    totalLate: lateCount,
    totalMissed: missedCount,
    totalScheduled: total,
  }
}

export const logManualConsumption = async (data: {
  patientId: string
  title: string
  category: ConsumptionCategory
  dosage?: string
  notes?: string
}) => {
  return await logManualConsumptionAction(data)
}
