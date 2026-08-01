import React from 'react'
import { Reminder } from '../types'
import { Card, CardContent, Typography, Box, IconButton, Chip } from '@mui/material'
import { Clock, CheckCircle2, Circle, Pill, Stethoscope, Activity } from 'lucide-react'

interface ReminderCardProps {
  reminder: Reminder
  onToggleStatus?: (id: string, currentStatus: string) => void
}

export default function ReminderCard({ reminder, onToggleStatus }: ReminderCardProps) {
  const isCompleted = reminder.status === 'COMPLETED'
  const isMissed = reminder.status === 'MISSED'

  const getIcon = () => {
    switch (reminder.type) {
      case 'MEDICATION': return <Pill size={20} />
      case 'CHECKUP': return <Stethoscope size={20} />
      case 'EXERCISE': return <Activity size={20} />
      default: return <Clock size={20} />
    }
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: isMissed
          ? 'error.light'
          : isCompleted
          ? 'divider'
          : 'var(--color-hairline, #e2e8f0)',
        bgcolor: isCompleted
          ? 'action.hover'
          : isMissed
          ? '#fef2f2'
          : '#ffffff',
        opacity: isCompleted ? 0.8 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: isCompleted ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          '&:last-child': { pb: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Icon Badge */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              bgcolor: isCompleted
                ? 'action.selected'
                : isMissed
                ? 'error.50'
                : 'rgba(2, 132, 199, 0.1)',
              color: isCompleted
                ? 'text.secondary'
                : isMissed
                ? 'error.main'
                : 'primary.main',
            }}
          >
            {getIcon()}
          </Box>

          {/* Details */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: isCompleted ? 'text.secondary' : 'text.primary',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {reminder.title}
            </Typography>

            {reminder.description && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {reminder.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Clock size={15} style={{ opacity: 0.7 }} />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: isMissed ? 'error.main' : 'text.secondary',
                }}
              >
                {reminder.time}
              </Typography>
              {isMissed && (
                <Chip
                  label="Missed"
                  size="small"
                  color="error"
                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Toggle Action */}
        <IconButton
          onClick={() => onToggleStatus && onToggleStatus(reminder.id, reminder.status)}
          disabled={isMissed}
          sx={{
            p: 1,
            color: isCompleted ? 'success.main' : 'action.active',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          aria-label="Toggle completion status"
        >
          {isCompleted ? (
            <CheckCircle2 size={28} />
          ) : (
            <Circle size={28} style={{ opacity: 0.3 }} />
          )}
        </IconButton>
      </CardContent>
    </Card>
  )
}

