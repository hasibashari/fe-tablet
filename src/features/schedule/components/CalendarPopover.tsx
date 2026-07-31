'use client'

import React, { useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Button,
  Popover,
  IconButton,
  Grid,
} from '@mui/material'
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'

interface CalendarPopoverProps {
  selectedDate: string // YYYY-MM-DD
  onDateChange: (dateStr: string) => void
}

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CalendarPopover({ selectedDate, onDateChange }: CalendarPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  // Track currently displayed month/year in popover
  const [viewDate, setViewDate] = useState<Date>(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    return new Date(y, m - 1, d)
  })

  const open = Boolean(anchorEl)

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  // Format button label text
  const formattedButtonLabel = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const targetDate = new Date(y, m - 1, d)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
    const formatted = targetDate.toLocaleDateString('en-US', options)
    if (selectedDate === todayStr) {
      return `Today, ${targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    return formatted
  }, [selectedDate, todayStr])

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleJumpToToday = () => {
    const now = new Date()
    onDateChange(todayStr)
    setViewDate(now)
    handleClose()
  }

  const handleSelectDay = (day: number) => {
    const year = viewDate.getFullYear()
    const month = String(viewDate.getMonth() + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const newDateStr = `${year}-${month}-${dayStr}`
    onDateChange(newDateStr)
    handleClose()
  }

  // Calendar math for viewDate month
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outlined"
        startIcon={<Calendar size={18} style={{ color: '#0284c7' }} />}
        endIcon={<ChevronDown size={16} style={{ opacity: 0.7 }} />}
        sx={{
          bgcolor: '#ffffff',
          borderColor: 'var(--color-hairline, #e2e8f0)',
          color: 'text.primary',
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          px: 2,
          py: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          '&:hover': {
            borderColor: '#0284c7',
            bgcolor: 'rgba(2, 132, 199, 0.04)',
          },
        }}
      >
        {formattedButtonLabel}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: 4,
              p: 2.5,
              width: 310,
              mt: 1,
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
            },
          },
        }}
      >
        {/* Month Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {monthName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={handlePrevMonth} sx={{ p: 0.75 }}>
              <ChevronLeft size={18} />
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth} sx={{ p: 0.75 }}>
              <ChevronRight size={18} />
            </IconButton>
          </Box>
        </Box>

        {/* Days of Week */}
        <Grid container spacing={0.5} sx={{ mb: 1, textAlign: 'center' }}>
          {DAYS_OF_WEEK.map((d, idx) => (
            <Grid key={idx} size={{ xs: 1.71 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                {d}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid container spacing={0.5} sx={{ textAlign: 'center' }}>
          {/* Empty padding slots before 1st day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <Grid key={`empty-${idx}`} size={{ xs: 1.71 }} />
          ))}

          {/* Day Slots */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1
            const mStr = String(month + 1).padStart(2, '0')
            const dStr = String(dayNum).padStart(2, '0')
            const dateISO = `${year}-${mStr}-${dStr}`

            const isSelected = dateISO === selectedDate
            const isToday = dateISO === todayStr

            return (
              <Grid key={dayNum} size={{ xs: 1.71 }}>
                <Button
                  onClick={() => handleSelectDay(dayNum)}
                  sx={{
                    minWidth: 0,
                    width: 34,
                    height: 34,
                    p: 0,
                    borderRadius: 2.5,
                    fontSize: '0.85rem',
                    fontWeight: isSelected || isToday ? 700 : 500,
                    bgcolor: isSelected ? '#0284c7' : 'transparent',
                    color: isSelected ? '#ffffff' : isToday ? '#0284c7' : 'text.primary',
                    border: isToday && !isSelected ? '1.5px solid #0284c7' : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? '#0284c7' : 'rgba(2, 132, 199, 0.1)',
                    },
                  }}
                >
                  {dayNum}
                </Button>
              </Grid>
            )
          })}
        </Grid>

        {/* Footer Jump to Today */}
        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            size="small"
            onClick={handleJumpToToday}
            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Jump to Today
          </Button>
        </Box>
      </Popover>
    </>
  )
}
