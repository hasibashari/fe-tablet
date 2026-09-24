'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BellRing, MessageSquare, Send, X, Smartphone, Sparkles } from 'lucide-react';
import { generateAiPatientNudgeAction } from '@/src/lib/gemini';

export interface SendReminderModalProps {
  open: boolean;
  onClose: () => void;
  patientId?: string;
  patientName: string;
  patientPhone?: string;
  scheduleId?: string;
  medicationName?: string;
  dosage?: string;
  timeSlot?: string;
  onSendSuccess: (channel: 'app' | 'whatsapp', messageSent: string) => void;
}

export default function SendReminderModal({
  open,
  onClose,
  patientName,
  patientPhone = '0812-3456-7890',
  medicationName = 'Tablet Tambah Darah (TTD)',
  dosage = '1 Tablet (Setelah makan)',
  timeSlot = '08:00 WIB',
  onSendSuccess,
}: SendReminderModalProps) {
  const [channel, setChannel] = useState<'app' | 'whatsapp'>('whatsapp');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper generator
  const getTemplateContent = (templateKey: string) => {
    switch (templateKey) {
      case 'standard':
        return `Halo ${patientName}, ini pengingat dari Pembina UKS / Fe-Tablet untuk minum ${medicationName} (${dosage}) pada jam ${timeSlot}. Jangan lupa diminum setelah makan dengan air putih/jeruk ya! 🌸`;
      case 'friendly':
        return `Halo ${patientName}, cegah anemia biar tetap fit dan konsentrasi belajar! Jangan lupa minum ${medicationName} (${dosage}) hari ini ya! Semangat selalu! 🌸`;
      case 'urgent':
        return `PENGINGAT PENTING: Halo ${patientName}, jadwal minum ${medicationName} kamu minggu ini belum tercatat. Yuk segera minum suplemen TTD kamu dan catat di aplikasi ya!`;
      default:
        return `Halo ${patientName}, jangan lupa minum ${medicationName} (${dosage}) sesuai jadwal suplementasi kamu ya!`;
    }
  };

  const [message, setMessage] = useState<string>(() => getTemplateContent('standard'));

  useEffect(() => {
    if (open) {
      setMessage(getTemplateContent(selectedTemplate));
    }
  }, [open, patientName, medicationName, dosage, timeSlot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleTemplateChange = (newTemplate: string) => {
    setSelectedTemplate(newTemplate);
    setMessage(getTemplateContent(newTemplate));
  };

  const handleGenerateAiMessage = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await generateAiPatientNudgeAction({
        patientName,
        medicationName,
        dosage,
        timeSlot,
        tone:
          selectedTemplate === 'urgent'
            ? 'urgent'
            : selectedTemplate === 'friendly'
              ? 'friendly'
              : 'motivational',
      });
      if (res.success && res.message) {
        setMessage(res.message);
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSend = () => {
    const finalMsg = message || getTemplateContent(selectedTemplate);
    if (channel === 'whatsapp') {
      const cleanPhone = patientPhone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
      const encodedMsg = encodeURIComponent(finalMsg);
      window.open(`https://wa.me/${formattedPhone}?text=${encodedMsg}`, '_blank');
    }

    onSendSuccess(channel, finalMsg);
    onClose();
  };

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Modal Dialog Content */}
      <div
        ref={modalRef}
        className='relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 flex flex-col max-h-[90vh] overflow-hidden'
        role='dialog'
        aria-modal='true'
      >
        {/* Header */}
        <div className='p-5 sm:p-6 border-b border-pink-100 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600'>
              <BellRing size={20} />
            </div>
            <div>
              <h3 className='font-extrabold text-base sm:text-lg text-slate-800 leading-tight'>
                Kirim Pengingat Obat
              </h3>
              <p className='text-xs text-slate-500 mt-0.5'>
                Pasien: {patientName} • {dosage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer'
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className='p-5 sm:p-6 space-y-5 overflow-y-auto flex-1'>
          {/* Channel Selector */}
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2'>
              Pilih Saluran Pengiriman:
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <button
                type='button'
                onClick={() => setChannel('whatsapp')}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer ${
                  channel === 'whatsapp'
                    ? 'border-emerald-500 bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    channel === 'whatsapp'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div className='font-bold text-xs sm:text-sm text-slate-800'>WhatsApp</div>
                  <div className='text-[11px] text-slate-500'>Direct Chat</div>
                </div>
              </button>

              <button
                type='button'
                onClick={() => setChannel('app')}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer ${
                  channel === 'app'
                    ? 'border-rose-500 bg-rose-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    channel === 'app' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Smartphone size={16} />
                </div>
                <div>
                  <div className='font-bold text-xs sm:text-sm text-slate-800'>In-App Push</div>
                  <div className='text-[11px] text-slate-500'>Notifikasi Pasien</div>
                </div>
              </button>
            </div>
          </div>

          {/* Template Selection & AI Generator Button */}
          <div className='flex flex-col sm:flex-row gap-3 items-stretch sm:items-center'>
            <div className='flex-1'>
              <label className='block text-xs font-semibold text-slate-600 mb-1'>
                Pilih Template Pesan
              </label>
              <select
                value={selectedTemplate}
                onChange={e => handleTemplateChange(e.target.value)}
                className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all'
              >
                <option value='standard'>📋 Standar Medis (Rekomendasi)</option>
                <option value='friendly'>😊 Ramah & Edukatif</option>
                <option value='urgent'>🚨 Peringatan Medis Penting</option>
              </select>
            </div>

            <div className='sm:self-end'>
              <button
                type='button'
                disabled={isGeneratingAi}
                onClick={handleGenerateAiMessage}
                className='inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50'
              >
                <Sparkles size={15} />
                <span>{isGeneratingAi ? 'Menulis...' : 'Tulis dengan AI ✨'}</span>
              </button>
            </div>
          </div>

          {/* Custom Message Editor */}
          <div>
            <div className='flex items-center justify-between mb-1.5'>
              <label className='text-xs font-bold text-slate-600'>Pratinjau & Edit Pesan:</label>
              <span className='text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md'>
                Dapat Diedit
              </span>
            </div>
            <textarea
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder='Tuliskan pesan pengingat khusus untuk pasien...'
              className='w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all resize-none leading-relaxed'
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-4 sm:p-5 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 bg-slate-50/50'>
          <button
            type='button'
            onClick={onClose}
            className='w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer'
          >
            Batal
          </button>
          <button
            type='button'
            onClick={handleSend}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-md transition-all cursor-pointer ${
              channel === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            {channel === 'whatsapp' ? <MessageSquare size={16} /> : <Send size={16} />}
            <span>
              {channel === 'whatsapp' ? 'Buka WhatsApp Pasien' : 'Kirim Pengingat Sekarang'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
