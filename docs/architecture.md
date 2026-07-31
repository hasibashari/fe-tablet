# Frontend Architecture Guidelines

Proyek ini menggunakan **Feature-Based Architecture** yang digabungkan dengan **Next.js App Router**. Tujuan utamanya adalah untuk memisahkan secara ketat antara tanggung jawab *routing* (URL) dengan tanggung jawab logika antarmuka (UI & *State*).

## Prinsip Utama (Strict Separation of Concerns)

Terdapat aturan baku dalam penulisan kode di proyek ini yang terinspirasi dari struktur halaman utama (`Home`):

### 1. Folder `src/app` (Router & Assembler)
- **Fungsi:** Hanya bertugas sebagai pengatur *routing* (URL) dan perakit (*assembler*).
- **Aturan Ketat:**
  - **TIDAK BOLEH** ada *state management* (`useState`, `useReducer`) atau *side effects* (`useEffect`) di dalam file `page.tsx` atau `layout.tsx`.
  - **TIDAK BOLEH** ada pengambilan data langsung (*data fetching*) yang rumit atau *business logic* di sini.
  - File `page.tsx` seharusnya sangat pendek, bersih, dan hanya mengimpor komponen dari `src/features/` atau `src/shared/`.
  - Direktif `'use client'` sebisa mungkin dihindari di level `src/app/page.tsx`, melainkan diletakkan pada komponen spesifik di dalam `features`.

**Contoh yang BENAR (`src/app/page.tsx`):**
```tsx
import { Hero, Benefits } from '../features/home'
import Navbar from '../shared/components/Navbar'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Benefits />
    </main>
  )
}
```

### 2. Folder `src/features` (Pabrik Logika & Komponen Inti)
- **Fungsi:** Menyimpan semua komponen antarmuka, *hooks*, logika bisnis, dan *state* yang spesifik untuk sebuah fitur.
- Jika sebuah halaman membutuhkan *state* (seperti halaman Dashboard yang butuh fungsi centang jadwal), maka seluruh logika tersebut harus dibungkus dalam sebuah komponen besar (sering disebut *Page Component* atau *View Component*) di dalam folder fitur terkait.
- **Pola Ekspor Terpusat (Barrel Export Pattern):** Setiap fitur **WAJIB** memiliki file `index.ts` di *root* folder fiturnya. File ini berfungsi sebagai "pintu masuk" tunggal (Public API) untuk mengekspor komponen yang boleh diakses dari luar fitur (seperti dari folder `app`). Ini mencegah pola *import* yang terlalu dalam dan kotor.

**Contoh yang BENAR (`src/features/schedule/index.ts`):**
```ts
export { default as ReminderCard } from './components/ReminderCard'
export { default as ScheduleView } from './components/ScheduleView'
// Komponen internal lainnya yang tidak perlu diekspor biarkan saja.
```

**Contoh yang BENAR (di dalam `src/features/user/components/DashboardView.tsx`):**
```tsx
'use client'
import React, { useState, useEffect } from 'react'
// Mengambil dari pintu masuk fitur 'schedule', bukan import langsung ke file-nya.
import { ReminderCard } from '@/src/features/schedule'

export function DashboardView() {
  const [data, setData] = useState([])
  // ... logika fetch dan interaksi ...
  
  return (
    <div>
       <ReminderCard />
       {/* ... komponen lainnya ... */}
    </div>
  )
}
```
Lalu komponen `DashboardView` ini diekspor melalui `src/features/user/index.ts` dan dipanggil oleh `src/app/user/dashboard/page.tsx`.

### 3. Folder `src/shared` (Komponen & Utilitas Global)
- Menyimpan elemen yang dipakai lintas fitur (Navbar, Sidebar, Button, tipe data universal, utilitas seperti `cn`).

---

## Mengapa Aturan Ini Penting?
1. **Kerapian Kode (Readability):** Sangat mudah membaca struktur halaman (seperti daftar isi) ketika membuka `src/app/.../page.tsx`. Dan *import path* menjadi sangat bersih berkat pola `index.ts`.
2. **Kinerja (Performance):** Next.js App Router secara *default* menggunakan *Server Components*. Dengan memindahkan logika *Client* (`useState`) jauh ke dalam `features`, file `page.tsx` di `app` dapat tetap dirender sebagai *Server Component*, sehingga performa aplikasi jauh lebih cepat dan ringan.
3. **Pengujian (Testing & Reusability):** Komponen fitur yang terisolasi lebih mudah dites dan digunakan kembali tanpa bergantung pada struktur URL Next.js.
4. **Isolasi Domain:** Membatasi agar komponen internal suatu fitur tidak bocor (terakses) oleh fitur lain tanpa melalui "pintu resmi" (`index.ts`).
