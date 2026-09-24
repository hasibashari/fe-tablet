'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Article } from '../types';
import {
  getArticleByIdAction,
  getRelatedArticlesAction,
  toggleArticleBookmarkAction,
  isArticleBookmarkedAction,
} from '../api/educationRepository';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import ArticleCard from '../components/ArticleCard';
import { MarkdownRenderer } from '@/src/shared/components/markdown';
import {
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Button,
  Grid,
  Skeleton,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle2,
  ThumbsUp,
  BookOpen,
} from 'lucide-react';

interface ArticleDetailViewProps {
  articleId: string;
  backHref?: string;
}

export default function ArticleDetailView({
  articleId,
  backHref = '/user/education',
}: ArticleDetailViewProps) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const { user } = useAuth();
  const userId = user?.id || 'usr_1';

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const data = await getArticleByIdAction(articleId);
      if (isMounted) {
        setArticle(data);
        if (data) {
          const [related, bookmarkStatus] = await Promise.all([
            getRelatedArticlesAction(data.id, 3),
            isArticleBookmarkedAction(userId, data.id),
          ]);
          if (isMounted) {
            setRelatedArticles(related);
            setBookmarked(bookmarkStatus);
          }
        }
        setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [articleId, userId]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: article?.title,
            text: article?.summary,
            url: window.location.href,
          });
        } else {
          await navigator.clipboard.writeText(window.location.href);
          setSnackbarMessage('Tautan artikel berhasil disalin!');
          setSnackbarOpen(true);
        }
      } catch {
        // user cancelled share
      }
    }
  };

  const handleBookmarkToggle = async () => {
    if (!article) return;
    const res = await toggleArticleBookmarkAction(userId, article.id);
    if (res.success) {
      setBookmarked(res.isBookmarked);
      setSnackbarMessage(
        res.isBookmarked
          ? 'Artikel disimpan ke bookmark kamu'
          : 'Artikel dihapus dari bookmark',
      );
      setSnackbarOpen(true);
    }
  };

  const handleLikeToggle = () => {
    setLiked(prev => {
      const next = !prev;
      setLikeCount(c => (next ? c + 1 : c - 1));
      return next;
    });
  };

  if (loading) {
    return (
      <Box sx={{ pb: 8, maxWidth: 840, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant='rounded' width={160} height={36} sx={{ borderRadius: 999 }} />
          <Skeleton variant='rounded' width={80} height={36} sx={{ borderRadius: 999 }} />
        </Box>
        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant='rounded' width={120} height={28} sx={{ borderRadius: 999 }} />
          <Skeleton variant='text' width='90%' height={48} />
          <Skeleton variant='text' width='70%' height={32} />
        </Box>
        <Skeleton variant='rounded' width='100%' height={360} sx={{ borderRadius: 4, mb: 4 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Skeleton variant='text' width='100%' height={24} />
          <Skeleton variant='text' width='95%' height={24} />
          <Skeleton variant='text' width='90%' height={24} />
        </Box>
      </Box>
    );
  }

  if (!article) {
    return (
      <Box sx={{ py: 12, textAlign: 'center', maxWidth: 600, mx: 'auto', px: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            border: '1px solid #fce7f3',
            bgcolor: '#ffffff',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#ffe4e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              color: '#e11d48',
            }}
          >
            <BookOpen size={32} />
          </Box>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>
            Artikel Tidak Ditemukan
          </Typography>
          <Typography variant='body2' sx={{ color: '#64748b', mb: 4 }}>
            Artikel edukasi yang kamu cari mungkin telah dipindahkan atau belum tersedia.
          </Typography>
          <Button
            variant='contained'
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.push(backHref)}
            sx={{
              px: 3.5,
              py: 1.25,
              borderRadius: 999,
              bgcolor: '#e11d48',
              '&:hover': { bgcolor: '#be123c' },
            }}
          >
            Kembali ke Edukasi
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 10, maxWidth: 840, mx: 'auto', px: { xs: 2, sm: 3 } }}>
      {/* Top Bar Navigation & Actions */}
      <Box
        sx={{
          py: 2.5,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #fce7f3',
        }}
      >
        <Link href={backHref} style={{ textDecoration: 'none' }}>
          <Button
            variant='text'
            startIcon={<ArrowLeft size={18} />}
            sx={{
              color: '#64748b',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              borderRadius: 999,
              '&:hover': { bgcolor: '#fff1f2', color: '#e11d48' },
            }}
          >
            Kembali ke Edukasi
          </Button>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title='Bagikan Artikel'>
            <IconButton
              onClick={handleShare}
              sx={{
                border: '1px solid #fce7f3',
                bgcolor: '#ffffff',
                color: '#64748b',
                '&:hover': { bgcolor: '#fff1f2', color: '#e11d48' },
              }}
            >
              <Share2 size={18} />
            </IconButton>
          </Tooltip>

          <Tooltip title={bookmarked ? 'Hapus Bookmark' : 'Simpan Artikel'}>
            <IconButton
              onClick={handleBookmarkToggle}
              sx={{
                border: '1px solid #fce7f3',
                bgcolor: bookmarked ? '#ffe4e6' : '#ffffff',
                color: bookmarked ? '#e11d48' : '#64748b',
                '&:hover': { bgcolor: '#ffe4e6', color: '#e11d48' },
              }}
            >
              <Bookmark size={18} fill={bookmarked ? '#e11d48' : 'none'} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Article Header */}
      <Box sx={{ mb: 4 }}>
        <Chip
          label={article.category}
          size='small'
          sx={{
            bgcolor: '#ffe4e6',
            color: '#e11d48',
            fontWeight: 700,
            fontSize: '0.75rem',
            mb: 2,
            borderRadius: 1.5,
          }}
        />

        <Typography
          variant='h4'
          component='h1'
          sx={{
            fontWeight: 800,
            color: '#1e293b',
            lineHeight: 1.25,
            fontSize: { xs: '1.5rem', sm: '2rem' },
            mb: 2,
          }}
        >
          {article.title}
        </Typography>

        <Typography
          variant='body1'
          sx={{
            color: '#64748b',
            lineHeight: 1.6,
            fontSize: '1rem',
            mb: 3,
          }}
        >
          {article.summary}
        </Typography>

        {/* Metadata Bar */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            p: 2,
            bgcolor: '#fff5f7',
            borderRadius: 3,
            border: '1px solid #fce7f3',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={article.author?.avatarUrl}
              alt={article.author?.name || 'Tim Medis'}
              sx={{ width: 40, height: 40, border: '1.5px solid #fce7f3' }}
            >
              {article.author?.name?.charAt(0) || 'M'}
            </Avatar>
            <Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, color: '#1e293b' }}>
                {article.author?.name || 'Tim Medis Fe-Tablet'}
              </Typography>
              <Typography variant='caption' sx={{ color: '#64748b' }}>
                {article.author?.role || 'UKS & Fasilitator Kesehatan Remaja'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, color: '#64748b' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Calendar size={15} />
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                {article.publishedAt}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Clock size={15} />
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                {article.readTime}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Featured Cover Image */}
      {article.imageUrl && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 220, sm: 380 },
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className='object-cover'
            sizes='(max-width: 768px) 100vw, 840px'
            priority
          />
        </Box>
      )}

      {/* Key Takeaways Box if available */}
      {article.keyTakeaways && article.keyTakeaways.length > 0 && (
        <Box
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#fff1f2',
            borderRadius: 3,
            border: '1px solid #fecdd3',
          }}
        >
          <Typography
            variant='subtitle2'
            sx={{
              fontWeight: 800,
              color: '#be123c',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              mb: 1.5,
              fontSize: '0.78rem',
            }}
          >
            Poin Penting (Key Takeaways) 💡
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {article.keyTakeaways.map((point, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                <CheckCircle2 size={16} className='text-rose-600 shrink-0 mt-0.5' />
                <Typography variant='body2' sx={{ color: '#334155', fontWeight: 500 }}>
                  {point}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Main Markdown Content Body */}
      <Box sx={{ mb: 6 }}>
        <MarkdownRenderer
          content={
            article.content ||
            article.leadParagraph ||
            article.summary ||
            'Konten artikel belum tersedia.'
          }
        />
      </Box>

      {/* Like / Feedback Bar */}
      <Divider sx={{ my: 4, borderColor: '#fce7f3' }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          p: 2.5,
          bgcolor: '#fafafa',
          borderRadius: 3,
          border: '1px solid #f1f5f9',
        }}
      >
        <Typography variant='body2' sx={{ color: '#64748b', fontWeight: 600 }}>
          Apakah artikel ini bermanfaat untukmu?
        </Typography>
        <Button
          variant={liked ? 'contained' : 'outlined'}
          startIcon={<ThumbsUp size={16} />}
          onClick={handleLikeToggle}
          sx={{
            borderRadius: 999,
            px: 2.5,
            borderColor: liked ? '#e11d48' : '#cbd5e1',
            bgcolor: liked ? '#e11d48' : 'transparent',
            color: liked ? '#ffffff' : '#475569',
            '&:hover': {
              bgcolor: liked ? '#be123c' : '#f1f5f9',
            },
          }}
        >
          {liked ? `Bermanfaat (${likeCount})` : `Bermanfaat (${likeCount})`}
        </Button>
      </Box>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography
            variant='h6'
            sx={{ fontWeight: 800, color: '#1e293b', mb: 3 }}
          >
            Artikel Terkait Lainnya
          </Typography>
          <Grid container spacing={3}>
            {relatedArticles.map(rel => (
              <Grid key={rel.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ArticleCard article={rel} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity='success'
          sx={{ width: '100%', borderRadius: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
