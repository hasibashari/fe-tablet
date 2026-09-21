'use client'

import React, { forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
  isPassword?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, isPassword = false, type = 'text', className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="text-xs sm:text-sm font-semibold text-[#1e293b] flex items-center justify-between">
            <span>{label}</span>
          </label>
        )}

        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-[#94a3b8] flex items-center">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={twMerge(
              clsx(
                'w-full bg-white text-[#1e293b] placeholder-[#94a3b8] text-sm rounded-xl border transition-all duration-200 py-3 px-3.5 outline-none',
                icon ? 'pl-10' : 'pl-3.5',
                isPassword ? 'pr-11' : 'pr-3.5',
                error
                  ? 'border-[#f43f5e] focus:border-[#f43f5e] focus:ring-3 focus:ring-rose-500/15'
                  : 'border-[#fce7f3] focus:border-[#e11d48] focus:ring-3 focus:ring-rose-500/15',
                className
              )
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-[#94a3b8] hover:text-[#e11d48] p-1 rounded-md transition-colors cursor-pointer"
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error ? (
          <p className="text-xs text-[#f43f5e] flex items-center gap-1 font-medium mt-0.5">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-[#64748b] mt-0.5">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
