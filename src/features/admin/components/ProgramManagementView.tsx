'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material'
import { Plus, Activity, Edit, Trash2, Users, Calendar } from 'lucide-react'
import AdminHeader from './AdminHeader'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import {
  getProgramsAction,
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from '../api/adminRepository'
import { HealthProgram } from '../types/admin.types'

export default function ProgramManagementView() {
  const [programs, setPrograms] = useState<HealthProgram[]>([])
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [programToDelete, setProgramToDelete] = useState<string | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  const loadData = React.useCallback(async () => {
    const data = await getProgramsAction()
    setPrograms(data)
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const init = async () => {
      const data = await getProgramsAction()
      if (isMounted) {
        setPrograms(data)
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
    code: string
    description: string
    durationWeeks: string
    targetCategory: string
    createdBy: string
  }>({
    name: '',
    code: '',
    description: '',
    durationWeeks: '12',
    targetCategory: 'Hipertensi',
    createdBy: 'dr. Siti Rahma, Sp.PD',
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      durationWeeks: '12',
      targetCategory: 'Hipertensi',
      createdBy: 'dr. Siti Rahma, Sp.PD',
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (program: HealthProgram) => {
    setEditingId(program.id)
    setFormData({
      name: program.name,
      code: program.code,
      description: program.description,
      durationWeeks: program.durationWeeks.toString(),
      targetCategory: program.targetCategory,
      createdBy: program.createdBy,
    })
    setOpenModal(true)
  }

  const handleSaveProgram = async () => {
    if (!formData.name) return

    if (editingId) {
      const res = await updateProgramAction(editingId, {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        durationWeeks: parseInt(formData.durationWeeks) || 12,
        targetCategory: formData.targetCategory,
      })

      if (res.success) {
        await loadData()
        setToastMsg('Program berhasil diperbarui di database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal memperbarui program')
        setToastOpen(true)
      }
    } else {
      const res = await createProgramAction({
        name: formData.name,
        code: formData.code || `PRG-${formData.name.substring(0, 4).toUpperCase()}`,
        description: formData.description || 'Program perawatan kesehatan terpimpin untuk pasien.',
        durationWeeks: parseInt(formData.durationWeeks) || 12,
        targetCategory: formData.targetCategory,
      })

      if (res.success) {
        await loadData()
        setToastMsg('Program baru berhasil dibuat di database!')
        setOpenModal(false)
        setToastOpen(true)
      } else {
        setToastMsg(res.error || 'Gagal membuat program')
        setToastOpen(true)
      }
    }
  }

  const handleDeleteRequest = (id: string) => {
    setProgramToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (programToDelete) {
      const res = await deleteProgramAction(programToDelete)
      if (res.success) {
        await loadData()
        setToastMsg('Program berhasil dihapus dari database.')
      } else {
        setToastMsg(res.error || 'Gagal menghapus program')
      }
      setToastOpen(true)
    }
    setDeleteConfirmOpen(false)
  }

  const columns: Column<HealthProgram>[] = [
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
      id: 'nama',
      label: 'Nama Program',
      width: '35%',
      renderCell: (program) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.dark' }}>
            <Activity size={20} />
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
              {program.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
              <Chip
                label={program.targetCategory}
                size="small"
                sx={{ height: 18, fontSize: '0.68rem', fontWeight: 600, bgcolor: 'primary.light', color: 'primary.dark' }}
              />
              <Typography variant="caption" color="text.secondary">
                Kode: {program.code}
              </Typography>
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: 'durasi',
      label: 'Durasi',
      width: '15%',
      renderCell: (program) => (
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
          <Calendar size={14} color="#64748b" /> {program.durationWeeks} Minggu
        </Typography>
      ),
    },
    {
      id: 'penanggungJawab',
      label: 'Dokter',
      width: '15%',
      renderCell: (program) => (
        <Typography variant="body2" color="text.primary">
          {program.createdBy.split(',')[0]}
        </Typography>
      ),
    },
    {
      id: 'peserta',
      label: 'Peserta',
      width: '10%',
      renderCell: (program) => (
        <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Users size={14} color="#64748b" /> {program.enrolledPatientsCount}
        </Typography>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '10%',
      renderCell: (program) => (
        <Chip 
          label={program.status} 
          size="small" 
          color={program.status === 'Aktif' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: (program) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Edit Program">
            <IconButton size="small" onClick={() => handleOpenEdit(program)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Program">
            <IconButton size="small" color="error" onClick={() => handleDeleteRequest(program.id)}>
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
        title="Manajemen Program Kesehatan"
        subtitle="Rancang paket perawatan kronis, intervensi pengobatan, dan pendampingan pola hidup pasien."
      />

      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" color="text.primary">
          Daftar Program Perawatan ({programs.length})
        </Typography>

        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={handleOpenAdd}
        >
          Buat Program Baru
        </Button>
      </Box>

      {/* Program Table */}
      <DataTable
        columns={columns}
        data={programs}
        emptyMessage="Tidak ada program yang ditemukan."
      />

      {/* Add/Edit Program Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Program Kesehatan' : 'Rancang Program Baru'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nama Program"
              fullWidth
              size="small"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Kode Program"
                  fullWidth
                  size="small"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Durasi (Minggu)"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.durationWeeks}
                  onChange={(e) => setFormData({ ...formData, durationWeeks: e.target.value })}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori Target</InputLabel>
                  <Select
                    value={formData.targetCategory}
                    label="Kategori Target"
                    onChange={(e) => setFormData({ ...formData, targetCategory: e.target.value })}
                  >
                    <MenuItem value="Hipertensi">Hipertensi</MenuItem>
                    <MenuItem value="Diabetes Melitus">Diabetes Melitus</MenuItem>
                    <MenuItem value="Kardiovaskular">Kardiovaskular</MenuItem>
                    <MenuItem value="Gizi & Nutrisi">Gizi & Nutrisi</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Dokter"
                  fullWidth
                  size="small"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Deskripsi & Goal Program"
              multiline
              rows={3}
              fullWidth
              size="small"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveProgram} variant="contained">
            {editingId ? 'Simpan Perubahan' : 'Simpan Program'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus program ini? Data tidak dapat dikembalikan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Hapus Program</Button>
        </DialogActions>
      </Dialog>

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
