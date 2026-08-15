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
import { Search, Plus, Eye, Edit, Trash2, Clock } from 'lucide-react'
import AdminHeader from './AdminHeader'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog'
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog'
import { ToastFeedback } from '@/src/shared/components/ToastFeedback'
import { useCrudModal } from '@/src/shared/hooks/useCrudModal'
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm'
import { useToast } from '@/src/shared/hooks/useToast'
import {
  getAdminArticlesAction,
  createAdminArticleAction,
  updateAdminArticleAction,
  deleteAdminArticleAction,
} from '../api/adminRepository'
import { HealthArticle } from '../types/admin.types'

interface ArticleFormData {
  title: string
  category: 'Hipertensi' | 'Diabetes' | 'Nutrisi' | 'Gaya Hidup' | 'Kardiovaskular'
  author: string
  summary: string
  readTime: string
  status: 'Terbit' | 'Draf'
}

const initialArticleFormData: ArticleFormData = {
  title: '',
  category: 'Hipertensi',
  author: 'dr. Siti Rahma, Sp.PD',
  summary: '',
  readTime: '5 min read',
  status: 'Terbit',
}

export default function ArticleManagementView() {
  const [articles, setArticles] = useState<HealthArticle[]>([])
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
  } = useCrudModal<ArticleFormData>(initialArticleFormData)

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: articleToDelete,
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
    const data = await getAdminArticlesAction()
    setArticles(data)
  }, [])

  useEffect(() => {
    let isMounted = true
    getAdminArticlesAction().then((data) => {
      if (isMounted) setArticles(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Semua' || a.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const onOpenEdit = (article: HealthArticle) => {
    handleOpenEdit(article.id, {
      title: article.title,
      category: article.category,
      author: article.author,
      summary: article.summary || '',
      readTime: article.readTime,
      status: article.status,
    })
  }

  const handleSaveArticle = async () => {
    if (!formData.title) {
      showToast('Judul artikel wajib diisi', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (editingId) {
        const res = await updateAdminArticleAction(editingId, {
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary: formData.summary,
          readTime: formData.readTime,
          status: formData.status,
        })

        if (res.success) {
          await loadData()
          handleCloseModal()
          showToast('Artikel berhasil diperbarui di database!', 'success')
        } else {
          showToast(res.error || 'Gagal memperbarui artikel', 'error')
        }
      } else {
        const res = await createAdminArticleAction({
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary: formData.summary || 'Ringkasan artikel edukasi kesehatan untuk pasien.',
          readTime: formData.readTime,
          status: formData.status,
        })

        if (res.success) {
          await loadData()
          handleCloseModal()
          showToast('Artikel baru berhasil disimpan ke database!', 'success')
        } else {
          showToast(res.error || 'Gagal menambahkan artikel', 'error')
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (articleToDelete) {
      const res = await deleteAdminArticleAction(articleToDelete)
      if (res.success) {
        await loadData()
        showToast('Artikel berhasil dihapus dari database.', 'success')
      } else {
        showToast(res.error || 'Gagal menghapus artikel', 'error')
      }
    }
    handleCloseDelete()
  }

  const columns: Column<HealthArticle>[] = [
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
      id: 'judul',
      label: 'Judul Artikel',
      width: '35%',
      renderCell: (article) => (
        <Box>
          <Typography variant="subtitle2" color="text.primary">
            {article.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              ID: {article.id}
            </Typography>
            <Chip 
              label={article.category} 
              size="small" 
              sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'primary.light', color: 'primary.dark' }} 
            />
          </Box>
        </Box>
      ),
    },
    {
      id: 'penulis',
      label: 'Penulis',
      width: '20%',
      renderCell: (article) => (
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
          {article.author}
        </Typography>
      ),
    },
    {
      id: 'publikasi_waktu',
      label: 'Publikasi & Waktu',
      width: '20%',
      renderCell: (article) => (
        <Box>
          <Typography variant="body2" color="text.primary">
            {article.publishDate}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
            <Clock size={14} /> {article.readTime}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '10%',
      renderCell: (article) => (
        <Chip
          label={article.status}
          size="small"
          color={article.status === 'Terbit' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: (article) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Preview Artikel">
            <IconButton size="small">
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Artikel">
            <IconButton size="small" onClick={() => onOpenEdit(article)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Hapus Artikel">
            <IconButton size="small" color="error" onClick={() => handleDeleteRequest(article.id)}>
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
        title="Manajemen Artikel Edukasi"
        subtitle="Publikasikan konten medis interaktif untuk meningkatkan pengetahuan pasien."
      />

      {/* Filter Bar */}
      <Card sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 280 }}>
            <TextField
              placeholder="Cari judul artikel atau nama penulis..."
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
                <MenuItem value="Hipertensi">Hipertensi</MenuItem>
                <MenuItem value="Diabetes">Diabetes</MenuItem>
                <MenuItem value="Nutrisi">Nutrisi</MenuItem>
                <MenuItem value="Gaya Hidup">Gaya Hidup</MenuItem>
                <MenuItem value="Kardiovaskular">Kardiovaskular</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenAdd()}
          >
            Tulis Artikel Baru
          </Button>
        </Box>
      </Card>

      {/* Articles Table */}
      <DataTable
        columns={columns}
        data={filteredArticles}
        emptyMessage="Tidak ada artikel yang ditemukan."
      />

      {/* Add/Edit Article Modal */}
      <CrudModalDialog
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}
        onSubmit={handleSaveArticle}
        submitText={editingId ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
        submitting={submitting}
      >
        <TextField
          label="Judul Artikel"
          fullWidth
          size="small"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.category}
                label="Kategori"
                onChange={(e) =>
                  updateFormData({
                    category: e.target.value as ArticleFormData['category'],
                  })
                }
              >
                <MenuItem value="Hipertensi">Hipertensi</MenuItem>
                <MenuItem value="Diabetes">Diabetes</MenuItem>
                <MenuItem value="Nutrisi">Nutrisi</MenuItem>
                <MenuItem value="Gaya Hidup">Gaya Hidup</MenuItem>
                <MenuItem value="Kardiovaskular">Kardiovaskular</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Penulis / Ahli Medis"
              fullWidth
              size="small"
              value={formData.author}
              onChange={(e) => updateFormData({ author: e.target.value })}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              label="Waktu (misal: 5 min)"
              fullWidth
              size="small"
              value={formData.readTime}
              onChange={(e) => updateFormData({ readTime: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Publikasi</InputLabel>
              <Select
                value={formData.status}
                label="Status Publikasi"
                onChange={(e) =>
                  updateFormData({
                    status: e.target.value as ArticleFormData['status'],
                  })
                }
              >
                <MenuItem value="Terbit">Terbit Langsung</MenuItem>
                <MenuItem value="Draf">Simpan Sebagai Draf</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          label="Ringkasan Artikel"
          multiline
          rows={3}
          fullWidth
          size="small"
          value={formData.summary}
          onChange={(e) => updateFormData({ summary: e.target.value })}
        />
      </CrudModalDialog>
      
      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus artikel ini? Data tidak dapat dikembalikan."
        confirmText="Hapus Artikel"
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
