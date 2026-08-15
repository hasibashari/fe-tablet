'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { ReminderCard, getReminders, toggleReminderStatus, Reminder, CalendarPopover } from '@/src/features/schedule'
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Chip,
  Button,
  InputAdornment,
} from '@mui/material'
import { Search, CalendarOff, RotateCcw } from 'lucide-react'

type StatusFilterType = 'ALL' | 'PENDING' | 'COMPLETED' | 'MISSED'

export default function ScheduleView() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('ALL')

  useEffect(() => {
    const fetchData = async () => {
      const data = await getReminders()
      setReminders(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
    setReminders((prev) =>
      prev.map((rem) => {
        if (rem.id === id) {
          return { ...rem, status: nextStatus }
        }
        return rem
      })
    )
    await toggleReminderStatus(id, currentStatus)
  }

  // Filter reminders in memory without API calls
  const filteredReminders = useMemo(() => {
    return reminders.filter(item => {
      // 1. Date Filter
      const matchDate = item.date === selectedDate

      // 2. Status Filter
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter

      // 3. Search Query Filter
      const q = searchQuery.trim().toLowerCase()
      const matchSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))

      return matchDate && matchStatus && matchSearch
    })
  }, [reminders, selectedDate, statusFilter, searchQuery])

  const handleResetFilters = () => {
    const todayStr = new Date().toISOString().split('T')[0]
    setSelectedDate(todayStr)
    setSearchQuery('')
    setStatusFilter('ALL')
  }

  return (
    <Box sx={{ pb: 6, width: '100%' }}>
      {/* Header Title */}
      <Box sx={{ mb: 3.5 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
          }}
        >
          My Schedule
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Manage and view your health reminders by date.
        </Typography>
      </Box>

      {/* Controls Bar: Search, Calendar Date Filter, Status Chips */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'var(--color-hairline, #e2e8f0)',
          bgcolor: '#ffffff',
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Left Controls: Search & Date Filter */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
              flexGrow: 1,
            }}
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search schedule..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} style={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                width: { xs: '100%', sm: 260 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  bgcolor: '#f8fafc',
                },
              }}
            />

            {/* Calendar Date Filter Popover */}
            <CalendarPopover selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </Box>

          {/* Right Controls: Status Filter Chips */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              overflowX: 'auto',
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
              pb: { xs: 0.5, sm: 0 },
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2 },
            }}
          >
            {(['ALL', 'PENDING', 'COMPLETED', 'MISSED'] as StatusFilterType[]).map(st => {
              const isActive = statusFilter === st
              return (
                <Chip
                  key={st}
                  label={st.charAt(0) + st.slice(1).toLowerCase()}
                  onClick={() => setStatusFilter(st)}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.775rem',
                    px: 0.5,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: isActive ? 'primary.main' : 'background.default',
                    color: isActive ? '#ffffff' : 'text.secondary',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: isActive ? 'primary.dark' : 'action.hover',
                    },
                  }}
                />
              )
            })}
          </Box>
        </Box>
      </Paper>

      {/* Reminder Content Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Reminders List
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Showing {filteredReminders.length} item{filteredReminders.length === 1 ? '' : 's'}
          </Typography>
        </Box>

        {loading ? (
          <Stack spacing={2}>
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 4 }} />
            <Skeleton variant="rounded" height={80} sx={{ borderRadius: 4 }} />
          </Stack>
        ) : filteredReminders.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 4,
              bgcolor: '#ffffff',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: '50%',
                bgcolor: '#f8fafc',
                color: '#94a3b8',
                display: 'inline-flex',
                mb: 2,
              }}
            >
              <CalendarOff size={36} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              No Reminders Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mb: 2.5 }}>
              There are no scheduled reminders matching your selected date ({selectedDate}) and active filters.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RotateCcw size={16} />}
              onClick={handleResetFilters}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
            >
              Reset Filters & Date
            </Button>
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredReminders.map(reminder => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  )
}
