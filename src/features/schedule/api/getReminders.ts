import { Reminder } from '../types'
import { MOCK_REMINDERS } from '../../../shared/constants/mockData'

/**
 * Simulasi fetch data dari API backend.
 * Ke depannya, function ini akan dimodifikasi untuk menggunakan axios/fetch ke server.
 */

export const getReminders = async (): Promise<Reminder[]> => {
  // Simulasi network delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return MOCK_REMINDERS
}

export const getRemindersByDate = async (dateStr: string): Promise<Reminder[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return MOCK_REMINDERS.filter((reminder) => reminder.date === dateStr)
}

export const getTodayReminders = async (): Promise<Reminder[]> => {
  const today = new Date().toISOString().split('T')[0]
  return getRemindersByDate(today)
}
