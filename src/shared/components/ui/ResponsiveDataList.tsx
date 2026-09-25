'use client';

import React, { ReactNode } from 'react';
import { Column } from '../DataTable';

export interface ResponsiveDataListProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  renderMobileCard: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  emptySubtitle?: string;
  isLoading?: boolean;
}

export function ResponsiveDataList<T extends { id: string | number }>({
  data,
  columns,
  renderMobileCard,
  emptyMessage = 'Tidak ada data ditemukan.',
  emptySubtitle = 'Coba sesuaikan kata kunci pencarian atau filter Anda.',
  isLoading = false,
}: ResponsiveDataListProps<T>) {
  if (isLoading) {
    return (
      <div className='p-12 text-center bg-white rounded-3xl border border-rose-100/80 shadow-xs flex flex-col items-center justify-center gap-3'>
        <div className='w-8 h-8 rounded-full border-3 border-rose-200 border-t-rose-600 animate-spin' />
        <p className='text-xs font-bold text-slate-500'>Memuat data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className='p-8 sm:p-12 text-center bg-white rounded-3xl border border-rose-100/80 shadow-xs'>
        <div className='w-12 h-12 rounded-2xl bg-rose-50 text-rose-400 mx-auto flex items-center justify-center mb-3'>
          🌸
        </div>
        <p className='text-sm font-bold text-slate-700'>{emptyMessage}</p>
        {emptySubtitle && <p className='text-xs text-slate-400 mt-1'>{emptySubtitle}</p>}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card List View (< md: 768px) */}
      <div className='flex flex-col gap-3 md:hidden'>
        {data.map((item, index) => (
          <div
            key={item.id}
            className='bg-white rounded-2xl p-4 border border-rose-100/80 shadow-2xs hover:border-rose-300 transition-all'
          >
            {renderMobileCard(item, index)}
          </div>
        ))}
      </div>

      {/* Desktop Table View (>= md: 768px) */}
      <div className='hidden md:block bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-gradient-to-r from-rose-50/70 to-pink-50/40 border-b border-rose-100'>
                {columns.map(col => (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={`py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-rose-100/50'>
              {data.map((row, index) => (
                <tr
                  key={row.id}
                  className='hover:bg-rose-50/30 transition-colors duration-150 group'
                >
                  {columns.map(col => (
                    <td
                      key={col.id}
                      className={`py-3.5 px-4 text-xs font-medium text-slate-700 align-middle ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      }`}
                    >
                      {col.renderCell(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ResponsiveDataList;
