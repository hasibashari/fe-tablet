'use client';

import { useState } from 'react';
import { Mail, Phone, Shield, Building, CheckCircle2, Award } from 'lucide-react';
import ProfileLayout from '@/src/shared/components/ProfileLayout';
import { useAuth } from '@/src/features/auth';
import { CrudModalDialog } from '@/src/shared/components/CrudModalDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';

export default function AdminProfileView() {
  const { user } = useAuth();

  // Profile State
  const [profileData, setProfileData] = useState({
    name: user?.name || 'dr. Sarah Jenkins, Sp.GK',
    email: user?.email || 'admin@medicore.com',
    phone: user?.phone || '+62 811-2233-4455',
    title: user?.schoolOrOrg || 'Fasilitator Kesehatan UKS',
    department: 'Manajemen Program TTD & Anemia Remaja',
    clinicName: 'Fe-Tablet Puskesmas / UKS Sekolah',
    roleLabel: 'Administrator',
  });

  // Edit Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(profileData);
  const [toastOpen, setToastOpen] = useState(false);

  const handleOpenEdit = () => {
    setEditForm(profileData);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    setProfileData(editForm);
    setEditOpen(false);
    setToastOpen(true);
  };

  return (
    <>
      <ProfileLayout
        title='Profil Admin'
        subtitle='Informasi identitas, kontak dinas, serta kredensial akun administrator sistem.'
        name={profileData.name}
        avatarUrl={user?.avatarUrl}
        badges={
          <>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white'>
              ADMINISTRATOR
            </span>
            <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'>
              <CheckCircle2 size={13} className='text-emerald-600' />
              Terverifikasi
            </span>
          </>
        }
        secondaryText={`${profileData.title} • ${profileData.clinicName}`}
        onEditClick={handleOpenEdit}
        contactItems={[
          { icon: Mail, label: 'Email Dinas', value: profileData.email },
          { icon: Phone, label: 'Nomor Telepon', value: profileData.phone },
          { icon: Building, label: 'Unit Kerja', value: profileData.department },
        ]}
        metricsTitle='Kredensial & Hak Akses'
        metrics={[
          {
            label: 'Hak Akses',
            value: 'Full Control',
            subtitle: 'Pengguna, Obat, Jadwal, Laporan',
            icon: Shield,
            iconBgColor: 'bg-rose-50',
            iconColor: 'text-rose-600',
          },
          {
            label: 'Sistem Pengelola',
            value: 'MediCore Central',
            subtitle: 'Portal Manajemen Terpadu',
            icon: Building,
            iconBgColor: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
          },
          {
            label: 'Status Akun',
            value: 'Aktif & Valid',
            subtitle: 'Role Administrator Tunggal',
            icon: Award,
            iconBgColor: 'bg-amber-50',
            iconColor: 'text-amber-600',
          },
        ]}
      />

      {/* Edit Profile Dialog Modal */}
      <CrudModalDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title='Edit Profil Admin'
        onSubmit={handleSaveEdit}
        submitText='Simpan Perubahan'
        maxWidth='sm'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5'>
              Nama Lengkap Administrator
            </label>
            <input
              type='text'
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className='w-full px-3.5 py-2 bg-slate-50 border border-pink-100 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5'>
              Email Kedinasan
            </label>
            <input
              type='email'
              value={editForm.email}
              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
              className='w-full px-3.5 py-2 bg-slate-50 border border-pink-100 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5'>
              Nomor Telepon / WhatsApp
            </label>
            <input
              type='tel'
              value={editForm.phone}
              onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
              className='w-full px-3.5 py-2 bg-slate-50 border border-pink-100 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5'>
              Jabatan & Peran
            </label>
            <input
              type='text'
              value={editForm.title}
              onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              className='w-full px-3.5 py-2 bg-slate-50 border border-pink-100 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all'
              required
            />
          </div>

          <div>
            <label className='block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5'>
              Unit / Divisi Kerja
            </label>
            <input
              type='text'
              value={editForm.department}
              onChange={e => setEditForm({ ...editForm, department: e.target.value })}
              className='w-full px-3.5 py-2 bg-slate-50 border border-pink-100 rounded-xl text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all'
              required
            />
          </div>
        </div>
      </CrudModalDialog>

      {/* Success Toast */}
      <ToastFeedback
        open={toastOpen}
        message='Profil admin berhasil diperbarui!'
        severity='success'
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}
