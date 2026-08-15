'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Article } from '../types'
import { getArticles } from '../api/getArticles'
import ArticleCard from '../components/ArticleCard'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import { BookOpen } from 'lucide-react'
import Pagination from '@/src/shared/components/Pagination'

export default function EducationView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(6)

  useEffect(() => {
    const fetchArticles = async () => {
      const data = await getArticles()
      setArticles(data)
      setLoading(false)
    }
    fetchArticles()
  }, [])

  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * pageSize
    return articles.slice(start, start + pageSize)
  }, [articles, page, pageSize])

  const totalPages = Math.max(1, Math.ceil(articles.length / pageSize))

  return (
    <Box sx={{ pb: 5 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(2, 132, 199, 0.1)',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOpen size={32} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '1.875rem', md: '2.125rem' },
            }}
          >
            Health Education
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Read the latest articles to improve your well-being.
          </Typography>
        </Box>
      </Box>

      {/* 3-Column Grid */}
      {loading ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      ) : (
        <>
          <Grid container spacing={3}>
            {paginatedArticles.map((article) => (
              <Grid key={article.id} size={{ xs: 12, md: 4 }}>
                <ArticleCard article={article} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {articles.length > 0 && (
            <Box
              sx={{
                mt: 4,
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={articles.length}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setPage(1)
                }}
                pageSizeOptions={[3, 6, 9, 12]}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
