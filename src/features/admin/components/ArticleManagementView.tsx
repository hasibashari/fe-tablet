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
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material'
import { Search, Plus, FileText, Eye, Edit, Trash2, Clock } from 'lucide-react'
import AdminHeader from './AdminHeader'
import { DataTable, Column } from '@/src/shared/components/DataTable'
import { initialArticles } from '../api/mockAdminData'
import { HealthArticle } from '../types/admin.types'

export default function ArticleManagementView() {
  const [articles, setArticles] = useState<HealthArticle[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [openModal, setOpenModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)

  const [toastOpen, setToastOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Form State
  const [formData, setFormData] = useState<{
    title: string
    category: 'Hipertensi' | 'Diabetes' | 'Nutrisi' | 'Gaya Hidup' | 'Kardiovaskular'
    author: string
    summary: string
    readTime: string
    status: 'Terbit' | 'Draf'
  }>({
    title: '',
    category: 'Hipertensi',
    author: 'dr. Siti Rahma, Sp.PD',
    summary: '',
    readTime: '5 min read',
    status: 'Terbit',
  })

  const filteredArticles = articles.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'Semua' || a.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({
      title: '',
      category: 'Hipertensi',
      author: 'dr. Siti Rahma, Sp.PD',
      summary: '',
      readTime: '5 min read',
      status: 'Terbit',
    })
    setOpenModal(true)
  }

  const handleOpenEdit = (article: HealthArticle) => {
    setEditingId(article.id)
    setFormData({
      title: article.title,
      category: article.category,
      author: article.author,
      summary: article.summary || '',
      readTime: article.readTime,
      status: article.status,
    })
    setOpenModal(true)
  }

  const handleSaveArticle = () => {
    if (!formData.title) return

    if (editingId) {
      setArticles((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title: formData.title,
                category: formData.category,
                author: formData.author,
                summary: formData.summary,
                readTime: formData.readTime,
                status: formData.status,
              }
            : a
        )
      )
      setToastMsg('Artikel berhasil diperbarui!')
    } else {
      const created: HealthArticle = {
        id: `ART-${articles.length + 101}`,
        title: formData.title,
        category: formData.category,
        author: formData.author,
        publishDate: new Date().toISOString().split('T')[0],
        status: formData.status,
        views: formData.status === 'Terbit' ? 12 : 0,
        summary: formData.summary || 'Ringkasan artikel edukasi kesehatan untuk pasien.',
        readTime: formData.readTime,
      }
      setArticles([created, ...articles])
      setToastMsg('Artikel baru berhasil diterbitkan!')
    }

    setOpenModal(false)
    setToastOpen(true)
  }

  const handleDeleteRequest = (id: string) => {
    setArticleToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (articleToDelete) {
      setArticles(articles.filter((a) => a.id !== articleToDelete))
      setToastMsg('Artikel berhasil dihapus.')
      setToastOpen(true)
    }
    setDeleteConfirmOpen(false)
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
            <IconButton size="small" onClick={() => handleOpenEdit(article)}>
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
            onClick={handleOpenAdd}
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Judul Artikel"
              fullWidth
              size="small"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Kategori</InputLabel>
                  <Select
                    value={formData.category}
                    label="Kategori"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as 'Hipertensi' | 'Diabetes' | 'Nutrisi' | 'Gaya Hidup' | 'Kardiovaskular',
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
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status Publikasi</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status Publikasi"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Terbit' | 'Draf',
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
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={handleSaveArticle} variant="contained">
            {editingId ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin menghapus artikel ini? Data tidak dapat dikembalikan.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} color="inherit">Batal</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Hapus Artikel</Button>
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
