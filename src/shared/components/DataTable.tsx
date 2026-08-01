import React, { ReactNode } from 'react'
import {
  Card,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from '@mui/material'

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
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = 'Tidak ada data.',
}: DataTableProps<T>) {
  return (
    <Card sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'} width={col.width}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.id} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {col.renderCell(row, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>
    </Card>
  )
}
