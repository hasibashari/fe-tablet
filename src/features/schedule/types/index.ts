export type ReminderStatus = 'PENDING' | 'COMPLETED' | 'MISSED'
export type ReminderType = 'MEDICATION' | 'CHECKUP' | 'EXERCISE' | 'OTHER'

export interface Reminder {
  id: string
  title: string
  description?: string
  time: string // Format HH:mm
  date: string // Format YYYY-MM-DD
  status: ReminderStatus
  type: ReminderType
}

// Untuk daily progress tracker
export interface DailyProgressStats {
  total: number
  completed: number
  pending: number
  missed: number
  percentage: number
}
