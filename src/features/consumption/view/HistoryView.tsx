'use client'

import React, { useEffect, useState, useMemo } from 'react'
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
  Divider,
} from '@mui/material'
import {
  Search,
  RotateCcw,
  Download,
  CalendarOff,
  History,
} from 'lucide-react'
import {
  ConsumptionLog,
  DateRangeFilter,
  CategoryFilter,
  StatusFilter,
} from '../types'
import {
  getConsumptionLogs,
  calculateConsumptionStats,
} from '../api/getConsumptionHistory'
import ConsumptionStatsCard from '../components/ConsumptionStatsCard'
import HistoryTimelineItem from '../components/HistoryTimelineItem'
import Pagination from '@/src/shared/components/Pagination'

export default function HistoryView() {
  const [logs, setLogs] = useState<ConsumptionLog[]>([])
  const [loading, setLoading] = useState(true)

  // Filters State
  const [dateRange, setDateRange] = useState<DateRangeFilter>('7_DAYS')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Pagination State
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getConsumptionLogs()
      setLogs(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Calculate dynamic stats based on all logs
  const stats = useMemo(() => calculateConsumptionStats(logs), [logs])

  // Filter logs based on active filters
  const filteredLogs = useMemo(() => {
    const today = new Date()

    return logs.filter((item) => {
      // 1. Date Range Filter
      if (dateRange !== 'ALL') {
        const itemDate = new Date(item.scheduledDate)
        const diffDays = Math.floor(
          (today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24)
        )

        if (dateRange === '7_DAYS' && diffDays > 7) return false
        if (dateRange === '14_DAYS' && diffDays > 14) return false
        if (dateRange === '30_DAYS' && diffDays > 30) return false
      }

      // 2. Category Filter
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false
      }

      // 3. Status Filter
      if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = item.title.toLowerCase().includes(q)
        const matchesDosage = item.dosage?.toLowerCase().includes(q) ?? false
        const matchesNotes = item.notes?.toLowerCase().includes(q) ?? false
        if (!matchesTitle && !matchesDosage && !matchesNotes) {
          return false
        }
      }

      return true
    })
  }, [logs, dateRange, categoryFilter, statusFilter, searchQuery])

  // Safe page derived during render without cascading useEffect renders
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredLogs.slice(start, start + pageSize)
  }, [filteredLogs, safePage, pageSize])

  // Group paginated logs by date
  const groupedLogs = useMemo(() => {
    const groups: { [dateStr: string]: ConsumptionLog[] } = {}

    paginatedLogs.forEach((item) => {
      if (!groups[item.scheduledDate]) {
        groups[item.scheduledDate] = []
      }
      groups[item.scheduledDate].push(item)
    })

    // Sort dates descending (newest first)
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map((dateStr) => ({
        date: dateStr,
        items: groups[dateStr],
      }))
  }, [paginatedLogs])

  const handleResetFilters = () => {
    setDateRange('7_DAYS')
    setCategoryFilter('ALL')
    setStatusFilter('ALL')
    setSearchQuery('')
    setPage(1)
  }

  const isFilterActive =
    dateRange !== '7_DAYS' ||
    categoryFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    searchQuery.trim() !== ''

  // Helper formatting for group date labels
  const formatGroupDateLabel = (dateStr: string) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const parsedDate = new Date(dateStr + 'T00:00:00')
    const formatted = parsedDate.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    if (dateStr === todayStr) {
      return `Hari Ini • ${formatted}`
    }
    if (dateStr === yesterdayStr) {
      return `Kemarin • ${formatted}`
    }
    return formatted
  }

  const handleExportSummary = () => {
    window.print()
  }

  return (
    <Box sx={{ pb: 6, width: '100%' }}>
      {/* Header Bar */}
      <Box
        sx={{
          mb: 3.5,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'rgba(204, 120, 92, 0.12)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <History size={24} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
              }}
            >
              Riwayat Aktivitas
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Pantau rekam jejak kepatuhan konsumsi obat dan riwayat pemeriksaan kesehatan Anda.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<Download size={18} />}
          onClick={handleExportSummary}
          sx={{
            borderRadius: 2,
            borderColor: 'var(--color-hairline, #e2e8f0)',
            color: 'text.primary',
            fontWeight: 600,
            textTransform: 'none',
            bgcolor: '#ffffff',
            px: 2.5,
            py: 1,
            minHeight: 40,
            width: { xs: '100%', sm: 'auto' },
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'rgba(204, 120, 92, 0.05)',
            },
          }}
        >
          Cetak Ringkasan
        </Button>
      </Box>

      {/* Loading Skeletons */}
      {loading ? (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={130} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={90} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={90} sx={{ borderRadius: 2 }} />
        </Stack>
      ) : (
        <>
          {/* Adherence Overview Cards */}
          <ConsumptionStatsCard stats={stats} />

          {/* Filter & Controls Panel */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'var(--color-hairline, #e2e8f0)',
              bgcolor: '#ffffff',
              mb: 4,
            }}
          >
            <Stack spacing={2.5}>
              {/* Row 1: Search & Date Range Selection */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                {/* Search Bar */}
                <TextField
                  placeholder="Cari obat, instruksi, atau catatan..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                  sx={{
                    width: { xs: '100%', sm: 320 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.5,
                      bgcolor: 'background.default',
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={18} style={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* Date Range Chips */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    overflowX: 'auto',
                    flexWrap: { xs: 'nowrap', sm: 'wrap' },
                    width: { xs: '100%', sm: 'auto' },
                    pb: { xs: 0.5, sm: 0 },
                    '&::-webkit-scrollbar': { height: 4 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 2 },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5, flexShrink: 0 }}>
                    Rentang:
                  </Typography>
                  {[
                    { key: '7_DAYS', label: '7 Hari' },
                    { key: '14_DAYS', label: '14 Hari' },
                    { key: '30_DAYS', label: '30 Hari' },
                    { key: 'ALL', label: 'Semua' },
                  ].map((range) => (
                    <Chip
                      key={range.key}
                      label={range.label}
                      size="small"
                      clickable
                      onClick={() => {
                        setDateRange(range.key as DateRangeFilter)
                        setPage(1)
                      }}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        flexShrink: 0,
                        bgcolor: dateRange === range.key ? 'primary.main' : 'background.default',
                        color: dateRange === range.key ? '#ffffff' : 'text.secondary',
                        border: '1px solid',
                        borderColor: dateRange === range.key ? 'primary.main' : 'divider',
                        '&:hover': {
                          bgcolor: dateRange === range.key ? 'primary.dark' : 'action.hover',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ borderColor: 'var(--color-hairline, #e2e8f0)' }} />

              {/* Row 2: Category & Status Filters */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  gap: 2,
                }}
              >
                {/* Category Chips */}
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
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5, flexShrink: 0 }}>
                    Kategori:
                  </Typography>
                  {[
                    { key: 'ALL', label: 'Semua' },
                    { key: 'MEDICATION', label: 'Obat' },
                    { key: 'CHECKUP', label: 'Pemeriksaan' },
                    { key: 'EXERCISE', label: 'Olahraga' },
                  ].map((cat) => (
                    <Chip
                      key={cat.key}
                      label={cat.label}
                      size="small"
                      clickable
                      onClick={() => {
                        setCategoryFilter(cat.key as CategoryFilter)
                        setPage(1)
                      }}
                      sx={{
                        fontWeight: categoryFilter === cat.key ? 700 : 500,
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        flexShrink: 0,
                        bgcolor: categoryFilter === cat.key ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                        color: categoryFilter === cat.key ? 'primary.main' : 'text.secondary',
                        border: '1px solid',
                        borderColor: categoryFilter === cat.key ? 'primary.light' : 'transparent',
                      }}
                    />
                  ))}
                </Box>

                {/* Status Chips */}
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
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 0.5, flexShrink: 0 }}>
                    Status:
                  </Typography>
                  {[
                    { key: 'ALL', label: 'Semua' },
                    { key: 'ON_TIME', label: 'Tepat Waktu' },
                    { key: 'LATE', label: 'Terlambat' },
                    { key: 'MISSED', label: 'Terlewat' },
                  ].map((st) => (
                    <Chip
                      key={st.key}
                      label={st.label}
                      size="small"
                      clickable
                      onClick={() => {
                        setStatusFilter(st.key as StatusFilter)
                        setPage(1)
                      }}
                      sx={{
                        fontWeight: statusFilter === st.key ? 700 : 500,
                        fontSize: '0.75rem',
                        borderRadius: 1.5,
                        flexShrink: 0,
                        bgcolor: statusFilter === st.key ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                        color: statusFilter === st.key ? 'text.primary' : 'text.secondary',
                      }}
                    />
                  ))}

                  {isFilterActive && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={handleResetFilters}
                      startIcon={<RotateCcw size={14} />}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        ml: { xs: 0, md: 'auto' },
                        flexShrink: 0,
                      }}
                    >
                      Reset
                    </Button>
                  )}
                </Box>
              </Box>
            </Stack>
          </Paper>

          {/* Grouped Timeline Logs */}
          {groupedLogs.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2,
                border: '1px dashed',
                borderColor: 'var(--color-hairline, #e2e8f0)',
                bgcolor: '#ffffff',
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  color: 'text.secondary',
                }}
              >
                <CalendarOff size={28} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                Tidak Ada Riwayat Ditemukan
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mb: 3 }}>
                Tidak ada catatan konsumsi yang sesuai dengan filter atau kata kunci yang Anda pilih.
              </Typography>
              {isFilterActive && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<RotateCcw size={16} />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Reset Semua Filter
                </Button>
              )}
            </Paper>
          ) : (
            <Stack spacing={4}>
              {groupedLogs.map((group) => {
                const completedInGroup = group.items.filter(
                  (i) => i.status === 'ON_TIME' || i.status === 'LATE'
                ).length
                const totalInGroup = group.items.length
                const groupRate = Math.round((completedInGroup / totalInGroup) * 100)

                return (
                  <Box key={group.date}>
                    {/* Date Group Header */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                        px: 0.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: groupRate === 100 ? 'success.main' : 'warning.main',
                          }}
                        />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {formatGroupDateLabel(group.date)}
                        </Typography>
                      </Box>

                      <Chip
                        label={`${completedInGroup}/${totalInGroup} Selesai (${groupRate}%)`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          bgcolor:
                            groupRate === 100
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'rgba(234, 179, 8, 0.1)',
                          color:
                            groupRate === 100 ? 'success.dark' : 'warning.dark',
                        }}
                      />
                    </Box>

                    {/* Timeline Items in this date */}
                    <Stack spacing={1.5}>
                      {group.items.map((item) => (
                        <HistoryTimelineItem key={item.id} item={item} />
                      ))}
                    </Stack>
                  </Box>
                )
              })}
            </Stack>
          )}

          {/* Pagination Footer */}
          {!loading && filteredLogs.length > 0 && (
            <Box sx={{ mt: 3, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                totalItems={filteredLogs.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setPage(1)
                }}
                pageSizeOptions={[5, 10, 20]}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
