'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, BellRing, Edit, Trash2, Phone } from 'lucide-react';
import AdminHeader from '../components/AdminHeader';
import SendReminderModal from '../components/SendReminderModal';
import UserFormModal from '../components/UserFormModal';
import { DataTable, Column } from '@/src/shared/components/DataTable';
import { ConfirmDeleteDialog } from '@/src/shared/components/ConfirmDeleteDialog';
import { ToastFeedback } from '@/src/shared/components/ToastFeedback';
import { useCrudModal } from '@/src/shared/hooks/useCrudModal';
import { useDeleteConfirm } from '@/src/shared/hooks/useDeleteConfirm';
import { useToast } from '@/src/shared/hooks/useToast';
import {
  getPatientsAction,
  createPatientAction,
  updatePatientAction,
  deletePatientAction,
  sendPatientReminderAction,
} from '../api/patientRepository';
import { PatientUser } from '../types/admin.types';
import {
  INITIAL_PATIENT_FORM_DATA,
  PatientFormData,
  RISK_LEVEL_OPTIONS,
  RISK_LEVEL_COLORS,
  RiskLevel,
  UserGender,
} from '../constants/user.constants';

export default function UserManagementView() {
  const [patients, setPatients] = useState<PatientUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('Semua');
  const [submitting, setSubmitting] = useState(false);

  // 1. Hook Form Modal Add/Edit
  const {
    openModal,
    editingId,
    formData,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    updateFormData,
  } = useCrudModal<PatientFormData>(INITIAL_PATIENT_FORM_DATA);

  // 2. Hook Konfirmasi Hapus
  const {
    open: deleteConfirmOpen,
    itemToDelete: patientToDelete,
    requestDelete: handleDeleteRequest,
    closeDelete: handleCloseDelete,
  } = useDeleteConfirm<string>();

  // 3. Hook Feedback Notifikasi
  const {
    open: toastOpen,
    message: toastMsg,
    severity: toastSeverity,
    showToast,
    hideToast,
  } = useToast();

  // Reminder Modal State
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderData, setReminderData] = useState<{
    patientId?: string;
    patientName: string;
    patientPhone?: string;
  }>({
    patientName: '',
  });

  const loadPatients = useCallback(async () => {
    const data = await getPatientsAction();
    setPatients(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPatients = async () => {
      const data = await getPatientsAction();
      if (isMounted) setPatients(data);
    };
    fetchPatients();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchPatients();
      }
    }, 8000);

    const handleFocus = () => {
      fetchPatients();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);
    const matchesRisk = riskFilter === 'Semua' || p.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const onOpenAdd = () => {
    handleOpenAdd();
  };

  const onOpenEdit = (patient: PatientUser) => {
    handleOpenEdit(patient.id, {
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender as UserGender,
      phone: patient.phone,
      email: patient.email || '',
      riskLevel: (patient.riskLevel as RiskLevel) || 'Rendah',
      assignedDoctor: patient.schoolOrOrg || 'SMA Negeri 1 Sehat',
      medicalNotes: patient.medicalNotes || '',
    });
  };

  const handleSavePatient = async () => {
    if (!formData.name || !formData.phone) {
      showToast('Nama dan nomor telepon wajib diisi', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updatePatientAction(editingId, {
          name: formData.name,
          age: parseInt(formData.age, 10) || 16,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
          riskLevel: formData.riskLevel,
          schoolOrOrg: formData.assignedDoctor,
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadPatients();
          handleCloseModal();
          showToast('Data siswi berhasil diperbarui di database!', 'success');
        } else {
          showToast(res.error || 'Gagal memperbarui data', 'error');
        }
      } else {
        const res = await createPatientAction({
          name: formData.name,
          age: parseInt(formData.age, 10) || 16,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
          riskLevel: formData.riskLevel,
          assignedDoctor: formData.assignedDoctor || 'SMA Negeri 1 Sehat',
          medicalNotes: formData.medicalNotes,
        });

        if (res.success) {
          await loadPatients();
          handleCloseModal();
          showToast('Siswi baru berhasil ditambahkan ke database!', 'success');
        } else {
          showToast(res.error || 'Gagal menambahkan siswi', 'error');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (patientToDelete) {
      const res = await deletePatientAction(patientToDelete);
      if (res.success) {
        await loadPatients();
        showToast('Data siswi berhasil dihapus dari database.', 'success');
      } else {
        showToast(res.error || 'Gagal menghapus data siswi', 'error');
      }
    }
    handleCloseDelete();
  };

  const handleOpenReminder = (patient: PatientUser) => {
    setReminderData({
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
    });
    setReminderModalOpen(true);
  };

  const handleSendReminderSuccess = async (_channel: 'app' | 'whatsapp', messageSent: string) => {
    if (reminderData.patientId) {
      await sendPatientReminderAction(reminderData.patientId, messageSent);
      await loadPatients();
    }
  };

  // Streamlined 5 Essential Columns
  const columns: Column<PatientUser>[] = [
    {
      id: 'patient',
      label: 'Siswi (Pengguna)',
      width: '28%',
      renderCell: patient => (
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-pink-100 overflow-hidden relative shadow-2xs'>
            {patient.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={patient.avatarUrl}
                alt={patient.name}
                className='w-full h-full object-cover'
              />
            ) : (
              <span>{patient.name.charAt(0)}</span>
            )}
          </div>
          <div className='min-w-0'>
            <div className='font-bold text-slate-800 text-sm truncate'>
              {patient.name}
            </div>
            <div className='text-xs text-slate-400 truncate'>
              {patient.id} • {patient.age} th
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'school',
      label: 'Sekolah & Kontak',
      width: '24%',
      renderCell: patient => (
        <div>
          <div className='font-semibold text-slate-800 text-xs sm:text-sm truncate'>
            {patient.schoolOrOrg || 'SMA Negeri 1 Sehat'}
          </div>
          <div className='text-xs text-slate-500 flex items-center gap-1 mt-0.5'>
            <Phone size={11} className='text-rose-500 shrink-0' />
            <span>{patient.phone}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'adherence',
      label: 'Kepatuhan TTD',
      width: '18%',
      renderCell: patient => {
        const rate = patient.adherenceRate ?? 100;
        const color =
          rate >= 90
            ? 'text-emerald-600'
            : rate >= 80
            ? 'text-amber-600'
            : 'text-rose-600';
        return (
          <div>
            <div className='flex items-center gap-1.5'>
              <span className={`font-bold text-sm ${color}`}>{rate}%</span>
              <span className='text-[11px] text-slate-400'>
                ({patient.activeSchedulesCount || 0} Jadwal)
              </span>
            </div>
            <div className='w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden'>
              <div
                className={`h-full rounded-full ${
                  rate >= 90 ? 'bg-emerald-500' : rate >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'riskLevel',
      label: 'Tingkat Risiko',
      width: '18%',
      renderCell: patient => {
        const style = RISK_LEVEL_COLORS[patient.riskLevel] || RISK_LEVEL_COLORS.default;
        return (
          <span
            className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold'
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {patient.riskLevel}
          </span>
        );
      },
    },
    {
      id: 'aksi',
      label: 'Aksi',
      align: 'right',
      width: '12%',
      renderCell: patient => (
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            title='Kirim Pengingat'
            onClick={() => handleOpenReminder(patient)}
            className='p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer'
          >
            <BellRing size={16} />
          </button>
          <button
            type='button'
            title='Edit Siswi'
            onClick={() => onOpenEdit(patient)}
            className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer'
          >
            <Edit size={16} />
          </button>
          <button
            type='button'
            title='Hapus Siswi'
            onClick={() => handleDeleteRequest(patient.id)}
            className='p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer'
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminHeader
        title='Manajemen Siswi (Pengguna)'
        subtitle='Pantau data kesehatan siswi, riwayat kepatuhan TTD, dan kirim pengingat langsung.'
      />

      {/* Filter Bar */}
      <div className='p-4 sm:p-5 mb-6 rounded-2xl sm:rounded-3xl border border-pink-100 bg-white shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3'>
        <div className='flex flex-col sm:flex-row gap-3 flex-1'>
          <div className='relative flex-1'>
            <span className='absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400'>
              <Search size={18} />
            </span>
            <input
              type='text'
              placeholder='Cari nama, ID siswi, atau no hp...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all'
            />
          </div>

          <div className='min-w-full sm:min-w-[180px]'>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className='w-full px-3.5 py-2.5 rounded-xl border border-pink-100 bg-slate-50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all cursor-pointer'
            >
              <option value='Semua'>Semua Risiko</option>
              {RISK_LEVEL_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type='button'
          onClick={onOpenAdd}
          className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-sm transition-all cursor-pointer whitespace-nowrap'
        >
          <UserPlus size={18} />
          <span>Tambah Siswi</span>
        </button>
      </div>

      {/* Patients Table & Mobile Card View */}
      <DataTable
        columns={columns}
        data={filteredPatients}
        emptyMessage='Tidak ada siswi yang ditemukan.'
        renderMobileCard={patient => {
          const style = RISK_LEVEL_COLORS[patient.riskLevel] || RISK_LEVEL_COLORS.default;
          return (
            <div className='p-4 rounded-2xl border border-pink-100 bg-white shadow-sm flex flex-col gap-3'>
              {/* Header: Avatar + Name + Risk */}
              <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-3 min-w-0'>
                  <div className='w-10 h-10 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-pink-100 overflow-hidden relative shadow-2xs'>
                    {patient.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={patient.avatarUrl}
                        alt={patient.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <span>{patient.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className='min-w-0'>
                    <h4 className='font-bold text-slate-900 text-sm sm:text-base leading-tight truncate'>
                      {patient.name}
                    </h4>
                    <p className='text-xs text-slate-500 mt-0.5 truncate'>
                      {patient.id} • {patient.age} th ({patient.schoolOrOrg || 'UKS Sekolah'})
                    </p>
                  </div>
                </div>

                <span
                  className='px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0'
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {patient.riskLevel}
                </span>
              </div>

              {/* Info Row: Phone + Schedules + Adherence */}
              <div className='grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#fff5f7] border border-pink-100 text-xs'>
                <div>
                  <span className='text-slate-500 block text-[11px]'>Kontak Telepon</span>
                  <span className='font-semibold text-slate-800'>{patient.phone}</span>
                </div>

                <div>
                  <span className='text-slate-500 block text-[11px]'>Kepatuhan TTD</span>
                  <span
                    className={`font-bold ${
                      patient.adherenceRate >= 90
                        ? 'text-emerald-600'
                        : patient.adherenceRate >= 80
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {patient.adherenceRate}% ({patient.activeSchedulesCount || 0} Jadwal)
                  </span>
                </div>
              </div>

              {/* Actions Row */}
              <div className='flex items-center justify-between gap-2 pt-1'>
                <button
                  type='button'
                  onClick={() => handleOpenReminder(patient)}
                  className='flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm transition-all cursor-pointer'
                >
                  <BellRing size={14} />
                  <span>Kirim Pengingat</span>
                </button>

                <div className='flex gap-1'>
                  <button
                    type='button'
                    title='Edit Data Siswi'
                    onClick={() => onOpenEdit(patient)}
                    className='p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer'
                  >
                    <Edit size={15} />
                  </button>
                  <button
                    type='button'
                    title='Hapus Siswi'
                    onClick={() => handleDeleteRequest(patient.id)}
                    className='p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer'
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        }}
      />

      {/* Add/Edit Patient Modal Component */}
      <UserFormModal
        open={openModal}
        editingId={editingId}
        formData={formData}
        submitting={submitting}
        onClose={handleCloseModal}
        onSave={handleSavePatient}
        onUpdateFormData={updateFormData}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={deleteConfirmOpen}
        title='Konfirmasi Hapus'
        message='Apakah Anda yakin ingin menghapus pasien ini? Data tidak dapat dikembalikan.'
        confirmText='Hapus Pasien'
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Send Reminder Modal */}
      <SendReminderModal
        open={reminderModalOpen}
        onClose={() => setReminderModalOpen(false)}
        patientName={reminderData.patientName}
        patientPhone={reminderData.patientPhone}
        onSendSuccess={handleSendReminderSuccess}
      />

      {/* Toast Feedback */}
      <ToastFeedback
        open={toastOpen}
        message={toastMsg}
        severity={toastSeverity}
        onClose={hideToast}
      />
    </div>
  );
}
