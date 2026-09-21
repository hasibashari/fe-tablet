'use client'

import React, { ReactNode, useState } from 'react'
import {
  Card,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Divider,
} from '@mui/material'
import Pagination from './Pagination'

export interface Column<T> {
  id: string
  label: string
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  width?: string | number
  renderCell: (row: T, index: number) => ReactNode
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  emptyMessage?: string
  pagination?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
  showItemCount?: boolean
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  renderMobileCard?: (row: T, index: number) => ReactNode
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'Tidak ada data.',
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20],
  showItemCount = true,
  page: controlledPage,
  pageSize: controlledPageSize,
  onPageChange: controlledOnPageChange,
  onPageSizeChange: controlledOnPageSizeChange,
  renderMobileCard,
}: DataTableProps<T>) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize)

  const activePageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize
  const totalPages = Math.max(1, Math.ceil(data.length / activePageSize))
  
  // Safe page clamped between 1 and totalPages during render without useEffect cascading renders
  const rawPage = controlledPage !== undefined ? controlledPage : internalPage
  const activePage = Math.min(Math.max(1, rawPage), totalPages)

  const handlePageChange = (newPage: number) => {
    if (controlledOnPageChange) {
      controlledOnPageChange(newPage)
    } else {
      setInternalPage(newPage)
    }
  }

  const handlePageSizeChange = (newSize: number) => {
    if (controlledOnPageSizeChange) {
      controlledOnPageSizeChange(newSize)
    } else {
      setInternalPageSize(newSize)
      setInternalPage(1)
    }
  }

  const paginatedData = pagination
    ? data.slice((activePage - 1) * activePageSize, activePage * activePageSize)
    : data

  return (
    <Card sx={{ p: 0, overflow: 'hidden', border: '1px solid', borderColor: 'divider', borderRadius: '16px' }}>
      {/* 1. Mobile-First Card View (< sm / mobile screens when renderMobileCard provided) */}
      {renderMobileCard && (
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5, p: 1.5, bgcolor: '#fff5f7' }}>
          {paginatedData.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#ffffff', borderRadius: 2, border: '1px dashed #fce7f3' }}>
              <Typography color="text.secondary" sx={{ fontSize: '0.88rem' }}>
                {emptyMessage}
              </Typography>
            </Box>
          ) : (
            paginatedData.map((row, index) => {
              const globalIndex = pagination
                ? (activePage - 1) * activePageSize + index
                : index
              return (
                <Box key={row.id}>
                  {renderMobileCard(row, globalIndex)}
                </Box>
              )
            })
          )}
        </Box>
      )}

      {/* 2. Desktop/Tablet Table View (>= sm or when no renderMobileCard provided) */}
      <Box sx={{ display: renderMobileCard ? { xs: 'none', sm: 'block' } : 'block', overflowX: 'auto' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#fff5f7' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  width={col.width}
                  sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const globalIndex = pagination
                  ? (activePage - 1) * activePageSize + index
                  : index
                return (
                  <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    {columns.map((col) => (
                      <TableCell key={col.id} align={col.align || 'left'}>
                        {col.renderCell(row, globalIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Integrated Pagination Footer */}
      {pagination && data.length > 0 && (
        <>
          <Divider sx={{ borderColor: '#fce7f3' }} />
          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            totalItems={data.length}
            pageSize={activePageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
            showItemCount={showItemCount}
          />
        </>
      )}
    </Card>
  )
}

export default DataTable
