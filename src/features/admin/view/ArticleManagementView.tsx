'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import ArticleFormModal, { ArticleFormData } from '../components/ArticleFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
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
import { HealthArticle, ArticleCategory } from '../types/admin.types';

const initialArticleFormData: ArticleFormData = {
  title: '',
  category: 'Anemia & TTD',
  author: 'Tim Ahli Gizi & UKS',
  summary: '',
  content: '',
  readTime: '3 min read',
  status: 'Terbit',
  imageUrl: '',
};

export default function ArticleManagementView() {
  const router = useRouter();
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [submitting, setSubmitting] = useState(false);

  // Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<ArticleFormData>(initialArticleFormData);

  // Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: articleToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // Hook Feedback Notifikasi
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
      category: (article.category as ArticleCategory) || 'Anemia & TTD',
      author: article.author,
      summary: article.summary || '',
      content: article.content || article.summary || '',
      readTime: article.readTime,
      status: article.status,
      imageUrl: article.imageUrl || '',
    });
  };

  const handlePreviewArticle = (articleId: string) => {
    router.push(`/admin/articles/${articleId}`);
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
          summary: formData.summary || 'Ringkasan materi edukasi kesehatan remaja putri.',
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
          <Typography variant='subtitle2' color='text.primary' sx={{ fontWeight: 600 }}>
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
                bgcolor: '#ffe4e6',
                color: '#e11d48',
                fontWeight: 700,
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
        border: '1px solid #fce7f3',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        boxShadow: '0 2px 8px rgba(225, 29, 72, 0.04)',
      }}
    >
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#fafafa',
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1,
          borderTop: '1px solid #f1f5f9',
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
            sx={{ bgcolor: '#f1f5f9', color: '#334155', '&:hover': { bgcolor: '#e2e8f0' } }}
          >
            <Edit size={16} />
          </IconButton>
          <IconButton
            size='small'
            color='error'
            onClick={() => handleDeleteRequest(article.id)}
            sx={{ bgcolor: '#fff1f2', color: '#e11d48', '&:hover': { bgcolor: '#ffe4e6' } }}
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
        subtitle='Publikasikan konten medis interaktif untuk meningkatkan kepatuhan dan pemahaman siswi.'
      />

      {/* Filter Bar */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 1.75, sm: 2.5 },
          mb: 3,
          borderRadius: { xs: 2.5, sm: 3 },
          border: '1px solid #fce7f3',
          boxShadow: '0 2px 8px rgba(225, 29, 72, 0.03)',
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
                <MenuItem value='Anemia & TTD'>Anemia & TTD</MenuItem>
                <MenuItem value='Nutrisi & Gizi'>Nutrisi & Gizi</MenuItem>
                <MenuItem value='Kesehatan Remaja'>Kesehatan Remaja</MenuItem>
                <MenuItem value='Tips Menstruasi'>Tips Menstruasi</MenuItem>
                <MenuItem value='Mitos & Fakta'>Mitos & Fakta</MenuItem>
                <MenuItem value='Gaya Hidup'>Gaya Hidup</MenuItem>
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

      {/* Add/Edit Article Modal Component */}
      <ArticleFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSubmit={handleSaveArticle}
        updateFormData={updateFormData}
        showToast={showToast}
      />

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
