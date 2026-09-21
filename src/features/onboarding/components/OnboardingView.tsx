'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/Button';
import { ONBOARDING_SLIDES } from '../constants/slides';
import { useAuth } from '@/src/features/auth';

export function OnboardingView() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Touch Swipe Gesture State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalSlides = ONBOARDING_SLIDES.length;
  const isFirst = currentSlide === 0;
  const isLast = currentSlide === totalSlides - 1;
  const slide = ONBOARDING_SLIDES[currentSlide];
  const Icon = slide.icon;

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    completeOnboarding();
    router.push('/auth/login');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe && !isLast) {
      handleNext();
    } else if (isRightSwipe && !isFirst) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  return (
    <div className='h-[100dvh] max-h-[100dvh] bg-gradient-to-b from-[#fff5f7] via-[#ffe4e6]/40 to-[#fff5f7] flex items-center justify-center p-0 sm:p-4 md:p-6 select-none overflow-hidden box-border'>
      {/* Decorative desktop ambient bubbles */}
      <div className='hidden md:block absolute top-12 left-12 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl pointer-events-none' />
      <div className='hidden md:block absolute bottom-12 right-12 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl pointer-events-none' />

      {/* Main Strict Viewport-Fit Container: 100dvh on mobile, Elevated App Shell Card on tablet/desktop */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className='w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:min-h-[560px] sm:max-h-[720px] max-w-full sm:max-w-md md:max-w-lg bg-white/95 sm:bg-white backdrop-blur-md sm:rounded-3xl sm:border sm:border-rose-100/80 sm:shadow-2xl sm:shadow-rose-500/10 flex flex-col justify-between p-4 sm:p-6 transition-all duration-300 relative z-10 box-border overflow-hidden'
      >
        {/* Top Header: Navigation Back Button, Step Pill, and Skip Button (Shrink-0) */}
        <div className='shrink-0 w-full flex items-center justify-between pt-safe pb-1'>
          {/* Back Button or invisible spacer */}
          <div className='w-9 flex items-center justify-start'>
            {!isFirst ? (
              <button
                type='button'
                onClick={handlePrev}
                aria-label='Kembali ke slide sebelumnya'
                className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-[#e11d48] flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs'
              >
                <ArrowLeft size={15} />
              </button>
            ) : (
              <div className='w-7 h-7 sm:w-8 sm:h-8' />
            )}
          </div>

          {/* Skip Button */}
          <div className='w-9 flex items-center justify-end'>
            {!isLast ? (
              <button
                type='button'
                onClick={handleFinish}
                className='text-[11px] sm:text-xs font-bold text-[#64748b] hover:text-[#e11d48] px-1.5 py-1 transition-colors cursor-pointer'
              >
                Lewati
              </button>
            ) : (
              <div className='w-7 h-7 sm:w-8 sm:h-8' />
            )}
          </div>
        </div>

        {/* Center Slide Presentation Content (Flex-1 Min-h-0 Justify-Center) */}
        <div
          key={slide.id}
          className='flex-1 min-h-0 flex flex-col items-center justify-center text-center my-auto py-1 sm:py-3 animate-fade-in w-full max-w-sm mx-auto overflow-hidden'
        >
          {/* Animated Thematic Icon Box */}
          <div className='relative mb-3.5 sm:mb-5 shrink-0'>
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-3xl bg-gradient-to-tr ${slide.gradientClass} text-white flex items-center justify-center shadow-lg ${slide.shadowClass} transform transition-all duration-300 hover:scale-105`}
            >
              <Icon size={38} className='sm:w-11 sm:h-11 drop-shadow-sm' />
            </div>

            {/* Badge Indicator attached below icon */}
            <span className='absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-[10px] sm:text-[10.5px] font-extrabold text-[#1e293b] px-2.5 py-0.5 rounded-full border border-rose-200 shadow-2xs whitespace-nowrap'>
              {slide.badge}
            </span>
          </div>

          {/* Title & Subtitle */}
          <h2 className='text-xl sm:text-2xl md:text-3xl font-black text-[#1e293b] tracking-tight mb-0.5 sm:mb-1 leading-tight'>
            {slide.title}
          </h2>

          <h3
            className={`text-[11.5px] sm:text-xs md:text-sm font-bold ${slide.textColorClass} mb-2 tracking-wide`}
          >
            {slide.subtitle}
          </h3>

          {/* Description */}
          <p className='text-[11.5px] sm:text-xs md:text-[13px] text-[#475569] leading-relaxed max-w-xs px-1 font-normal mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none'>
            {slide.description}
          </p>

          {/* Feature Highlight Chips */}
          <div className='flex flex-wrap items-center justify-center gap-1.5 max-w-xs shrink-0'>
            {slide.highlights.map((h, i) => {
              const HighlightIcon = h.icon;
              return (
                <div
                  key={i}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-semibold border ${slide.bgSoftClass} shadow-2xs`}
                >
                  <HighlightIcon size={12} />
                  <span>{h.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Area: Progress Dots & Action CTAs (Shrink-0) */}
        <div className='shrink-0 w-full flex flex-col gap-4 sm:gap-5 pb-safe pb-4 sm:pb-2 pt-1'>
          {/* Pagination Interactive Dots & Indicator */}
          <div className='flex items-center justify-center gap-2'>
            {ONBOARDING_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type='button'
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-8 bg-[#e11d48] shadow-xs'
                    : 'w-2 bg-[#fce7f3] hover:bg-rose-200'
                }`}
                aria-label={`Ke slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Primary CTA Action Button */}
          <Button
            variant='primary'
            size='lg'
            shape='pill'
            fullWidth
            icon={isLast ? <Check size={18} /> : <ArrowRight size={18} />}
            onClick={handleNext}
            className='shadow-lg shadow-rose-500/25 py-3 sm:py-3.5 text-sm sm:text-base font-bold transition-all hover:shadow-xl hover:shadow-rose-500/35 cursor-pointer'
          >
            {isLast ? 'Mulai Sekarang' : 'Lanjutkan'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingView;
