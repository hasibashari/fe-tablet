'use client'

import React, { useEffect, useState } from 'react'
import { ReminderCard, getReminders, Reminder } from '@/src/features/schedule'

export default function HistoryView() {
  const [history, setHistory] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReminders()
      // Simulasi filter untuk data lampau
      const pastData = data.filter(r => r.status !== 'PENDING')
      setHistory(pastData)
      setLoading(false)
    }
    fetchData()
  }, [])

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Activity History</h1>
        <p className="text-muted-soft mt-2">Track your past medication and checkup history.</p>
      </div>

      {loading ? (
        <div className="text-center text-muted-soft p-10 animate-pulse">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-hairline rounded-2xl bg-white text-center text-muted-soft">
          No history found.
        </div>
      ) : (
        <div className="space-y-4">
          {history.map(item => (
            <ReminderCard 
              key={item.id} 
              reminder={item} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
