'use client'

import React from 'react'
import {
  Box,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  showItemCount?: boolean
  showFirstLastButtons?: boolean
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
  showItemCount = true,
  showFirstLastButtons = false,
}: PaginationProps) {
  // If no pages or totalPages <= 0, still show info if items exist or return null
  if (totalPages <= 0 && (!totalItems || totalItems === 0)) {
    return null
  }

  const effectiveTotalPages = Math.max(1, totalPages)
  const safeCurrentPage = Math.min(Math.max(1, currentPage), effectiveTotalPages)

  // Calculate item range for "Menampilkan X-Y dari Z data"
  const startItem = totalItems && totalItems > 0 && pageSize
    ? (safeCurrentPage - 1) * pageSize + 1
    : 0
  const endItem = totalItems && totalItems > 0 && pageSize
    ? Math.min(safeCurrentPage * pageSize, totalItems)
    : 0

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const delta = 1 // pages to show around current page

    if (effectiveTotalPages <= 7) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i)
      }
      return pages
    }

    const left = safeCurrentPage - delta
    const right = safeCurrentPage + delta + 1
    let prev = 0

    for (let i = 1; i <= effectiveTotalPages; i++) {
      if (i === 1 || i === effectiveTotalPages || (i >= left && i < right)) {
        if (prev) {
          if (i - prev === 2) {
            pages.push(prev + 1)
          } else if (i - prev !== 1) {
            pages.push('...')
          }
        }
        pages.push(i)
        prev = i
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 1.5,
        px: 2,
        width: '100%',
      }}
    >
      {/* Left: Item Counter & Page Size Selector */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {showItemCount && totalItems !== undefined && (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {totalItems === 0 ? (
              '0 data'
            ) : (
              <>
                Menampilkan <strong>{startItem}–{endItem}</strong> dari <strong>{totalItems}</strong> data
              </>
            )}
          </Typography>
        )}

        {onPageSizeChange && pageSize && pageSizeOptions.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Tampilkan:
            </Typography>
            <FormControl size="small" variant="outlined">
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                sx={{
                  height: 32,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  '& .MuiSelect-select': { py: 0.5, px: 1.5 },
                }}
              >
                {pageSizeOptions.map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.82rem' }}>
                    {opt} / hal
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Right: Page Navigation Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {showFirstLastButtons && (
          <IconButton
            size="small"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange(1)}
            aria-label="First page"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ChevronsLeft size={16} />
          </IconButton>
        )}

        <IconButton
          size="small"
          disabled={safeCurrentPage <= 1}
          onClick={() => onPageChange(safeCurrentPage - 1)}
          aria-label="Previous page"
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover:not(:disabled)': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          }}
        >
          <ChevronLeft size={18} />
        </IconButton>

        {/* Page Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <Typography
                  key={`ellipsis-${idx}`}
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 0.5, userSelect: 'none' }}
                >
                  …
                </Typography>
              )
            }

            const pageNum = Number(p)
            const isActive = pageNum === safeCurrentPage

            return (
              <Button
                key={pageNum}
                size="small"
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => onPageChange(pageNum)}
                sx={{
                  minWidth: 36,
                  width: 36,
                  height: 36,
                  p: 0,
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 600,
                  borderRadius: 1.5,
                  boxShadow: isActive ? '0 2px 8px rgba(14, 165, 233, 0.25)' : 'none',
                  borderColor: isActive ? 'primary.main' : 'divider',
                  bgcolor: isActive ? 'primary.main' : 'background.paper',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: isActive ? 'primary.dark' : 'rgba(14, 165, 233, 0.08)',
                  },
                }}
              >
                {pageNum}
              </Button>
            )
          })}
        </Box>

        <IconButton
          size="small"
          disabled={safeCurrentPage >= effectiveTotalPages}
          onClick={() => onPageChange(safeCurrentPage + 1)}
          aria-label="Next page"
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover:not(:disabled)': {
              borderColor: 'primary.main',
              color: 'primary.main',
            },
          }}
        >
          <ChevronRight size={18} />
        </IconButton>

        {showFirstLastButtons && (
          <IconButton
            size="small"
            disabled={safeCurrentPage >= effectiveTotalPages}
            onClick={() => onPageChange(effectiveTotalPages)}
            aria-label="Last page"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <ChevronsRight size={16} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default Pagination
