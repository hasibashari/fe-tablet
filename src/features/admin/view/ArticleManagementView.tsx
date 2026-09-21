'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Paper,
} from '@mui/material';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  UploadCloud,
  Image as ImageIcon,
  X,
  Sparkles,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  getAdminArticlesAction,
  createAdminArticleAction,
  updateAdminArticleAction,
  deleteAdminArticleAction,
} from '../api/articleRepository';
import { generateAiArticleDraftAction } from '@/src/lib/gemini';
import { HealthArticle } from '../types/admin.types';

interface ArticleFormData {
  title: string;
  category: 'Hipertensi' | 'Diabetes' | 'Nutrisi' | 'Gaya Hidup' | 'Kardiovaskular';
  author: string;
  summary: string;
  content: string;
  readTime: string;
  status: 'Terbit' | 'Draf';
  imageUrl: string;
}

const initialArticleFormData: ArticleFormData = {
  title: '',
  category: 'Hipertensi',
  author: 'dr. Siti Rahma, Sp.PD',
  summary: '',
  content: '',
  readTime: '5 min read',
  status: 'Terbit',
  imageUrl: '',
};

export default function ArticleManagementView() {
  const router = useRouter();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ArticleFormData>(initialArticleFormData);

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: articleToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  const loadData = useCallback(async () => {
    const data = await getAdminArticlesAction();
    setArticles(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdminArticlesAction().then(data => {
      if (isMounted) setArticles(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredArticles = articles.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const onOpenEdit = (article: HealthArticle) => {
    handleOpenEdit(article.id, {
      title: article.title,
      category: article.category,
      author: article.author,
      summary: article.summary || '',
      content: article.content || article.summary || '',
      readTime: article.readTime,
      status: article.status,
      imageUrl: article.imageUrl || '',
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Ukuran gambar maksimal 3MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = uploadEvent => {
        const base64Url = uploadEvent.target?.result as string;
        updateFormData({ imageUrl: base64Url });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    updateFormData({ imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePreviewArticle = (articleId: string) => {
    router.push(`/admin/articles/${articleId}`);
  };

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleGenerateAiArticle = async () => {
    const topic = formData.title.trim() || formData.category;
    if (!topic) {
      showToast('Ketik judul atau pilih kategori artikel terlebih dahulu', 'error');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await generateAiArticleDraftAction(topic, formData.category);
      if (res.success && res.data) {
        updateFormData({
          title: res.data.title || formData.title,
          summary: res.data.summary,
          content: res.data.content,
          readTime: res.data.readTime,
        });
        showToast('Draf artikel berhasil dibuat oleh Gemini AI!', 'success');
      } else {
        showToast(res.error || 'Gagal membuat artikel dengan AI', 'error');
      }
    } catch {
      showToast('Terjadi kesalahan saat memanggil AI', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!formData.title.trim()) {
      showToast('Judul artikel wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateAdminArticleAction(editingId, {
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary: formData.summary,
          content: formData.content,
          readTime: formData.readTime,
          status: formData.status,
          imageUrl: formData.imageUrl,
        });

        if (res.success) {
          await loadData();
          handleCloseModal();
          showToast('Artikel berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui artikel', 'error');
        }
      } else {
        const res = await createAdminArticleAction({
          title: formData.title,
          category: formData.category,
          author: formData.author,
          summary: formData.summary || 'Ringkasan artikel edukasi kesehatan untuk pasien.',
          content: formData.content,
          readTime: formData.readTime,
          status: formData.status,
          imageUrl: formData.imageUrl,
        });

        if (res.success) {
          await loadData();
          handleCloseModal();
          showToast('Artikel baru berhasil disimpan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan artikel', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (articleToDelete) {
      const res = await deleteAdminArticleAction(articleToDelete);
      if (res.success) {
        await loadData();
        showToast('Artikel berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus artikel', 'error');
      }
    }
    handleCloseDelete();
  };

  const columns: Column<HealthArticle>[] = [
    {
      id: 'no',
      label: 'No.',
      width: '5%',
      renderCell: (_, index) => (
        <Typography variant='body2' color='text.secondary'>
          {index + 1}
        </Typography>
      ),
    },
    {
      id: 'judul',
      label: 'Judul Artikel',
      width: '35%',
      renderCell: article => (
        <Box>
          <Typography variant='subtitle2' color='text.primary'>
            {article.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography variant='caption' color='text.secondary'>
              ID: {article.id}
            </Typography>
            <Chip
              label={article.category}
              size='small'
              sx={{
                height: 20,
                fontSize: '0.7rem',
                bgcolor: 'primary.light',
                color: 'primary.dark',
              }}
            />
          </Box>
        </Box>
      ),
    },
    {
      id: 'penulis',
      label: 'Penulis',
      width: '20%',
      renderCell: article => (
        <Typography variant='body2' color='text.primary' sx={{ fontWeight: 600 }}>
          {article.author}
        </Typography>
      ),
    },
    {
      id: 'publikasi_waktu',
      label: 'Publikasi & Waktu',
      width: '20%',
      renderCell: article => (
        <Box>
          <Typography variant='body2' color='text.primary'>
            {article.publishDate}
          </Typography>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
          >
            <Clock size={14} /> {article.readTime}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      width: '10%',
      renderCell: article => (
        <Chip
          label={article.status}
          size='small'
          color={article.status === 'Terbit' ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '10%',
      renderCell: article => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title='Lihat Detail Artikel'>
            <IconButton
              size='small'
              color='primary'
              onClick={() => handlePreviewArticle(article.id)}
            >
              <Eye size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Edit Artikel'>
            <IconButton size='small' onClick={() => onOpenEdit(article)}>
              <Edit size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Hapus Artikel'>
            <IconButton size='small' color='error' onClick={() => handleDeleteRequest(article.id)}>
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const renderMobileCard = (article: HealthArticle) => (
    <Card
      key={article.id}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
        },
      }}
    >
      {/* Top row: Image (if any) & Title & Category */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {article.imageUrl ? (
          <Box
            component='img'
            src={article.imageUrl}
            alt={article.title}
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              objectFit: 'cover',
              flexShrink: 0,
              bgcolor: 'grey.100',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 2,
              bgcolor: '#fff1f2',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ImageIcon size={28} />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={article.category}
              size='small'
              sx={{
                height: 20,
                fontSize: '0.68rem',
                bgcolor: '#ffe4e6',
                color: '#e11d48',
                fontWeight: 700,
              }}
            />
            <Chip
              label={article.status}
              size='small'
              color={article.status === 'Terbit' ? 'success' : 'default'}
              sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
            />
          </Box>
          <Typography
            variant='subtitle2'
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3,
            }}
          >
            {article.title}
          </Typography>
        </Box>
      </Box>

      {/* Author & Read Time */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'action.hover',
          borderRadius: 1.5,
          p: 1,
          fontSize: '0.75rem',
        }}
      >
        <Typography variant='caption' sx={{ fontWeight: 600, color: 'text.primary' }}>
          ✍️ {article.author}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Clock size={12} /> {article.readTime}
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          size='small'
          variant='outlined'
          startIcon={<Eye size={14} />}
          onClick={() => handlePreviewArticle(article.id)}
          sx={{
            borderRadius: 1.5,
            fontSize: '0.75rem',
            textTransform: 'none',
            borderColor: '#fecdd3',
            color: 'primary.main',
            '&:hover': { bgcolor: '#fff1f2', borderColor: 'primary.main' },
          }}
        >
          Pratinjau
        </Button>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size='small'
            onClick={() => onOpenEdit(article)}
            sx={{
              bgcolor: 'action.hover',
              color: 'text.primary',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            size='small'
            color='error'
            onClick={() => handleDeleteRequest(article.id)}
            sx={{
              bgcolor: '#fff1f2',
              color: '#e11d48',
              '&:hover': { bgcolor: '#ffe4e6' },
            }}
          >
            <Trash2 size={16} />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box>
      <AdminHeader
        title='Manajemen Artikel Edukasi'
        subtitle='Publikasikan konten medis interaktif untuk meningkatkan pengetahuan pasien.'
      />

      {/* Filter Bar */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 1.75, sm: 2.5 },
          mb: 3,
          borderRadius: { xs: 2.5, sm: 3 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
          }}
        >
          <Box
            sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, flex: 1 }}
          >
            <TextField
              placeholder='Cari judul artikel atau nama penulis...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              size='small'
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Search size={18} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size='small' sx={{ minWidth: { xs: '100%', sm: 180 } }}>
              <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <MenuItem value='Semua'>Semua Kategori</MenuItem>
                <MenuItem value='Hipertensi'>Hipertensi</MenuItem>
                <MenuItem value='Diabetes'>Diabetes</MenuItem>
                <MenuItem value='Nutrisi'>Nutrisi</MenuItem>
                <MenuItem value='Gaya Hidup'>Gaya Hidup</MenuItem>
                <MenuItem value='Kardiovaskular'>Kardiovaskular</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant='contained'
            startIcon={<Plus size={18} />}
            onClick={() => handleOpenAdd()}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              borderRadius: 2,
              fontWeight: 600,
              boxShadow: 'none',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            Tulis Artikel Baru
          </Button>
        </Box>
      </Card>

      {/* Articles Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredArticles}
        renderMobileCard={renderMobileCard}
        emptyMessage='Tidak ada artikel yang ditemukan.'
      />

      {/* Add/Edit Article Modal */}
      <CrudModalDialog
        open={openModal}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}
        onSubmit={handleSaveArticle}
        submitText={editingId ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
        submitting={submitting}
        maxWidth='md'
      >
        {/* Cover Image Upload Section */}
        <Box sx={{ mb: 1 }}>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 1 }}
          >
            Gambar Cover Artikel
          </Typography>

          <input
            type='file'
            accept='image/*'
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleImageFileChange}
          />

          {formData.imageUrl ? (
            <Paper
              variant='outlined'
              sx={{
                position: 'relative',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                component='img'
                src={formData.imageUrl}
                alt='Cover Preview'
                sx={{
                  width: '100%',
                  height: { xs: 140, sm: 180 },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  display: 'flex',
                  gap: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.65)',
                  borderRadius: 2,
                  p: 0.5,
                }}
              >
                <Button
                  size='small'
                  variant='text'
                  sx={{ color: '#fff', fontSize: '0.75rem', py: 0.25, px: 1, minWidth: 'auto' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Ganti
                </Button>
                <IconButton
                  size='small'
                  onClick={handleRemoveImage}
                  sx={{ color: '#fff', p: 0.25 }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            </Paper>
          ) : (
            <Paper
              variant='outlined'
              onClick={() => fileInputRef.current?.click()}
              sx={{
                p: { xs: 2, sm: 3 },
                textAlign: 'center',
                border: '2px dashed',
                borderColor: '#fecdd3',
                borderRadius: 2,
                bgcolor: '#fff1f2',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: '#ffe4e6',
                },
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: '#ffe4e6',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <UploadCloud size={24} />
              </Box>
              <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>
                Klik untuk upload gambar cover
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Format didukung: PNG, JPG, WebP (Maksimal 3MB)
              </Typography>
            </Paper>
          )}

          {/* Opsi input URL langsung */}
          <TextField
            placeholder='Atau tempelkan tautan URL gambar cover di sini...'
            fullWidth
            size='small'
            value={formData.imageUrl}
            onChange={e => updateFormData({ imageUrl: e.target.value })}
            sx={{ mt: 1.5 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <ImageIcon size={16} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        {/* AI Assistant Generator Banner */}
        <Paper
          elevation={0}
          sx={{
            p: 1.75,
            borderRadius: 2,
            border: '1px solid',
            borderColor: '#fecdd3',
            bgcolor: '#fff1f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 1.5,
                bgcolor: '#ffe4e6',
                color: 'primary.main',
                display: 'flex',
              }}
            >
              <Sparkles size={18} />
            </Box>
            <Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
                Asisten Penulis Medis AI
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Buat judul, ringkasan, dan materi edukasi otomatis dengan Gemini AI
              </Typography>
            </Box>
          </Box>

          <Button
            size='small'
            variant='contained'
            disabled={isGeneratingAi}
            onClick={handleGenerateAiArticle}
            startIcon={<Sparkles size={15} />}
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
              width: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
            }}
          >
            {isGeneratingAi ? 'Menulis Artikel...' : 'Tulis dengan AI ✨'}
          </Button>
        </Paper>

        <TextField
          label='Judul Artikel'
          fullWidth
          size='small'
          value={formData.title}
          onChange={e => updateFormData({ title: e.target.value })}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Kategori</InputLabel>
              <Select
                value={formData.category}
                label='Kategori'
                onChange={e =>
                  updateFormData({
                    category: e.target.value as ArticleFormData['category'],
                  })
                }
              >
                <MenuItem value='Hipertensi'>Hipertensi</MenuItem>
                <MenuItem value='Diabetes'>Diabetes</MenuItem>
                <MenuItem value='Nutrisi'>Nutrisi</MenuItem>
                <MenuItem value='Gaya Hidup'>Gaya Hidup</MenuItem>
                <MenuItem value='Kardiovaskular'>Kardiovaskular</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label='Penulis / Ahli Medis'
              fullWidth
              size='small'
              value={formData.author}
              onChange={e => updateFormData({ author: e.target.value })}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label='Waktu Baca (misal: 5 min read)'
              fullWidth
              size='small'
              value={formData.readTime}
              onChange={e => updateFormData({ readTime: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Status Publikasi</InputLabel>
              <Select
                value={formData.status}
                label='Status Publikasi'
                onChange={e =>
                  updateFormData({
                    status: e.target.value as ArticleFormData['status'],
                  })
                }
              >
                <MenuItem value='Terbit'>Terbit Langsung</MenuItem>
                <MenuItem value='Draf'>Simpan Sebagai Draf</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          label='Ringkasan Singkat (Summary)'
          multiline
          rows={2}
          fullWidth
          size='small'
          placeholder='Ringkasan 1-2 kalimat untuk kartu artikel...'
          value={formData.summary}
          onChange={e => updateFormData({ summary: e.target.value })}
        />

        <TextField
          label='Isi Konten Artikel (Paragraf Edukasi)'
          multiline
          rows={6}
          fullWidth
          size='small'
          placeholder='Tuliskan materi edukasi kesehatan secara lengkap di sini. Gunakan baris baru (enter dua kali) untuk memisahkan paragraf baru...'
          value={formData.content}
          onChange={e => updateFormData({ content: e.target.value })}
          helperText='Pisahkan paragraf dengan baris baru (enter 2x) agar tersusun rapi di tampilan user.'
        />
      </CrudModalDialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus artikel ini? Data tidak dapat dikembalikan.'
        confirmText='Hapus Artikel'
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
  );
}
