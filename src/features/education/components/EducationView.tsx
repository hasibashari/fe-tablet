'use client'

import React, { useEffect, useState } from 'react'
import { Article } from '../types'
import { getArticles } from '../api/getArticles'
import ArticleCard from './ArticleCard'
import { Box, Typography, Grid, Skeleton } from '@mui/material'
import { BookOpen } from 'lucide-react'

export default function EducationView() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      const data = await getArticles()
      setArticles(data)
      setLoading(false)
    }
    fetchArticles()
  }, [])

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
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
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
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 5 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 5 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={380} sx={{ borderRadius: 5 }} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {articles.map((article) => (
            <Grid key={article.id} size={{ xs: 12, md: 4 }}>
              <ArticleCard article={article} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

