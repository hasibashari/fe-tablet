'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface RegisterFormProps {
  onSwitchTab?: () => void;
  hideHeader?: boolean;
}

export function RegisterForm({ onSwitchTab, hideHeader = false }: RegisterFormProps) {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'Perempuan' | 'Laki-laki'>('Perempuan');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Silakan masukkan nama lengkap Anda.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Kata sandi harus minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        gender,
        phone: phone.trim() || undefined,
      });

      if (res.success) {
        setSuccessMessage(
          res.message || 'Pendaftaran berhasil! Akun Anda siap digunakan. Mengalihkan ke halaman Masuk...',
        );
        setTimeout(() => {
          if (onSwitchTab) {
            onSwitchTab();
          } else {
            router.push('/auth/login?registered=true');
          }
        }, 1600);
      } else {
        setErrorMessage(res.error || 'Gagal mendaftarkan akun. Silakan coba lagi.');
      }
    } catch {
      setErrorMessage('Terjadi kendala sistem saat pendaftaran. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='w-full'>
      {/* Optional Header Form if not in tabbed container */}
      {!hideHeader && (
        <div className='mb-6 text-left'>
          <h2 className='text-2xl font-extrabold text-[#1e293b] tracking-tight mb-1'>Daftar Akun FEMORY</h2>
          <p className='text-xs sm:text-sm text-[#64748b]'>
            Daftarkan akun untuk mulai memantau jadwal suplemen & kesehatanmu.
          </p>
        </div>
      )}

      {/* Error Feedback */}
      {errorMessage && (
        <div className='mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in'>
          <AlertCircle size={16} className='text-rose-600 shrink-0' />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success Feedback */}
      {successMessage && (
        <div className='mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex flex-col gap-2 animate-scale-up'>
          <div className='flex items-center gap-2 font-bold text-emerald-800 text-sm'>
            <CheckCircle2 size={18} className='text-emerald-600 shrink-0' />
            <span>Pendaftaran Berhasil! 🌸</span>
          </div>
          <p className='text-emerald-700 leading-relaxed'>
            {successMessage}
          </p>
          <div className='pt-1 flex items-center justify-end'>
            <button
              type='button'
              onClick={() => {
                if (onSwitchTab) onSwitchTab();
                else router.push('/auth/login?registered=true');
              }}
              className='text-xs font-bold text-emerald-800 hover:text-emerald-900 underline cursor-pointer inline-flex items-center gap-1'
            >
              Masuk Sekarang <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Registration Form */}
      {!successMessage && (
        <form onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
          {/* Full Name Field */}
          <div>
            <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
              Nama Lengkap
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                <User size={15} />
              </div>
              <input
                type='text'
                placeholder='Contoh: Anisa Putri Ramadhani'
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete='name'
                className='w-full bg-white text-sm text-[#1e293b] rounded-full border border-slate-200 pl-13 pr-4 py-2.5 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
              Alamat Email Aktif
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                <Mail size={15} />
              </div>
              <input
                type='email'
                placeholder='nama@sekolah.sch.id atau email@gmail.com'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete='email'
                className='w-full bg-white text-sm text-[#1e293b] rounded-full border border-slate-200 pl-13 pr-4 py-2.5 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
              Kata Sandi (Minimal 6 karakter)
            </label>
            <div className='relative flex items-center'>
              <div className='absolute left-3.5 w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete='new-password'
                className='w-full bg-white text-sm text-[#1e293b] rounded-full border border-slate-200 pl-13 pr-11 py-2.5 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 text-slate-400 hover:text-slate-600 cursor-pointer p-1'
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Gender & Phone (2-column on tablet/desktop) */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {/* Gender Selection */}
            <div>
              <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
                Jenis Kelamin
              </label>
              <div className='grid grid-cols-2 gap-2'>
                <button
                  type='button'
                  onClick={() => setGender('Perempuan')}
                  className={`py-2 px-3 text-xs font-bold rounded-full border transition-all cursor-pointer text-center ${
                    gender === 'Perempuan'
                      ? 'bg-rose-50 border-[#e11d48] text-[#e11d48] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🌸 Perempuan
                </button>
                <button
                  type='button'
                  onClick={() => setGender('Laki-laki')}
                  className={`py-2 px-3 text-xs font-bold rounded-full border transition-all cursor-pointer text-center ${
                    gender === 'Laki-laki'
                      ? 'bg-rose-50 border-[#e11d48] text-[#e11d48] shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Laki-laki
                </button>
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label className='text-xs font-bold text-[#1e293b] mb-1.5 block'>
                No. WhatsApp / HP <span className='font-normal text-slate-400'>(Opsional)</span>
              </label>
              <div className='relative flex items-center'>
                <div className='absolute left-3 w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-[#e11d48]'>
                  <Phone size={13} />
                </div>
                <input
                  type='tel'
                  placeholder='0812-xxxx-xxxx'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoComplete='tel'
                  className='w-full bg-white text-xs sm:text-sm text-[#1e293b] rounded-full border border-slate-200 pl-11 pr-3 py-2.5 outline-none focus:border-[#e11d48] transition-colors shadow-2xs'
                />
              </div>
            </div>
          </div>

          <div className='pt-1 text-[11px] text-slate-500 bg-rose-50/50 p-2.5 rounded-2xl border border-rose-100/60 flex items-start gap-1.5'>
            <Sparkles size={13} className='text-rose-500 shrink-0 mt-0.5' />
            <span>
              Data sekolah, tanggal lahir, dan jadwal pengingat TTD dapat Anda atur dengan mudah setelah berhasil masuk.
            </span>
          </div>

          {/* Balanced Action Row: Switch to Login & Pill Submit Button */}
          <div className='flex items-center justify-between flex-wrap gap-2 mt-2 pt-1'>
            {onSwitchTab ? (
              <button
                type='button'
                onClick={onSwitchTab}
                className='text-xs text-[#64748b] hover:text-[#e11d48] font-medium transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1'
              >
                Sudah punya akun? <span className='font-bold text-[#e11d48]'>Masuk</span>
              </button>
            ) : (
              <Link
                href='/auth?tab=login'
                className='text-xs text-[#64748b] hover:text-[#e11d48] font-medium transition-colors inline-flex items-center gap-1'
              >
                Sudah punya akun? <span className='font-bold text-[#e11d48]'>Masuk</span>
              </Link>
            )}

            <button
              type='submit'
              disabled={loading}
              className='px-6 py-2.5 bg-[#e11d48] hover:bg-[#be123c] text-white rounded-full text-sm font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50'
            >
              {loading ? (
                <span>Mendaftarkan...</span>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default RegisterForm;

