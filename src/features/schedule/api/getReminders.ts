import { Reminder } from '../types'
import {
  getRemindersAction,
  getRemindersByDateAction,
  toggleReminderStatusAction,
  getDailyProgressStatsAction,
} from './scheduleRepository'

export const getReminders = async (patientId: string = 'usr_1'): Promise<Reminder[]> => {
  return await getRemindersAction(patientId)
}

export const getRemindersByDate = async (
  dateStr: string,
  patientId: string = 'usr_1'
): Promise<Reminder[]> => {
  return await getRemindersByDateAction(dateStr, patientId)
}

export const getTodayReminders = async (patientId: string = 'usr_1'): Promise<Reminder[]> => {
  const today = new Date().toISOString().split('T')[0]
  return await getRemindersByDateAction(today, patientId)
}

export const toggleReminderStatus = async (
  reminderId: string,
  currentStatus: string,
  patientId: string = 'usr_1'
) => {
  return await toggleReminderStatusAction(reminderId, currentStatus, patientId)
}

export const getDailyProgressStats = async (
  patientId: string = 'usr_1',
  dateStr?: string
) => {
  return await getDailyProgressStatsAction(patientId, dateStr)
}
