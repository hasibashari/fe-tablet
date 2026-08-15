'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Article } from '../types'
import { getArticleById, getRelatedArticles, toggleArticleBookmark, isArticleBookmarked } from '../api/getArticles'
import { useAuth } from '@/src/features/auth/context/AuthContext'
import ArticleCard from '../components/ArticleCard'
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
} from '@mui/material'
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle2,
  Lightbulb,
  AlertTriangle,
  Quote,
  ThumbsUp,
  Sparkles,
  BookOpen,
} from 'lucide-react'

interface ArticleDetailViewProps {
  articleId: string
}

export default function ArticleDetailView({ articleId }: ArticleDetailViewProps) {
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(24)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  const { user } = useAuth()
  const userId = user?.id || 'usr_1'

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      const data = await getArticleById(articleId)
      if (isMounted) {
        setArticle(data)
        if (data) {
          const [related, bookmarkStatus] = await Promise.all([
            getRelatedArticles(data.id, 3),
            isArticleBookmarked(userId, data.id),
          ])
          if (isMounted) {
            setRelatedArticles(related)
            setBookmarked(bookmarkStatus)
          }
        }
        setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [articleId, userId])

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: article?.title,
            text: article?.summary,
            url: window.location.href,
          })
        } else {
          await navigator.clipboard.writeText(window.location.href)
          setSnackbarMessage('Article link copied to clipboard!')
          setSnackbarOpen(true)
        }
      } catch {
        // user cancelled share
      }
    }
  }

  const handleBookmarkToggle = async () => {
    if (!article) return
    const res = await toggleArticleBookmark(userId, article.id)
    if (res.success) {
      setBookmarked(res.isBookmarked)
      setSnackbarMessage(
        res.isBookmarked ? 'Article saved to your bookmarks' : 'Article removed from bookmarks'
      )
      setSnackbarOpen(true)
    }
  }

  const handleLikeToggle = () => {
    setLiked((prev) => {
      const next = !prev
      setLikeCount((c) => (next ? c + 1 : c - 1))
      return next
    })
  }

  if (loading) {
    return (
      <Box sx={{ pb: 8, maxWidth: 960, mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Navigation skeleton */}
        <Box sx={{ py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: 999 }} />
          <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 999 }} />
        </Box>

        {/* Centered Header Skeleton */}
        <Box sx={{ textAlign: 'center', my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Skeleton variant="rounded" width={120} height={28} sx={{ borderRadius: 999, mb: 2 }} />
          <Skeleton variant="text" width="85%" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" width={320} height={48} sx={{ borderRadius: 2 }} />
        </Box>

        {/* Featured Image Skeleton */}
        <Skeleton variant="rounded" width="100%" height={420} sx={{ borderRadius: 4, mb: 4 }} />

        {/* Content Body Skeleton */}
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <Skeleton variant="text" width="100%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="95%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={32} sx={{ mb: 4 }} />
          <Skeleton variant="rounded" width="100%" height={140} sx={{ borderRadius: 3, mb: 4 }} />
          <Skeleton variant="text" width="100%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="92%" height={28} sx={{ mb: 1 }} />
        </Box>
      </Box>
    )
  }

  if (!article) {
    return (
      <Box sx={{ py: 12, textAlign: 'center', maxWidth: 600, mx: 'auto', px: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 6,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              color: 'text.secondary',
            }}
          >
            <BookOpen size={32} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            Article Not Found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            The health article you are looking for might have been moved or is currently unavailable.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => router.push('/user/education')}
            sx={{ px: 3.5, py: 1.25 }}
          >
            Back to Health Education
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ pb: 10 }}>
      {/* ============================================================ */}
      {/* Top Bar Navigation & Actions */}
      {/* ============================================================ */}
      <Box
        sx={{
          py: 2.5,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Link href="/user/education" style={{ textDecoration: 'none' }}>
          <Button
            variant="text"
            startIcon={<ArrowLeft size={18} />}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              borderRadius: 2,
              '&:hover': {
                color: 'primary.dark',
                bgcolor: 'rgba(14, 165, 233, 0.08)',
              },
            }}
          >
            Back to Articles
          </Button>
        </Link>

        {/* Action icons: Bookmark & Share */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={bookmarked ? 'Remove Bookmark' : 'Bookmark Article'}>
            <IconButton
              onClick={handleBookmarkToggle}
              sx={{
                bgcolor: bookmarked ? 'rgba(14, 165, 233, 0.12)' : 'transparent',
                color: bookmarked ? 'primary.dark' : 'text.secondary',
                border: '1px solid',
                borderColor: bookmarked ? 'primary.light' : 'divider',
                '&:hover': {
                  bgcolor: 'rgba(14, 165, 233, 0.15)',
                  color: 'primary.dark',
                },
              }}
            >
              <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Share Article">
            <IconButton
              onClick={handleShare}
              sx={{
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'rgba(14, 165, 233, 0.08)',
                  color: 'primary.dark',
                },
              }}
            >
              <Share2 size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ============================================================ */}
      {/* Centered Content Section Container */}
      {/* ============================================================ */}
      <Box sx={{ maxWidth: 880, mx: 'auto', px: { xs: 1, sm: 2 } }}>
        {/* Centered Header */}
        <Box sx={{ textAlign: 'center', pt: 2, pb: 4 }}>
          {/* Category Badge */}
          <Chip
            label={article.category}
            sx={{
              bgcolor: 'rgba(14, 165, 233, 0.12)',
              color: 'primary.dark',
              fontWeight: 700,
              fontSize: '0.8125rem',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              px: 1.5,
              py: 0.5,
              mb: 2.5,
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.12)',
            }}
          />

          {/* Article Main H1 Title */}
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              lineHeight: 1.25,
              color: 'text.primary',
              letterSpacing: '-0.025em',
              mb: 2.5,
              maxWidth: 780,
              mx: 'auto',
            }}
          >
            {article.title}
          </Typography>

          {/* Article Summary / Subtitle */}
          <Typography
            variant="subtitle1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.6,
              maxWidth: 700,
              mx: 'auto',
              mb: 3.5,
            }}
          >
            {article.summary}
          </Typography>

          {/* Author & Meta Bar (Centered) */}
          <Box
            sx={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              bgcolor: 'background.paper',
              px: 3,
              py: 1.5,
              borderRadius: 9999,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
            }}
          >
            {article.author && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Avatar
                  src={article.author.avatar}
                  alt={article.author.name}
                  sx={{ width: 36, height: 36, border: '2px solid #ffffff' }}
                />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                    {article.author.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    {article.author.role}
                  </Typography>
                </Box>
              </Box>
            )}

            <Divider orientation="vertical" flexItem sx={{ height: 24, my: 'auto', borderColor: 'divider' }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
              <Calendar size={15} style={{ color: '#0284c7' }} />
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {article.publishedAt}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
              <Clock size={15} style={{ color: '#0284c7' }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {article.readTime}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Centered Featured Cover Image */}
        <Box sx={{ my: 3 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: { xs: 3, sm: 4 },
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 12px 32px -8px rgba(0, 0, 0, 0.08)',
              bgcolor: 'action.hover',
            }}
          >
            <Box
              component="img"
              src={article.imageUrl}
              alt={article.title}
              sx={{
                width: '100%',
                maxHeight: 460,
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Paper>
          {article.imageCaption && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: 'text.secondary',
                mt: 1.5,
                fontStyle: 'italic',
              }}
            >
              {article.imageCaption}
            </Typography>
          )}
        </Box>

        {/* ============================================================ */}
        {/* Centered Prose Body (Max width 760px for ergonomic reading) */}
        {/* ============================================================ */}
        <Box sx={{ maxWidth: 760, mx: 'auto', mt: 5 }}>
          {/* Lead Paragraph */}
          {article.leadParagraph && (
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.0625rem', sm: '1.1875rem' },
                lineHeight: 1.8,
                color: 'text.primary',
                fontWeight: 500,
                mb: 4,
                p: { xs: 2.5, sm: 3 },
                borderRadius: 3,
                bgcolor: 'rgba(14, 165, 233, 0.04)',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
              }}
            >
              {article.leadParagraph}
            </Typography>
          )}

          {/* Render Sections */}
          {article.sections?.map((sec, idx) => (
            <Box key={idx} sx={{ mb: 4.5 }}>
              {sec.heading && (
                <Typography
                  variant="h5"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    lineHeight: 1.35,
                    letterSpacing: '-0.015em',
                    mt: 3,
                    mb: 2,
                  }}
                >
                  {sec.heading}
                </Typography>
              )}

              {sec.paragraphs.map((para, pIdx) => (
                <Typography
                  key={pIdx}
                  variant="body1"
                  sx={{
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    color: 'text.secondary',
                    mb: 2,
                  }}
                >
                  {para}
                </Typography>
              ))}

              {/* Callout Box if present */}
              {sec.callout && (
                <Paper
                  elevation={0}
                  sx={{
                    my: 3,
                    p: 3,
                    borderRadius: 3,
                    bgcolor:
                      sec.callout.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.08)'
                        : sec.callout.type === 'quote'
                        ? 'rgba(15, 23, 42, 0.03)'
                        : 'rgba(14, 165, 233, 0.08)',
                    border: '1px solid',
                    borderColor:
                      sec.callout.type === 'warning'
                        ? 'rgba(245, 158, 11, 0.3)'
                        : sec.callout.type === 'quote'
                        ? 'divider'
                        : 'rgba(14, 165, 233, 0.25)',
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ mt: 0.5, flexShrink: 0 }}>
                    {sec.callout.type === 'warning' ? (
                      <AlertTriangle size={22} color="#f59e0b" />
                    ) : sec.callout.type === 'quote' ? (
                      <Quote size={22} color="#0284c7" />
                    ) : (
                      <Lightbulb size={22} color="#0284c7" />
                    )}
                  </Box>
                  <Box>
                    {sec.callout.title && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: sec.callout.type === 'warning' ? 'warning.dark' : 'primary.dark',
                          mb: 0.5,
                        }}
                      >
                        {sec.callout.title}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.7,
                        color: 'text.primary',
                        fontStyle: sec.callout.type === 'quote' ? 'italic' : 'normal',
                        fontWeight: sec.callout.type === 'quote' ? 500 : 400,
                      }}
                    >
                      {sec.callout.text}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Bullet Points if present */}
              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <Box sx={{ my: 2.5, pl: 1 }}>
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <Box key={bIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      <CheckCircle2 size={18} color="#10b981" style={{ marginTop: 3, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                        {bp}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}

          {/* Key Takeaways Box */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                my: 5,
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                bgcolor: '#ffffff',
                border: '2px solid',
                borderColor: 'rgba(14, 165, 233, 0.25)',
                boxShadow: '0 8px 24px -4px rgba(14, 165, 233, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'rgba(14, 165, 233, 0.12)',
                    color: 'primary.dark',
                    display: 'flex',
                  }}
                >
                  <Sparkles size={20} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Key Educational Takeaways
                </Typography>
              </Box>

              <Divider sx={{ mb: 2.5, borderColor: 'divider' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {article.keyTakeaways.map((item, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: 'rgba(16, 185, 129, 0.15)',
                        color: 'success.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      {idx + 1}
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontWeight: 500 }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 4 }}>
              {article.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                />
              ))}
            </Box>
          )}

          {/* Like / Helpful Section & Author Bio */}
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              my: 5,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {article.author?.avatar && (
                <Avatar
                  src={article.author.avatar}
                  alt={article.author.name}
                  sx={{ width: 52, height: 52, border: '2px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
              )}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Written & Reviewed by {article.author?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  {article.author?.bio || article.author?.role}
                </Typography>
              </Box>
            </Box>

            <Button
              variant={liked ? 'contained' : 'outlined'}
              color="primary"
              onClick={handleLikeToggle}
              startIcon={<ThumbsUp size={16} fill={liked ? 'currentColor' : 'none'} />}
              sx={{
                borderRadius: 9999,
                px: 2.5,
                py: 0.75,
                flexShrink: 0,
                alignSelf: { xs: 'stretch', sm: 'auto' },
              }}
            >
              Helpful ({likeCount})
            </Button>
          </Paper>
        </Box>

        {/* ============================================================ */}
        {/* Related Articles Section */}
        {/* ============================================================ */}
        {relatedArticles.length > 0 && (
          <Box sx={{ mt: 8, pt: 6, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Related Health Articles
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  Continue learning with more medical insights and wellness guides.
                </Typography>
              </Box>
              <Link href="/user/education" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  sx={{ color: 'primary.dark', fontWeight: 600, fontSize: '0.875rem' }}
                >
                  View All
                </Button>
              </Link>
            </Box>

            <Grid container spacing={3}>
              {relatedArticles.map((relArt) => (
                <Grid key={relArt.id} size={{ xs: 12, md: 4 }}>
                  <ArticleCard article={relArt} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%', borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
