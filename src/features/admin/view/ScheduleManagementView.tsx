'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Search, Plus, BellRing, Edit, Trash2 } from 'lucide-react'
import AdminHeader from '../components/AdminHeader'
import SendReminderModal from '../components/SendReminderModal'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog'
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog'
import { ToastFeedback } from '@/src/shared/components/ToastFeedback'
import { useCrudModal } from '@/src/shared/hooks/useCrudModal'
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm'
import { useToast } from '@/src/shared/hooks/useToast'
import {
  getSchedulesAction,
  getPatientsAction,
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
  sendReminderNudgeAction,
} from '../api/adminRepository'
import { MedicationSchedule, PatientUser } from '../types/admin.types'
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync'

interface ScheduleFormData {
  patientId: string
  medicationName: string
  dosage: string
  frequency: string
  timeSlot: string
  category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
  instructions: string
}

const initialScheduleFormData: ScheduleFormData = {
  patientId: '',
  medicationName: '',
  dosage: '1 Tablet',
  frequency: '1x Sehari',
  timeSlot: '08:00',
  category: 'Obat Resep',
  instructions: '',
}

export default function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([])
  const [patients, setPatients] = useState<PatientUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [submitting, setSubmitting] = useState(false)

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ScheduleFormData>(initialScheduleFormData)

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: scheduleToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>()

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast()

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [reminderData, setReminderData] = useState<{
    patientId?: string
    patientName: string
    patientPhone?: string
    scheduleId?: string
    medicationName?: string
    dosage?: string
    timeSlot?: string
  }>({
    patientName: '',
  })

  const loadData = useCallback(async () => {
    const [s, p] = await Promise.all([getSchedulesAction(), getPatientsAction()])
    setSchedules(s)
    setPatients(p)
  }, [])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      const [s, p] = await Promise.all([getSchedulesAction(), getPatientsAction()])
      if (isMounted) {
        setSchedules(s)
        setPatients(p)
      }
    }

    fetchData()

    // 1. Instant Cross-Tab Sync via BroadcastChannel (0s latency)
    const unsubscribe = subscribeRealtimeEvent((event) => {
      if (
        event.type === 'MEDICATION_TAKEN' ||
        event.type === 'SCHEDULE_UPDATED' ||
        event.type === 'NUDGE_DISMISSED'
      ) {
        fetchData()
      }
    })

    // 2. Smart Background Polling (every 8 seconds for multi-device sync)
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData()
      }
    }, 8000)

    // 3. Window focus listener
    const handleFocus = () => {
      fetchData()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      isMounted = false
      unsubscribe()
      clearInterval(pollInterval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Semua' || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const onOpenAdd = () => {
    handleOpenAdd({
      patientId: patients[0]?.id || 'usr_1',
    })
  }

  const onOpenEdit = (schedule: MedicationSchedule) => {
    handleOpenEdit(schedule.id, {
      patientId: schedule.patientId,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      frequency: schedule.frequency,
      timeSlot: schedule.timeSlots.join(', '),
      category: schedule.category,
      instructions: schedule.instructions,
    })
  }

  const handleSaveSchedule = async () => {
    if (!formData.medicationName) {
      showToast('Nama obat / suplemen wajib diisi', 'error')
      return
    }

    const rawSlots = formData.timeSlot
      .split(/[,;]+/)
      .map((s) => s.trim().replace('.', ':'))
      .filter((s) => s.length > 0)

    const timeSlotsArray = rawSlots.length > 0 ? rawSlots : ['08:00']
    const today = new Date().toISOString().split('T')[0]

    setSubmitting(true)
    try {
      if (editingId) {
        const res = await updateScheduleAction(editingId, {
          patientId: formData.patientId,
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          timeSlots: timeSlotsArray,
          category: formData.category,
          instructions: formData.instructions,
        })

        if (res.success) {
          await loadData()
          publishRealtimeEvent('SCHEDULE_UPDATED', { patientId: formData.patientId, scheduleId: editingId })
          handleCloseModal()
          showToast('Jadwal berhasil diperbarui di database!', 'success')
        } else {
          showToast(res.error || 'Gagal memperbarui jadwal', 'error')
        }
      } else {
        const res = await createScheduleAction({
          patientId: formData.patientId || patients[0]?.id || 'usr_1',
          medicationName: formData.medicationName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          timeSlots: timeSlotsArray,
          startDate: today,
          endDate: '2026-12-31',
          category: formData.category,
          instructions: formData.instructions || 'Diminum teratur sesuai petunjuk dokter.',
        })

        if (res.success) {
          await loadData()
          publishRealtimeEvent('SCHEDULE_UPDATED', { patientId: formData.patientId })
          handleCloseModal()
          showToast('Jadwal baru berhasil disimpan ke database!', 'success')
        } else {
          showToast(res.error || 'Gagal membuat jadwal', 'error')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
      const res = await deleteScheduleAction(scheduleToDelete)
      if (res.success) {
        await loadData()
        publishRealtimeEvent('SCHEDULE_UPDATED', { scheduleId: scheduleToDelete })
        showToast('Jadwal berhasil dihapus dari database.', 'success')
      } else {
        showToast(res.error || 'Gagal menghapus jadwal', 'error')
      }
    }
    handleCloseDelete()
  }

  const handleOpenReminder = (schedule: MedicationSchedule) => {
    const patientObj = patients.find((p) => p.id === schedule.patientId)
    setReminderData({
      patientId: schedule.patientId,
      patientName: schedule.patientName,
      patientPhone: patientObj?.phone || '0812-3456-7890',
      scheduleId: schedule.id,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      timeSlot: schedule.timeSlots.join(', ') + ' WIB',
    })
    setReminderModalOpen(true)
  }

  const handleSendSuccess = async (channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.patientId) {
      await sendReminderNudgeAction({
        patientId: reminderData.patientId,
        senderName: 'dr. Sarah Jenkins, Sp.GK',
        senderRole: 'Dokter Penanggung Jawab',
        scheduleId: reminderData.scheduleId,
        medicationName: reminderData.medicationName,
        dosage: reminderData.dosage,
        timeSlot: reminderData.timeSlot,
        message: messageSent,
        channel,
      })
      await loadData()
      publishRealtimeEvent('NUDGE_SENT', {
        patientId: reminderData.patientId,
        scheduleId: reminderData.scheduleId,
      })
    }
    const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'Notifikasi App'
    showToast(`Pengingat obat berhasil dikirim ke ${reminderData.patientName} via ${channelName}!`, 'success')
  }

  const columns: Column<MedicationSchedule>[] = [
    {
      id: 'no',
      label: 'No.',
      width: '4%',
      renderCell: (_, index) => (
        <Typography variant="body2" color="text.secondary">
          {index + 1}
        </Typography>
      ),
    },
    {
      id: 'pasien',
      label: 'Pasien',
      width: '18%',
      renderCell: (schedule) => (
        <>
          <Typography variant="subtitle2" color="text.primary">
            {schedule.patientName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {schedule.patientId}
          </Typography>
        </>
      ),
    },
    {
      id: 'obat',
      label: 'Obat / Tindakan',
      width: '24%',
      renderCell: (schedule) => (
        <Box>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            {schedule.medicationName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
            <Chip
              label={schedule.category}
              size="small"
              sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'primary.light', color: 'primary.dark' }}
            />
            <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
              {schedule.instructions}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'dosis',
      label: 'Dosis & Frekuensi',
      width: '15%',
      renderCell: (schedule) => (
        <>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            {schedule.dosage}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {schedule.frequency}
          </Typography>
        </>
      ),
    },
    {
      id: 'jadwal',
      label: 'Waktu',
      width: '14%',
      renderCell: (schedule) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {Array.isArray(schedule.timeSlots) && schedule.timeSlots.length > 0 ? (
            schedule.timeSlots.map((slot) => (
              <Chip
                key={slot}
                label={slot}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              -
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'todayStatus',
      label: 'Status Hari Ini',
      width: '13%',
      renderCell: (schedule) => {
        if (schedule.todayStatus === 'COMPLETED') {
          return (
            <Chip
              label="Sudah Diminum"
              size="small"
              sx={{
                bgcolor: 'rgba(22, 163, 74, 0.12)',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                borderRadius: 1,
              }}
            />
          )
        }
        if (schedule.todayStatus === 'PENDING') {
          return (
            <Chip
              label="Belum Diminum"
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.12)',
                color: '#b45309',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 22,
                borderRadius: 1,
              }}
            />
          )
        }
        return (
          <Typography variant="caption" color="text.secondary">
            -
          </Typography>
        )
      },
    },
    {
      id: 'status',
      label: 'Status',
      width: '8%',
      renderCell: (schedule) => (
        <Chip 
          label={schedule.status} 
          size="small" 
          color={schedule.status === 'Aktif' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: (schedule) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Ingatkan Pasien">
            <IconButton size="small" color="primary" onClick={() => handleOpenReminder(schedule)}>
              <BellRing size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Jadwal">
            <IconButton size="small" onClick={() => onOpenEdit(schedule)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Jadwal">
            <IconButton size="small" color="error" onClick={() => handleDeleteRequest(schedule.id)}>
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <AdminHeader
        title="Manajemen Jadwal Obat"
        subtitle="Tetapkan instruksi dosis, frekuensi, serta jadwal pengingat otomatis untuk setiap pasien."
      />

      {/* Filter Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 280 }}>
            <TextField
              placeholder="Cari nama obat atau pasien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="Semua">Semua Kategori</MenuItem>
                <MenuItem value="Obat Resep">Obat Resep</MenuItem>
                <MenuItem value="Suplemen">Suplemen</MenuItem>
                <MenuItem value="Aktivitas Medis">Aktivitas Medis</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={onOpenAdd}
          >
            Buat Jadwal Baru
          </Button>
        </Box>
      </Card>

      {/* Schedule Table */}
      <DataTable
        columns={columns}
        data={filteredSchedules}
        emptyMessage="Tidak ada jadwal yang ditemukan."
      />

      {/* Add/Edit Schedule Modal */}
      <CrudModalDialog
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Jadwal Obat' : 'Buat Jadwal Baru'}
        onSubmit={handleSaveSchedule}
        submitText={editingId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
        submitting={submitting}
      >
        <FormControl fullWidth size="small">
          <InputLabel>Pasien</InputLabel>
          <Select
            value={formData.patientId}
            label="Pasien"
            onChange={(e) => updateFormData({ patientId: e.target.value })}
          >
            {patients.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name} ({p.id})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Nama Obat / Suplemen"
          fullWidth
          size="small"
          value={formData.medicationName}
          onChange={(e) => updateFormData({ medicationName: e.target.value })}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Dosis (misal: 1 Tablet)"
              fullWidth
              size="small"
              value={formData.dosage}
              onChange={(e) => updateFormData({ dosage: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Frekuensi (misal: 2x Sehari)"
              fullWidth
              size="small"
              value={formData.frequency}
              onChange={(e) => updateFormData({ frequency: e.target.value })}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Waktu Pengingat (HH:MM)"
              fullWidth
              size="small"
              placeholder="08:00, 12:00, 20:00"
              helperText="Pisahkan dengan koma jika lebih dari 1 waktu"
              value={formData.timeSlot}
              onChange={(e) => updateFormData({ timeSlot: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.category}
                label="Kategori"
                onChange={(e) =>
                  updateFormData({
                    category: e.target.value as ScheduleFormData['category'],
                  })
                }
              >
                <MenuItem value="Obat Resep">Obat Resep</MenuItem>
                <MenuItem value="Suplemen">Suplemen</MenuItem>
                <MenuItem value="Aktivitas Medis">Aktivitas Medis</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          label="Petunjuk Khusus Penggunaan"
          multiline
          rows={2}
          fullWidth
          size="small"
          value={formData.instructions}
          onChange={(e) => updateFormData({ instructions: e.target.value })}
        />
      </CrudModalDialog>
      
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus jadwal ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus Jadwal"
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        patientName={reminderData.patientName}
        patientPhone={reminderData.patientPhone}
        medicationName={reminderData.medicationName}
        dosage={reminderData.dosage}
        timeSlot={reminderData.timeSlot}
        onSendSuccess={handleSendSuccess}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </Box>
  )
}
