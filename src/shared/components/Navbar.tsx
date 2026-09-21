'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Heart, LogOut, LayoutDashboard, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAuth } from '@/src/features/auth';
import { Avatar, Chip } from '@mui/material';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardHref = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  const roleLabel = user?.role === 'admin' ? 'ADMIN' : 'PASIEN';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-3 border-b border-rose-100'
          : 'bg-transparent py-5',
      )}
    >
      <div className='container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between'>
        <Link href='/' className='flex items-center gap-2.5 group'>
          <div className='bg-gradient-to-tr from-[#e11d48] to-[#fb7185] text-white p-2 rounded-xl group-hover:scale-105 transition-transform shadow-md shadow-rose-500/20'>
            <Heart size={20} className='fill-white' />
          </div>
          <span className='text-xl font-extrabold text-[#1e293b] tracking-tight flex items-center gap-1'>
            <span>Fe-Tablet</span>
            <span className='text-base'>🌸</span>
          </span>
        </Link>

        {/* Desktop Nav (>= lg) */}
        <nav className='hidden lg:flex items-center gap-6 xl:gap-8'>
          <Link
            href='/#benefits'
            className='text-sm font-medium text-[#475569] hover:text-[#e11d48] transition-colors'
          >
            Manfaat TTD
          </Link>
          <Link
            href='/#features'
            className='text-sm font-medium text-[#475569] hover:text-[#e11d48] transition-colors'
          >
            Fitur Aplikasi
          </Link>
          <Link
            href='/#ingredients'
            className='text-sm font-medium text-[#475569] hover:text-[#e11d48] transition-colors'
          >
            Kandungan Nutrisi
          </Link>
          <Link
            href='/#faq'
            className='text-sm font-medium text-[#475569] hover:text-[#e11d48] transition-colors'
          >
            Tanya Jawab
          </Link>
        </nav>

        <div className='hidden lg:flex items-center gap-3'>
          {isAuthenticated && user ? (
            <div className='flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-full py-1.5 pl-2 pr-3'>
              <Avatar
                src={user.avatarUrl}
                alt={user.name}
                sx={{ width: 28, height: 28, border: '1.5px solid #e11d48' }}
              />
              <div className='flex flex-col text-left'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-xs font-bold text-slate-800 leading-none truncate max-w-28'>
                    {user.name.split(',')[0]}
                  </span>
                  <Chip
                    label={roleLabel}
                    size='small'
                    sx={{
                      height: 16,
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      bgcolor: user.role === 'admin' ? '#e11d48' : '#10b981',
                      color: 'white',
                      px: '2px',
                    }}
                  />
                </div>
              </div>

              <Link
                href={dashboardHref}
                className='bg-[#e11d48] hover:bg-[#be123c] text-white px-3 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm'
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={logout}
                title='Keluar'
                className='text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 cursor-pointer'
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href='/splash'
              className='bg-gradient-to-r from-[#e11d48] to-[#fb7185] hover:from-[#be123c] hover:to-[#e11d48] text-white px-5 py-2.25 rounded-full text-sm font-bold transition-all shadow-md shadow-rose-500/25 flex items-center gap-1.5 hover:scale-105 active:scale-95'
            >
              <Sparkles size={16} />
              <span>Buka Aplikasi</span>
            </Link>
          )}
        </div>

        {/* Mobile Toggle (< lg) */}
        <button
          className='lg:hidden text-[#1e293b] p-2 cursor-pointer'
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label='Toggle Menu'
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='absolute top-full left-0 right-0 bg-white border-b border-rose-100 shadow-xl py-4 px-6 flex flex-col gap-4 lg:hidden animate-fade-in'>
          <Link
            href='/#benefits'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Manfaat TTD
          </Link>
          <Link
            href='/#features'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Fitur Aplikasi
          </Link>
          <Link
            href='/#ingredients'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Kandungan Nutrisi
          </Link>
          <Link
            href='/#faq'
            onClick={() => setIsMobileMenuOpen(false)}
            className='text-base font-medium text-slate-700 py-2 border-b border-slate-100'
          >
            Tanya Jawab
          </Link>

          <div className='pt-2 flex flex-col gap-3'>
            {isAuthenticated && user ? (
              <div className='flex flex-col gap-2 bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Avatar src={user.avatarUrl} alt={user.name} sx={{ width: 32, height: 32 }} />
                    <div>
                      <div className='text-sm font-bold text-slate-800'>{user.name}</div>
                      <div className='text-xs text-slate-500'>{user.email}</div>
                    </div>
                  </div>
                  <Chip
                    label={roleLabel}
                    size='small'
                    sx={{
                      height: 18,
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      bgcolor: user.role === 'admin' ? '#e11d48' : '#10b981',
                      color: 'white',
                    }}
                  />
                </div>
                <Link
                  href={dashboardHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='bg-[#e11d48] text-white text-center py-2.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 mt-1 shadow-sm'
                >
                  <LayoutDashboard size={16} />
                  <span>Buka Dashboard ({roleLabel})</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className='text-red-500 font-semibold text-sm py-2 hover:bg-red-50 rounded-full flex items-center justify-center gap-2 cursor-pointer'
                >
                  <LogOut size={16} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            ) : (
              <Link
                href='/splash'
                onClick={() => setIsMobileMenuOpen(false)}
                className='bg-gradient-to-r from-[#e11d48] to-[#fb7185] text-white text-center py-3 rounded-full font-bold shadow-md shadow-rose-500/20 flex items-center justify-center gap-2'
              >
                <Sparkles size={16} />
                <span>Buka Aplikasi Sekarang</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
