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
  Avatar,
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
import { Search, UserPlus, BellRing, Edit, Trash2, Phone, User, Activity } from 'lucide-react'
import AdminHeader from './AdminHeader'
import SendReminderModal from './SendReminderModal'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import {
  getPatientsAction,
  createPatientAction,
  updatePatientAction,
  deletePatientAction,
  sendPatientReminderAction,
} from '../api/adminRepository'
import { PatientUser } from '../types/admin.types'

export default function UserManagementView() {
  const [patients, setPatients] = useState<PatientUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState<string>('Semua')
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null)

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false)
  const [reminderData, setReminderData] = useState<{
    patientId?: string
    patientName: string
    patientPhone?: string
  }>({
    patientName: '',
  })

  // Toast Notification State
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = React.useCallback(async () => {
    const data = await getPatientsAction()
    setPatients(data)
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const init = async () => {
      const data = await getPatientsAction()
      if (isMounted) {
        setPatients(data)
      }
    }
    init()
    return () => {
      isMounted = false
    }
  }, [])

  // Form State
  const [formData, setFormData] = useState<{
    name: string
    age: string
    gender: 'Laki-laki' | 'Perempuan'
    phone: string
    email: string
    riskLevel: 'Tinggi' | 'Sedang' | 'Rendah'
    assignedDoctor: string
    medicalNotes: string
  }>({
    name: '',
    age: '',
    gender: 'Laki-laki',
    phone: '',
    email: '',
    riskLevel: 'Rendah',
    assignedDoctor: 'dr. Siti Rahma, Sp.PD',
    medicalNotes: '',
  })

  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRisk = riskFilter === 'Semua' || p.riskLevel === riskFilter
    return matchesSearch && matchesRisk
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name: '',
      age: '',
      gender: 'Laki-laki',
      phone: '',
      email: '',
      riskLevel: 'Rendah',
      assignedDoctor: 'dr. Siti Rahma, Sp.PD',
      medicalNotes: '',
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (patient: PatientUser) => {
    setEditingId(patient.id)
    setFormData({
      name: patient.name,
      age: patient.age.toString(),
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      riskLevel: patient.riskLevel,
      assignedDoctor: patient.assignedDoctor,
      medicalNotes: patient.medicalNotes || '',
    })
    setOpenModal(true)
  }

  const handleSavePatient = async () => {
    if (!formData.name || !formData.age) return
    setSubmitting(true)

    if (editingId) {
      const res = await updatePatientAction(editingId, {
        name: formData.name,
        age: parseInt(formData.age) || 30,
        gender: formData.gender,
        phone: formData.phone,
        email: formData.email,
        riskLevel: formData.riskLevel,
        assignedDoctor: formData.assignedDoctor,
        medicalNotes: formData.medicalNotes,
      })

      if (res.success) {
        await loadData()
        setToastMsg('Data pasien berhasil diperbarui di database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal memperbarui pasien')
        setToastOpen(true)
      }
    } else {
      const res = await createPatientAction({
        name: formData.name,
        age: parseInt(formData.age) || 30,
        gender: formData.gender,
        phone: formData.phone || '0812-0000-0000',
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        riskLevel: formData.riskLevel,
        assignedDoctor: formData.assignedDoctor,
        medicalNotes: formData.medicalNotes,
      })

      if (res.success) {
        await loadData()
        setToastMsg('Pasien baru berhasil disimpan ke database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal menambahkan pasien')
        setToastOpen(true)
      }
    }

    setSubmitting(false)
  }

  const handleDeleteRequest = (id: string) => {
    setPatientToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      const res = await deletePatientAction(patientToDelete)
      if (res.success) {
        await loadData()
        setToastMsg('Pasien berhasil dihapus dari database.')
      } else {
        setToastMsg(res.error || 'Gagal menghapus pasien')
      }
      setToastOpen(true)
    }
    setDeleteConfirmOpen(false)
  }

  const handleOpenReminder = (patient: PatientUser) => {
    setReminderData({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
    })
    setReminderModalOpen(true)
  }

  const handleSendReminderSuccess = async (channel: 'app' | 'whatsapp') => {
    if (reminderData.patientId) {
      await sendPatientReminderAction(
        reminderData.patientId,
        `Pengingat dikirim melalui ${channel}`
      )
      await loadData()
    }
    const channelName = channel === 'whatsapp' ? 'WhatsApp' : 'Notifikasi App'
    setToastMsg(`Pengingat berhasil dikirimkan ke ${reminderData.patientName} via ${channelName}!`)
    setToastOpen(true)
  }

  const columns: Column<PatientUser>[] = [
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
      id: 'profil',
      label: 'Profil Pasien',
      width: '30%',
      renderCell: (patient) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 600 }}>
            {patient.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" color="text.primary">
              {patient.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {patient.id} • {patient.age} th ({patient.gender.charAt(0)})
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
              <Phone size={12} /> {patient.phone}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'informasi',
      label: 'Informasi Medis',
      width: '20%',
      renderCell: (patient) => (
        <Box>
          <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <User size={14} color="#64748b" /> {patient.assignedDoctor.split(',')[0]}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Activity size={14} /> {patient.activeSchedulesCount} Jadwal Aktif
          </Typography>
        </Box>
      ),
    },
    {
      id: 'risiko',
      label: 'Tingkat Risiko',
      width: '15%',
      renderCell: (patient) => (
        <Chip
          label={patient.riskLevel}
          size="small"
          color={
            patient.riskLevel === 'Tinggi' ? 'error' :
              patient.riskLevel === 'Sedang' ? 'warning' : 'success'
          }
        />
      ),
    },
    {
      id: 'kepatuhan',
      label: 'Kepatuhan',
      width: '15%',
      renderCell: (patient) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: patient.adherenceRate >= 90 ? 'success.main' : patient.adherenceRate >= 80 ? 'warning.main' : 'error.main',
            }}
          >
            {patient.adherenceRate}%
          </Typography>
          <Chip
            label={patient.adherenceRate >= 90 ? 'Tinggi' : patient.adherenceRate >= 80 ? 'Sedang' : 'Rendah'}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.65rem',
              bgcolor: patient.adherenceRate >= 90 ? 'rgba(16, 185, 129, 0.1)' : patient.adherenceRate >= 80 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: patient.adherenceRate >= 90 ? 'success.main' : patient.adherenceRate >= 80 ? 'warning.dark' : 'error.main',
            }}
          />
        </Box>
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '15%',
      renderCell: (patient) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Kirim Pengingat">
            <IconButton
              size="small"
              onClick={() => handleOpenReminder(patient)}
              sx={{ color: 'primary.main', bgcolor: 'primary.light', '&:hover': { bgcolor: 'rgba(14, 165, 233, 0.2)' } }}
            >
              <BellRing size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Pasien">
            <IconButton size="small" onClick={() => handleOpenEdit(patient)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Pasien">
            <IconButton size="small" color="error" onClick={() => handleDeleteRequest(patient.id)}>
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
        title="Manajemen Pasien"
        subtitle="Kelola data profil pasien, pantau tingkat kepatuhan, dan atur pengingat medis."
      />

      {/* Action Bar & Filters */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 280 }}>
            <TextField
              placeholder="Cari nama, ID, email..."
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
              <Select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                <MenuItem value="Semua">Semua Risiko</MenuItem>
                <MenuItem value="Tinggi">Risiko Tinggi</MenuItem>
                <MenuItem value="Sedang">Risiko Sedang</MenuItem>
                <MenuItem value="Rendah">Risiko Rendah</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            startIcon={<UserPlus size={18} />}
            onClick={handleOpenAdd}
          >
            Tambah Pasien
          </Button>
        </Box>
      </Card>

      {/* Patient Table */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        emptyMessage="Tidak ada pasien yang ditemukan."
      />

      {/* Add/Edit Patient Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Data Pasien' : 'Tambah Pasien Baru'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nama Lengkap Pasien"
              fullWidth
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Usia (Tahun)"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Jenis Kelamin</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Jenis Kelamin"
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Laki-laki' | 'Perempuan' })}
                  >
                    <MenuItem value="Laki-laki">Laki-laki</MenuItem>
                    <MenuItem value="Perempuan">Perempuan</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Nomor WhatsApp"
                  fullWidth
                  size="small"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Alamat Email"
                  fullWidth
                  size="small"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Tingkat Risiko</InputLabel>
                  <Select
                    value={formData.riskLevel}
                    label="Tingkat Risiko"
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as 'Tinggi' | 'Sedang' | 'Rendah' })}
                  >
                    <MenuItem value="Rendah">Risiko Rendah</MenuItem>
                    <MenuItem value="Sedang">Risiko Sedang</MenuItem>
                    <MenuItem value="Tinggi">Risiko Tinggi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Dokter"
                  fullWidth
                  size="small"
                  value={formData.assignedDoctor}
                  onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Catatan Medis Awal"
              multiline
              rows={3}
              fullWidth
              size="small"
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSavePatient} variant="contained" disabled={submitting}>
            {editingId ? 'Simpan Perubahan' : 'Tambah Pasien'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus pasien ini? Data tidak dapat dikembalikan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Hapus Pasien</Button>
        </DialogActions>
      </Dialog>

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        patientName={reminderData.patientName}
        patientPhone={reminderData.patientPhone}
        onSendSuccess={handleSendReminderSuccess}
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
