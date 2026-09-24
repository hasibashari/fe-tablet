'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  ButtonGroup,
  Button,
  Menu,
  MenuItem,
  Divider,
  Paper,
} from '@mui/material';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Eye,
  Edit3,
  Columns2,
  Sparkles,
  FileText,
  Clock,
  RotateCcw,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  readOnly?: boolean;
}

const TEMPLATES = [
  {
    title: 'Panduan Suplementasi TTD Remaja',
    content: `## Pentingnya Tablet Tambah Darah (TTD)
Remaja putri memiliki risiko anemia yang lebih tinggi karena siklus menstruasi bulanan dan masa pertumbuhan yang pesat.

> Tips UKS: Minum 1 tablet TTD setiap minggu setelah makan malam atau sarapan untuk penyerapan optimal!

### Manfaat Rutin Minum TTD:
- Menjaga konsentrasi belajar tetap optimal di sekolah
- Mencegah tubuh cepat lemas, letih, lesu, dan lunglai (5L)
- Meningkatkan daya tahan tubuh dari serangan penyakit

### Aturan Minum yang Benar:
1. Minum dengan **air putih** atau **jus jeruk/buah segar** (Vitamin C membantu penyerapan zat besi).
2. Hindari minum TTD bersamaan dengan **teh**, **kopi**, atau **susu** karena dapat menghambat penyerapan zat besi.
3. Jangan minum dalam keadaan perut kosong untuk menghindari rasa mual.`,
  },
  {
    title: 'Mitos vs Fakta Seputar Anemia & TTD',
    content: `## Mitos & Fakta Tablet Tambah Darah

Masih banyak anggapan keliru mengenai konsumsi suplemen zat besi di kalangan siswi sekolah. Mari kita bedah faktanya!

| Mitos | Fakta Sebenarnya |
|---|---|
| Minum TTD bikin tensi darah tinggi | TTD hanya menambah zat besi (Hb), bukan menaikkan tekanan darah |
| Tubuh gemuk pasti bebas anemia | Anemia berkaitan dengan kadar zat besi, bukan berat badan |
| TTD menyebabkan ketergantungan | TTD adalah suplemen nutrisi pencegahan, bukan obat adiktif |

> Fakta Medis: Minum TTD secara teratur 1 kali seminggu aman dikonsumsi jangka panjang dan direkomendasikan Kemenkes RI.`,
  },
  {
    title: 'Daftar Makanan Sumber Zat Besi & Gizi Seimbang',
    content: `## Pilihan Makanan Pencegah Anemia

Selain rutin meminum TTD, siswi disarankan memperbanyak konsumsi makanan tinggi zat besi:

### 1. Sumber Hewani (Zat Besi Heme):
- Hati ayam / sapi
- Daging merah tanpa lemak
- Ikan dan telur ayam

### 2. Sumber Nabati (Zat Besi Non-Heme):
- Bayam, daun kelor, dan brokoli
- Kacang kedelai, tahu, dan tempe
- Kacang merah dan kacang hijau

> Tips Sehat: Padukan makanan sumber zat besi dengan buah kaya Vitamin C (jeruk, jambu biji, tomat) agar penyerapannya maksimal di dalam tubuh!`,
  },
];

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Tulis isi artikel edukasi di sini menggunakan format Markdown...',
  minHeight = 320,
  readOnly = false,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [templateAnchor, setTemplateAnchor] = useState<null | HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const text = value || '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 150));
    return {
      charCount,
      words,
      readTime: `${readTimeMinutes} menit baca`,
    };
  }, [value]);

  // Insert markdown tag helper
  const insertToken = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length,
      );
    }, 0);
  };

  const handleApplyTemplate = (templateContent: string) => {
    onChange(templateContent);
    setTemplateAnchor(null);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid #fce7f3',
        overflow: 'hidden',
        bgcolor: '#ffffff',
        boxShadow: '0 2px 10px rgba(225, 29, 72, 0.03)',
      }}
    >
      {/* 1. Header Toolbar */}
      <Box
        sx={{
          p: 1,
          px: 1.5,
          bgcolor: '#fff1f2',
          borderBottom: '1px solid #fce7f3',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* Formatting Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
          <Tooltip title='Tebal (Ctrl+B)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('**', '**', 'teks tebal')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <Bold size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Miring (Ctrl+I)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('*', '*', 'teks miring')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <Italic size={16} />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <Tooltip title='Judul Utama (H2)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('\n## ', '\n', 'Judul Bagian')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <Heading2 size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Sub Judul (H3)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('\n### ', '\n', 'Sub Judul')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <Heading3 size={16} />
            </IconButton>
          </Tooltip>

          <Divider orientation='vertical' flexItem sx={{ mx: 0.5, my: 0.5 }} />

          <Tooltip title='Daftar Poin (Bullet List)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('\n- ', '\n', 'Poin artikel')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <List size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Daftar Nomor (Numbered List)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('\n1. ', '\n', 'Langkah pertama')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <ListOrdered size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Kotak Tips UKS / Catatan Penting'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() =>
                insertToken('\n> Tips UKS: ', '\n', 'Tulis pesan tips kesehatan di sini')
              }
              sx={{ color: '#e11d48', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <Quote size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Tabel Perbandingan'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() =>
                insertToken(
                  '\n| Topik | Keterangan |\n|---|---|\n| Data 1 | Penjelasan 1 |\n| Data 2 | Penjelasan 2 |\n',
                )
              }
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <TableIcon size={16} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Sisipkan Tautan (Link)'>
            <IconButton
              size='small'
              disabled={readOnly}
              onClick={() => insertToken('[', '](https://kemkes.go.id)', 'Tautan Kemenkes')}
              sx={{ color: '#881337', '&:hover': { bgcolor: '#ffe4e6' } }}
            >
              <LinkIcon size={16} />
            </IconButton>
          </Tooltip>

          {/* Quick Template Picker */}
          {!readOnly && (
            <>
              <Divider orientation='vertical' flexItem sx={{ mx: 0.5, my: 0.5 }} />
              <Button
                size='small'
                startIcon={<FileText size={14} />}
                onClick={e => setTemplateAnchor(e.currentTarget)}
                sx={{
                  color: '#be123c',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  bgcolor: '#ffe4e6',
                  borderRadius: '8px',
                  px: 1.2,
                  '&:hover': { bgcolor: '#fecdd3' },
                }}
              >
                Template
              </Button>
              <Menu
                anchorEl={templateAnchor}
                open={Boolean(templateAnchor)}
                onClose={() => setTemplateAnchor(null)}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: '12px',
                      border: '1px solid #fce7f3',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      minWidth: 260,
                    },
                  },
                }}
              >
                <Typography
                  variant='caption'
                  sx={{ px: 2, py: 0.5, fontWeight: 700, color: '#9f1239', display: 'block' }}
                >
                  Pilih Template Artikel
                </Typography>
                <Divider sx={{ my: 0.5 }} />
                {TEMPLATES.map((tmpl, idx) => (
                  <MenuItem
                    key={idx}
                    onClick={() => handleApplyTemplate(tmpl.content)}
                    sx={{ fontSize: '0.85rem', color: '#1e293b' }}
                  >
                    <Sparkles size={14} style={{ marginRight: 8, color: '#e11d48' }} />
                    {tmpl.title}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
        </Box>

        {/* View Switcher: Edit, Preview, Split */}
        <ButtonGroup
          size='small'
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '10px',
            p: 0.25,
            border: '1px solid #fecdd3',
          }}
        >
          <Button
            onClick={() => setViewMode('edit')}
            variant={viewMode === 'edit' ? 'contained' : 'text'}
            startIcon={<Edit3 size={13} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              py: 0.3,
              px: 1,
              bgcolor: viewMode === 'edit' ? '#e11d48' : 'transparent',
              color: viewMode === 'edit' ? '#ffffff' : '#64748b',
              '&:hover': { bgcolor: viewMode === 'edit' ? '#be123c' : '#fff1f2' },
            }}
          >
            Tulis
          </Button>
          <Button
            onClick={() => setViewMode('preview')}
            variant={viewMode === 'preview' ? 'contained' : 'text'}
            startIcon={<Eye size={13} />}
            sx={{
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              py: 0.3,
              px: 1,
              bgcolor: viewMode === 'preview' ? '#e11d48' : 'transparent',
              color: viewMode === 'preview' ? '#ffffff' : '#64748b',
              '&:hover': { bgcolor: viewMode === 'preview' ? '#be123c' : '#fff1f2' },
            }}
          >
            Pratinjau
          </Button>
          <Button
            onClick={() => setViewMode('split')}
            variant={viewMode === 'split' ? 'contained' : 'text'}
            startIcon={<Columns2 size={13} />}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              textTransform: 'none',
              fontSize: '0.72rem',
              fontWeight: 700,
              py: 0.3,
              px: 1,
              bgcolor: viewMode === 'split' ? '#e11d48' : 'transparent',
              color: viewMode === 'split' ? '#ffffff' : '#64748b',
              '&:hover': { bgcolor: viewMode === 'split' ? '#be123c' : '#fff1f2' },
            }}
          >
            Berdampingan
          </Button>
        </ButtonGroup>
      </Box>

      {/* 2. Editor Body */}
      <Box sx={{ minHeight, display: 'flex', position: 'relative' }}>
        {/* Write Pane */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRight: viewMode === 'split' ? '1px solid #fce7f3' : 'none',
            }}
          >
            <textarea
              ref={textareaRef}
              value={value}
              disabled={readOnly}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                flex: 1,
                minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
                padding: '16px',
                border: 'none',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '0.94rem',
                lineHeight: 1.7,
                color: '#1e293b',
                backgroundColor: '#ffffff',
              }}
            />
          </Box>
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <Box
            sx={{
              flex: 1,
              p: 2.5,
              minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
              overflowY: 'auto',
              bgcolor: '#fffbfb',
            }}
          >
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <Typography
                variant='body2'
                color='text.disabled'
                sx={{ fontStyle: 'italic', textAlign: 'center', mt: 4 }}
              >
                Pratinjau artikel akan muncul di sini saat Anda mulai menulis...
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* 3. Footer Stats Bar */}
      <Box
        sx={{
          p: 0.75,
          px: 2,
          bgcolor: '#fafafa',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <span>{stats.words} kata</span>
          <span>•</span>
          <span>{stats.charCount} karakter</span>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            color: '#e11d48',
            fontWeight: 600,
          }}
        >
          <Clock size={13} />
          <span>{stats.readTime}</span>
        </Box>
      </Box>
    </Paper>
  );
}
