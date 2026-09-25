'use client';

import React from 'react';
import { Edit2 } from 'lucide-react';
import { Avatar } from '@/src/shared/components/ui/Avatar';

export interface ProfileContactItem {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  label?: string;
  value: React.ReactNode;
}

export interface ProfileMetricItem {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconBgColor?: string;
  iconColor?: string;
}

export interface ProfileLayoutProps {
  title: string;
  subtitle?: string;
  onEditClick?: () => void;
  editButtonText?: string;
  name: string;
  avatarUrl?: string | null;
  customAvatarNode?: React.ReactNode;
  badges?: React.ReactNode;
  secondaryText?: React.ReactNode;
  contactItems: ProfileContactItem[];
  metricsTitle?: string;
  metrics?: ProfileMetricItem[];
  loading?: boolean;
  children?: React.ReactNode;
}

export default function ProfileLayout({
  title,
  subtitle,
  onEditClick,
  editButtonText = 'Edit Profile',
  name,
  avatarUrl,
  customAvatarNode,
  badges,
  secondaryText,
  contactItems,
  metricsTitle,
  metrics,
  loading = false,
  children,
}: ProfileLayoutProps) {
  if (loading) {
    return (
      <div className='w-full pb-8 animate-pulse flex flex-col gap-5'>
        <div className='h-8 bg-rose-200/50 rounded-lg w-48' />
        <div className='h-4 bg-rose-200/30 rounded-lg w-72' />
        <div className='h-48 bg-white rounded-2xl border border-[#fce7f3]' />
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='h-24 bg-white rounded-2xl border border-[#fce7f3]' />
          <div className='h-24 bg-white rounded-2xl border border-[#fce7f3]' />
          <div className='h-24 bg-white rounded-2xl border border-[#fce7f3]' />
        </div>
      </div>
    );
  }

  return (
    <div className='w-full pb-8 flex flex-col gap-6'>
      {/* 1. Header Section */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
        <div>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-[#1e293b] tracking-tight'>
            {title}
          </h1>
          {subtitle && <p className='text-xs sm:text-sm text-[#64748b] mt-0.5'>{subtitle}</p>}
        </div>

        {onEditClick && (
          <button
            type='button'
            onClick={onEditClick}
            className='inline-flex items-center gap-2 px-4 py-2 bg-rose-100/80 hover:bg-rose-200/80 text-[#e11d48] rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer'
          >
            <Edit2 size={15} />
            <span>{editButtonText}</span>
          </button>
        )}
      </div>

      {/* 2. Main Profile Card */}
      <div className='p-6 bg-white rounded-2xl border border-[#fce7f3] shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6'>
        {customAvatarNode || (
          <Avatar
            src={avatarUrl}
            name={name}
            size='3xl'
            ringClassName='ring-4 ring-rose-200 shrink-0 shadow-md'
          />
        )}

        <div className='flex-1 text-center md:text-left min-w-0'>
          <div className='flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5'>
            <h2 className='text-lg sm:text-xl font-bold text-[#1e293b]'>{name}</h2>
            {badges}
          </div>

          {secondaryText && (
            <div className='text-xs sm:text-sm text-[#64748b] mb-4'>{secondaryText}</div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-2'>
            {contactItems.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div key={index} className='flex items-center gap-2.5 text-left'>
                  <div className='w-8 h-8 rounded-lg bg-rose-50 text-[#e11d48] flex items-center justify-center shrink-0'>
                    <IconComp size={16} />
                  </div>
                  <div className='min-w-0'>
                    {item.label && (
                      <span className='text-[10px] text-[#94a3b8] block leading-tight'>
                        {item.label}
                      </span>
                    )}
                    <span className='text-xs font-semibold text-[#1e293b] truncate block'>
                      {item.value}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Metrics / Highlights Section */}
      {metrics && metrics.length > 0 && (
        <div>
          {metricsTitle && (
            <h3 className='text-base font-bold text-[#1e293b] mb-3'>{metricsTitle}</h3>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            {metrics.map((metric, index) => {
              const IconComp = metric.icon;
              return (
                <div
                  key={index}
                  className='p-4 bg-white rounded-2xl border border-[#fce7f3] shadow-xs flex items-center gap-3.5'
                >
                  <div
                    style={{
                      backgroundColor: metric.iconBgColor || '#ffe4e6',
                      color: metric.iconColor || '#e11d48',
                    }}
                    className='w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs'
                  >
                    <IconComp size={22} />
                  </div>
                  <div>
                    <span className='text-xs text-[#64748b] font-medium block'>{metric.label}</span>
                    <span className='text-lg sm:text-xl font-black text-[#1e293b] leading-tight block'>
                      {metric.value}
                    </span>
                    {metric.subtitle && (
                      <span className='text-[10px] text-[#94a3b8] block mt-0.5'>
                        {metric.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
