'use client'

import React, { useState } from 'react'
import { Card, CardContent, Typography, Box, ButtonGroup, Button, Chip } from '@mui/material'
import { TrendingUp, Activity } from 'lucide-react'

export interface ChartDataPoint {
  day: string
  date: string
  adherence: number // Percentage 0 - 100
  totalReminders: number
  completedReminders: number
}

const DEFAULT_WEEKLY_DATA: ChartDataPoint[] = [
  { day: 'Mon', date: 'Jul 25', adherence: 75, totalReminders: 4, completedReminders: 3 },
  { day: 'Tue', date: 'Jul 26', adherence: 100, totalReminders: 4, completedReminders: 4 },
  { day: 'Wed', date: 'Jul 27', adherence: 80, totalReminders: 5, completedReminders: 4 },
  { day: 'Thu', date: 'Jul 28', adherence: 100, totalReminders: 4, completedReminders: 4 },
  { day: 'Fri', date: 'Jul 29', adherence: 100, totalReminders: 4, completedReminders: 4 },
  { day: 'Sat', date: 'Jul 30', adherence: 85, totalReminders: 4, completedReminders: 3 },
  { day: 'Sun', date: 'Jul 31', adherence: 100, totalReminders: 4, completedReminders: 4 },
]

export default function HealthLineChart() {
  const [activePoint, setActivePoint] = useState<ChartDataPoint | null>(
    DEFAULT_WEEKLY_DATA[DEFAULT_WEEKLY_DATA.length - 1]
  )
  const [range, setRange] = useState<'7d' | '30d'>('7d')

  // Calculate SVG curve path using cubic bezier smooth interpolation
  const width = 600
  const height = 200
  const paddingX = 40
  const paddingY = 30
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2

  const points = DEFAULT_WEEKLY_DATA.map((item, index) => {
    const x = paddingX + (index / (DEFAULT_WEEKLY_DATA.length - 1)) * chartWidth
    const y = height - paddingY - (item.adherence / 100) * chartHeight
    return { x, y, data: item }
  })

  // Create smooth bezier curve path
  const createSmoothPath = () => {
    if (points.length === 0) return ''
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const cpX = (p0.x + p1.x) / 2
      d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`
    }
    return d
  }

  const linePath = createSmoothPath()
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`

  const avgAdherence = Math.round(
    DEFAULT_WEEKLY_DATA.reduce((acc, d) => acc + d.adherence, 0) / DEFAULT_WEEKLY_DATA.length
  )

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'var(--color-hairline, #e2e8f0)',
        bgcolor: '#ffffff',
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Header Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                display: 'flex',
              }}
            >
              <Activity size={20} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem' }}>
                Health & Medication Trend
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                7-day adherence performance tracking
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={<TrendingUp size={14} style={{ color: '#16a34a' }} />}
              label={`Avg: ${avgAdherence}%`}
              size="small"
              sx={{
                bgcolor: 'rgba(34, 197, 94, 0.1)',
                color: '#15803d',
                fontWeight: 700,
              }}
            />
            <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: 1 }}>
              <Button
                onClick={() => setRange('7d')}
                variant={range === '7d' ? 'contained' : 'outlined'}
                sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}
              >
                7 Days
              </Button>
              <Button
                onClick={() => setRange('30d')}
                variant={range === '30d' ? 'contained' : 'outlined'}
                sx={{ textTransform: 'none', fontWeight: 600, px: 1.5 }}
              >
                30 Days
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* Active Point Highlight Box */}
        {activePoint && (
          <Box
            sx={{
              p: 1.5,
              px: 2,
              borderRadius: 1.5,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {activePoint.day} ({activePoint.date})
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Completed:{' '}
              <strong style={{ color: '#0284c7' }}>
                {activePoint.completedReminders}/{activePoint.totalReminders} ({activePoint.adherence}%)
              </strong>
            </Typography>
          </Box>
        )}

        {/* SVG Line Chart */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = height - paddingY - (val / 100) * chartHeight
              return (
                <g key={val}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#94a3b8"
                    fontWeight="500"
                  >
                    {val}%
                  </text>
                </g>
              )
            })}

            {/* Gradient Fill under path */}
            <path d={areaPath} fill="url(#chartGradient)" />

            {/* Smooth Curve Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, idx) => {
              const isSelected = activePoint?.day === pt.data.day
              return (
                <g key={idx} style={{ cursor: 'pointer' }} onClick={() => setActivePoint(pt.data)}>
                  {/* Outer Pulsing Aura when active */}
                  {isSelected && (
                    <circle cx={pt.x} cy={pt.y} r="10" fill="rgba(2, 132, 199, 0.2)" />
                  )}

                  {/* Main Point Circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? '6' : '4.5'}
                    fill={isSelected ? '#0284c7' : '#ffffff'}
                    stroke="#0284c7"
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  {/* X Axis Labels */}
                  <text
                    x={pt.x}
                    y={height - 8}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? '#0284c7' : '#64748b'}
                  >
                    {pt.data.day}
                  </text>
                </g>
              )
            })}
          </svg>
        </Box>
      </CardContent>
    </Card>
  )
}
