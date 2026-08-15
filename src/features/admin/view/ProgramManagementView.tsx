'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Plus, Edit, Trash2, Users, Calendar } from 'lucide-react'
import AdminHeader from '../components/AdminHeader'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog'
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog'
import { ToastFeedback } from '@/src/shared/components/ToastFeedback'
import { useCrudModal } from '@/src/shared/hooks/useCrudModal'
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm'
import { useToast } from '@/src/shared/hooks/useToast'
import {
  getProgramsAction,
  createProgramAction,
  updateProgramAction,
  deleteProgramAction,
} from '../api/adminRepository'
import { HealthProgram } from '../types/admin.types'

interface ProgramFormData {
  name: string
  code: string
  description: string
  durationWeeks: string
  targetCategory: string
  createdBy: string
}

const initialProgramFormData: ProgramFormData = {
  name: '',
  code: '',
  description: '',
  durationWeeks: '12',
  targetCategory: 'Hipertensi',
  createdBy: 'dr. Siti Rahma, Sp.PD',
}

export default function ProgramManagementView() {
  const [programs, setPrograms] = useState<HealthProgram[]>([])
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
  } = useCrudModal<ProgramFormData>(initialProgramFormData)

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: programToDelete,
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

  const loadData = useCallback(async () => {
    const data = await getProgramsAction()
    setPrograms(data)
  }, [])

  useEffect(() => {
    let isMounted = true
    getProgramsAction().then((data) => {
      if (isMounted) setPrograms(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const onOpenEdit = (program: HealthProgram) => {
    handleOpenEdit(program.id, {
      name: program.name,
      code: program.code,
      description: program.description,
      durationWeeks: program.durationWeeks.toString(),
      targetCategory: program.targetCategory,
      createdBy: program.createdBy,
    })
  }

  const handleSaveProgram = async () => {
    if (!formData.name) {
      showToast('Nama program wajib diisi', 'error')
      return
    }

    setSubmitting(true)
    try {
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
          handleCloseModal()
          showToast('Program berhasil diperbarui di database!', 'success')
        } else {
          showToast(res.error || 'Gagal memperbarui program', 'error')
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
          handleCloseModal()
          showToast('Program baru berhasil dibuat di database!', 'success')
        } else {
          showToast(res.error || 'Gagal membuat program', 'error')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (programToDelete) {
      const res = await deleteProgramAction(programToDelete)
      if (res.success) {
        await loadData()
        showToast('Program berhasil dihapus dari database.', 'success')
      } else {
        showToast(res.error || 'Gagal menghapus program', 'error')
      }
    }
    handleCloseDelete()
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
            <IconButton size="small" onClick={() => onOpenEdit(program)}>
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
          onClick={() => handleOpenAdd()}
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
      <CrudModalDialog
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Program Kesehatan' : 'Rancang Program Baru'}
        onSubmit={handleSaveProgram}
        submitText={editingId ? 'Simpan Perubahan' : 'Simpan Program'}
        submitting={submitting}
      >
        <TextField
          label="Nama Program"
          fullWidth
          size="small"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Kode Program"
              fullWidth
              size="small"
              value={formData.code}
              onChange={(e) => updateFormData({ code: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Durasi (Minggu)"
              type="number"
              fullWidth
              size="small"
              value={formData.durationWeeks}
              onChange={(e) => updateFormData({ durationWeeks: e.target.value })}
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
                onChange={(e) => updateFormData({ targetCategory: e.target.value })}
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
              onChange={(e) => updateFormData({ createdBy: e.target.value })}
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
          onChange={(e) => updateFormData({ description: e.target.value })}
        />
      </CrudModalDialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus program ini? Data tidak dapat dikembalikan."
        confirmText="Hapus Program"
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
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
