import React from 'react';
import SetupProfileView from '@/src/features/user/view/SetupProfileView';

export const metadata = {
  title: 'Setup Profil & Jadwal TTD | FEMORY',
  description: 'Lengkapi data profil siswi dan atur jadwal minum Tablet Tambah Darah pertamamu.',
};

export default function SetupPage() {
  return <SetupProfileView />;
}
