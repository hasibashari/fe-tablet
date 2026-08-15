'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Cross, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '../utils/cn'
import { useAuth } from '@/src/features/auth'
import { Avatar, Chip } from '@mui/material'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const dashboardHref = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
  const roleLabel = user?.role === 'admin' ? 'ADMIN' : 'PASIEN'

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3 border-b border-hairline' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-white p-1.5 rounded-lg group-hover:bg-primary-active transition-colors shadow-sm">
            <Cross size={22} />
          </div>
          <span className="text-xl font-bold text-ink tracking-tight">Medi<span className="text-primary">Core</span></span>
        </Link>

        {/* Desktop Nav (>= lg) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <Link href="/#science" className="text-sm font-medium text-body hover:text-primary transition-colors">The Science</Link>
          <Link href="/#ingredients" className="text-sm font-medium text-body hover:text-primary transition-colors">Ingredients</Link>
          <Link href="/#trials" className="text-sm font-medium text-body hover:text-primary transition-colors">Clinical Trials</Link>
          <Link href="/#about" className="text-sm font-medium text-body hover:text-primary transition-colors">About Us</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full py-1.5 pl-2 pr-3">
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{ width: 28, height: 28, border: '1.5px solid #0ea5e9' }}
              />
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 leading-none truncate max-w-27.5">
                    {user.name.split(',')[0]}
                  </span>
                  <Chip
                    label={roleLabel}
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      bgcolor: user.role === 'admin' ? '#0ea5e9' : '#10b981',
                      color: 'white',
                      px: '2px',
                    }}
                  />
                </div>
              </div>

              <Link
                href={dashboardHref}
                className="bg-primary hover:bg-primary-active text-white px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={logout}
                title="Keluar"
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-ink hover:text-primary transition-colors px-3 py-2"
              >
                Patient Portal
              </Link>
              <Link
                href="/auth/login"
                className="bg-primary hover:bg-primary-active text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm"
              >
                Masuk / Demo
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle (< lg) */}
        <button
          className="lg:hidden text-ink p-2 cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-hairline shadow-lg py-4 px-6 flex flex-col gap-4 lg:hidden">
          <Link href="/#science" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-body py-2 border-b border-hairline-soft">The Science</Link>
          <Link href="/#ingredients" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-body py-2 border-b border-hairline-soft">Ingredients</Link>
          <Link href="/#trials" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-body py-2 border-b border-hairline-soft">Clinical Trials</Link>
          <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium text-body py-2 border-b border-hairline-soft">About Us</Link>

          <div className="pt-2 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <div className="flex flex-col gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar src={user.avatar} alt={user.name} sx={{ width: 32, height: 32 }} />
                    <div>
                      <div className="text-sm font-bold text-slate-800">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <Chip
                    label={roleLabel}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: user.role === 'admin' ? '#0ea5e9' : '#10b981',
                      color: 'white',
                    }}
                  />
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-primary text-white text-center py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-1"
                >
                  <LayoutDashboard size={16} />
                  <span>Buka Dashboard ({roleLabel})</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    logout()
                  }}
                  className="text-red-500 font-semibold text-sm py-2 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center font-semibold text-ink py-2 border border-slate-200 rounded-full"
                >
                  Patient Portal
                </Link>
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="bg-primary text-white text-center py-3 rounded-full font-semibold"
                >
                  Masuk / Akses Demo
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
