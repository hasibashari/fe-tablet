import React from 'react'
import { Article } from '../types'
import { Card, CardContent, Typography, Box, Chip, Divider } from '@mui/material'
import { Clock, Tag } from 'lucide-react'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'var(--color-hairline, #e2e8f0)',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
          '& .card-img': {
            transform: 'scale(1.06)',
          },
          '& .article-title': {
            color: 'primary.main',
          },
        },
      }}
    >
      {/* Top Image Banner */}
      <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', bgcolor: 'action.hover' }}>
        <Chip
          icon={<Tag size={12} style={{ color: '#0284c7' }} />}
          label={article.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 2,
            bgcolor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '0.75rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          }}
        />
        <Box
          className="card-img"
          component="img"
          src={article.imageUrl}
          alt={article.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </Box>

      {/* Card Content Body */}
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography
          className="article-title"
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.1rem',
            lineHeight: 1.35,
            color: 'text.primary',
            mb: 1,
            transition: 'color 0.2s ease',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.875rem',
            lineHeight: 1.6,
            mb: 2,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.summary}
        </Typography>

        <Divider sx={{ my: 1.5, borderColor: 'divider' }} />

        {/* Footer info: Read time & Date */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'text.secondary',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Clock size={14} style={{ color: '#0284c7' }} />
            <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600 }}>
              {article.readTime}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 500 }}>
            {article.publishedAt}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}


