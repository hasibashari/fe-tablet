'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Search, Plus, BellRing, Edit, Trash2 } from 'lucide-react'
import AdminHeader from './AdminHeader'
import SendReminderModal from './SendReminderModal'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import {
  getSchedulesAction,
  getPatientsAction,
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
} from '../api/adminRepository'
import { MedicationSchedule, PatientUser } from '../types/admin.types'

export default function ScheduleManagementView() {
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([])
  const [patients, setPatients] = useState<PatientUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [reminderData, setReminderData] = useState<{
    patientName: string
    patientPhone?: string
    medicationName?: string
    dosage?: string
    timeSlot?: string
  }>({
    patientName: '',
  })

  // Toast Notification State
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = React.useCallback(async () => {
    const [s, p] = await Promise.all([getSchedulesAction(), getPatientsAction()])
    setSchedules(s)
    setPatients(p)
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const init = async () => {
      const [s, p] = await Promise.all([getSchedulesAction(), getPatientsAction()])
      if (isMounted) {
        setSchedules(s)
        setPatients(p)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Form State
  const [formData, setFormData] = useState<{
    patientId: string
    medicationName: string
    dosage: string
    frequency: string
    timeSlot: string
    category: 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis'
    instructions: string
  }>({
    patientId: '',
    medicationName: '',
    dosage: '1 Tablet',
    frequency: '1x Sehari',
    timeSlot: '08:00',
    category: 'Obat Resep',
    instructions: '',
  })

  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.medicationName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Semua' || s.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      patientId: patients[0]?.id || 'usr_1',
      medicationName: '',
      dosage: '1 Tablet',
      frequency: '1x Sehari',
      timeSlot: '08:00',
      category: 'Obat Resep',
      instructions: '',
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (schedule: MedicationSchedule) => {
    setEditingId(schedule.id)
    setFormData({
      patientId: schedule.patientId,
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      frequency: schedule.frequency,
      timeSlot: schedule.timeSlots.join(', '),
      category: schedule.category,
      instructions: schedule.instructions,
    })
    setOpenModal(true)
  }

  const handleSaveSchedule = async () => {
    if (!formData.medicationName) return

    const timeSlotsArray = formData.timeSlot.split(',').map((s) => s.trim())
    const today = new Date().toISOString().split('T')[0]

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
        setToastMsg('Jadwal berhasil diperbarui di database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal memperbarui jadwal')
        setToastOpen(true)
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
        setToastMsg('Jadwal baru berhasil disimpan ke database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal membuat jadwal')
        setToastOpen(true)
      }
    }
  }

  const handleDeleteRequest = (id: string) => {
    setScheduleToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
      const res = await deleteScheduleAction(scheduleToDelete)
      if (res.success) {
        await loadData()
        setToastMsg('Jadwal berhasil dihapus dari database.')
      } else {
        setToastMsg(res.error || 'Gagal menghapus jadwal')
      }
      setToastOpen(true)
    }
    setDeleteConfirmOpen(false)
  }

  const handleOpenReminder = (schedule: MedicationSchedule) => {
    const patientObj = patients.find((p) => p.id === schedule.patientId)
    setReminderData({
      patientName: schedule.patientName,
      patientPhone: patientObj?.phone || '0812-3456-7890',
      medicationName: schedule.medicationName,
      dosage: schedule.dosage,
      timeSlot: schedule.timeSlots.join(', ') + ' WIB',
    })
    setReminderModalOpen(true)
  }

  const handleSendSuccess = (channel: 'app' | 'whatsapp') => {
    const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'Notifikasi App'
    setToastMsg(`Pengingat obat berhasil dikirim ke ${reminderData.patientName} via ${channelName}!`)
    setToastOpen(true)
  }

  const columns: Column<MedicationSchedule>[] = [
    {
      id: 'no',
      label: 'No.',
      width: '5%',
      renderCell: (_, index) => (
        <Typography variant="body2" color="text.secondary">
          {index + 1}
        </Typography>
      ),
    },
    {
      id: 'pasien',
      label: 'Pasien',
      width: '20%',
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
      width: '28%',
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
            <Typography variant="caption" color="text.secondary">
              {schedule.instructions}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'dosis',
      label: 'Dosis',
      width: '16%',
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
        <Box>
          <Typography variant="body2" color="text.primary">
            {schedule.timeSlots.join(', ')}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '10%',
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
      renderCell: (schedule) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Ingatkan Pasien">
            <IconButton size="small" color="primary" onClick={() => handleOpenReminder(schedule)}>
              <BellRing size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Jadwal">
            <IconButton size="small" onClick={() => handleOpenEdit(schedule)}>
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
            onClick={handleOpenAdd}
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Jadwal Obat' : 'Buat Jadwal Baru'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Pasien</InputLabel>
              <Select
                value={formData.patientId}
                label="Pasien"
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Dosis (misal: 1 Tablet)"
                  fullWidth
                  size="small"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Frekuensi (misal: 2x Sehari)"
                  fullWidth
                  size="small"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Waktu Pengingat (HH:MM)"
                  fullWidth
                  size="small"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    label="Kategori"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'Obat Resep' | 'Suplemen' | 'Aktivitas Medis',
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
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveSchedule} variant="contained">
            {editingId ? 'Simpan Perubahan' : 'Simpan Jadwal'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus jadwal ini? Data yang dihapus tidak dapat dikembalikan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Hapus Jadwal</Button>
        </DialogActions>
      </Dialog>

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
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
          {toastMsg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
