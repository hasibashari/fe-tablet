'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Paper,
} from '@mui/material';
import { UploadCloud, Image as ImageIcon, X, Sparkles } from 'lucide-react';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { MarkdownEditor } from '@/src/shared/components/markdown';
import { generateAiArticleDraftAction } from '@/src/lib/gemini';
import { ArticleCategory } from '../types/admin.types';

export interface ArticleFormData {
  title: string;
  category: ArticleCategory;
  author: string;
  summary: string;
  content: string;
  readTime: string;
  status: 'Terbit' | 'Draf';
  imageUrl: string;
}

interface ArticleFormModalProps {
  open: boolean;
  editingId: string | null;
  formData: ArticleFormData;
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  updateFormData: (data: Partial<ArticleFormData>) => void;
  showToast: (msg: string, severity: 'success' | 'error') => void;
}

export default function ArticleFormModal({
  open,
  editingId,
  formData,
  submitting,
  onClose,
  onSubmit,
  updateFormData,
  showToast,
}: ArticleFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

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

  return (
    <CrudModalDialog
      open={open}
      onClose={onClose}
      title={editingId ? 'Edit Artikel Edukasi' : 'Tulis Artikel Edukasi Baru'}
      onSubmit={onSubmit}
      submitText={editingId ? 'Simpan Perubahan' : 'Publikasikan Artikel'}
      submitting={submitting}
      maxWidth='md'
    >
      {/* Cover Image Upload Section */}
      <Box sx={{ mb: 1.5 }}>
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
              border: '1px solid #fce7f3',
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
              <IconButton size='small' onClick={handleRemoveImage} sx={{ color: '#fff', p: 0.25 }}>
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
              border: '2px dashed #fecdd3',
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
          mb: 2,
          borderRadius: 2,
          border: '1px solid #fecdd3',
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
            <Typography
              variant='subtitle2'
              sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}
            >
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
        sx={{ mb: 2 }}
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
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
              <MenuItem value='Anemia & TTD'>Anemia & TTD</MenuItem>
              <MenuItem value='Nutrisi & Gizi'>Nutrisi & Gizi</MenuItem>
              <MenuItem value='Kesehatan Remaja'>Kesehatan Remaja</MenuItem>
              <MenuItem value='Tips Menstruasi'>Tips Menstruasi</MenuItem>
              <MenuItem value='Mitos & Fakta'>Mitos & Fakta</MenuItem>
              <MenuItem value='Gaya Hidup'>Gaya Hidup</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label='Penulis / Ahli Gizi UKS'
            fullWidth
            size='small'
            value={formData.author}
            onChange={e => updateFormData({ author: e.target.value })}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label='Waktu Baca (misal: 3 min read)'
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
        sx={{ mb: 2 }}
      />

      <Box sx={{ mt: 1 }}>
        <Typography
          variant='caption'
          sx={{ fontWeight: 700, color: '#334155', mb: 0.75, display: 'block' }}
        >
          Isi Konten Artikel (Markdown Format)
        </Typography>
        <MarkdownEditor
          value={formData.content}
          onChange={(content: string) => updateFormData({ content })}
          placeholder='Tuliskan materi edukasi kesehatan secara lengkap di sini menggunakan format Markdown...'
          minHeight={320}
        />
      </Box>
    </CrudModalDialog>
  );
}
