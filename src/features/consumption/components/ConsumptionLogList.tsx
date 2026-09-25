'use client';

import React from 'react';
import { CalendarCheck, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';
import { ConsumptionLog } from '../types';
import { formatShortDate } from '../utils/dateHelpers';

export interface ConsumptionLogListProps {
  logs: ConsumptionLog[];
  filterLabel: string;
}

export function ConsumptionLogList({ logs, filterLabel }: ConsumptionLogListProps) {
  return (
    <Card padding='lg'>
      <div className='flex items-center justify-between mb-4 pb-2.5 border-b border-[#fce7f3]'>
        <h4 className='text-sm sm:text-base font-bold text-[#1e293b] flex items-center gap-2'>
          <CalendarCheck size={18} className='text-[#e11d48]' />
          <span>Riwayat Aktivitas ({logs.length})</span>
        </h4>
        <span className='text-xs text-[#64748b]'>{filterLabel}</span>
      </div>

      <div className='flex flex-col divide-y divide-[#fce7f3]'>
        {logs.length > 0 ? (
          logs.map(log => {
            const isCompleted = log.status === 'ON_TIME' || log.status === 'LATE';
            return (
              <div
                key={log.id}
                className='py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3'
              >
                <div>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-xs sm:text-sm font-bold text-[#1e293b]'>{log.title}</span>
                    <span className='text-[11px] text-[#e11d48] font-bold bg-rose-50 px-2 py-0.5 rounded-full'>
                      {formatShortDate(log.scheduledDate)}
                    </span>
                  </div>
                  <p className='text-xs text-[#64748b] mt-0.5'>
                    Jadwal: {log.scheduledTime} WIB {log.takenAt ? `• Diminum ${log.takenAt}` : ''}
                  </p>
                  {log.notes && (
                    <p className='text-[11px] text-[#94a3b8] italic mt-0.5'>{log.notes}</p>
                  )}
                </div>

                <div className='shrink-0'>
                  {isCompleted ? (
                    <Badge variant='recorded' size='sm'>
                      ✓ Selesai
                    </Badge>
                  ) : (
                    <Badge variant='missed' size='sm'>
                      ✕ Terlewat
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className='py-10 text-center text-xs text-[#94a3b8] flex flex-col items-center gap-2'>
            <CalendarIcon size={26} className='text-rose-200' />
            <span>Tidak ada riwayat konsumsi untuk filter yang dipilih.</span>
          </div>
        )}
      </div>
    </Card>
  );
}
