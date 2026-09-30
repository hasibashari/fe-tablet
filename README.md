<div align="center">

# 🌸 FEMORY
### Platform Monitoring & Kepatuhan Konsumsi Tablet Tambah Darah (TTD) untuk Remaja Putri

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-FF6F00?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

<p align="center">
  Aplikasi web progresif (PWA) modern untuk membantu remaja putri dan siswi sekolah memantau kepatuhan konsumsi Tablet Tambah Darah (TTD), mencegah anemia, serta memudahkan pembina UKS dan tenaga kesehatan Puskesmas dalam memonitor kepatuhan dan status kebugaran.
</p>

</div>

---

## 📑 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
  - [👩‍🦰 Portal Pengguna (Siswi / Remaja Putri)](#-portal-pengguna-siswi--remaja-putri)
  - [🩺 Portal Administrator (Pembina UKS & Puskesmas)](#-portal-administrator-pembina-uks--puskesmas)
- [🛠️ Arsitektur & Tech Stack](#️-arsitektur--tech-stack)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [🚀 Panduan Memulai](#-panduan-memulai)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Konfigurasi Environment](#konfigurasi-environment)
  - [Inisialisasi & Seeding Database](#inisialisasi--seeding-database)
  - [Menjalankan Server Pengembangan](#menjalankan-server-pengembangan)
- [📜 Script NPM](#-script-npm)
- [📱 Dukungan PWA (Progressive Web App)](#-dukungan-pwa-progressive-web-app)
- [🤝 Kontribusi](#-kontribusi)

---

## ✨ Fitur Utama

### 👩‍🦰 Portal Pengguna (Siswi / Remaja Putri)

- **🔥 Dynamic Streak Tracker**: Perhitungan streak kepatuhan beruntun berbasis tanggal kronologis yang tersinkronisasi langsung dengan PostgreSQL.
- **📅 Interactive Calendar & Monitoring**:
  - Popover kalender mini dengan status indicator dots (🟢 Selesai, 🔴 Terlewat, 🟡 Hari Ini).
  - Quick filter preset (`Semua`, `Hari Ini`, `7 Hari`, `30 Hari`).
  - Action card cerdas untuk mencatat konsumsi seketika (*Sudah Minum*, *Terlewat*, *Ubah Status*).
- **⏰ Manajemen Jadwal Pengingat**: Pengaturan hari dan jam minum obat mingguan/harian dengan integrasi notifikasi browser dan reminder otomatis.
- **👯 Sahabat Sehat (Buddy System)**: Hubungkan pertemanan antar siswi dengan kode unik (`friendCode`), saling memantau status mingguan, dan mengirimkan pesan penyemangat (*cheer*).
- **📊 Grafik Evaluasi & Milestone**: Visualisasi kepatuhan bulanan, pemantauan kadar Hb (*Hemoglobin*), dan status risiko anemia.
- **📚 Edukasi & Artikel Kesehatan**: Konten interaktif seputar gizi, pencegahan anemia, dan panduan konsumsi TTD yang benar.

### 🩺 Portal Administrator (Pembina UKS & Puskesmas)

- **📈 Master Dashboard**: Statistik agregat kepatuhan sekolah, tingkat kepatuhan keseluruhan, total siswi berisiko, dan grafik tren kepatuhan berkala.
- **👥 Manajemen Data Pengguna (Siswi)**: CRUD data siswi, riwayat Hb, status risiko (*Rendah/Sedang/Tinggi*), dan sekolah/organisasi binaan.
- **⏰ Manajemen Jadwal & Intervensi**: Monitoring kepatuhan terjadwal, kirim pengingat langsung via integrasi WhatsApp, dan pengiriman notifikasi pengingat (*nudge*).
- **📑 Laporan & Rekapitulasi Kepatuhan**: Filter data berdasarkan kelas/sekolah, rekap status konsumsi per tanggal, serta ekspor data kepatuhan.
- **✍️ Manajemen Artikel Edukasi**: Pembuatan, penyuntingan, dan penerbitan materi edukasi kesehatan remaja.

---

## 🛠️ Arsitektur & Tech Stack

| Layer | Teknologi |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) + [Motion](https://motion.dev/) |
| **Bahasa Pemrograman** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens |
| **Komponen Ikon** | [Lucide React](https://lucide.dev/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (`pg` Client Pool) |
| **Arsitektur Server** | Next.js Server Actions (Type-safe Server RPC) |
| **Realtime Sync** | Client BroadcastChannel & Event Dispatcher |
| **PWA Engine** | Service Worker, Web App Manifest & Offline Caching |

---

## 📂 Struktur Direktori Proyek

```text
fe-tablet/
├── public/                     # Asset statis, ikon PWA, manifest
├── src/
│   ├── app/                    # Next.js App Router (Halaman & Layouts)
│   │   ├── (auth)/             # Route autentikasi (login, register)
│   │   ├── admin/              # Portal khusus Administrator / UKS
│   │   ├── user/               # Portal khusus Siswi / Pengguna
│   │   ├── onboarding/         # Alur onboarding pengguna baru
│   │   └── splash/             # Splash screen & PWA redirector
│   │
│   ├── db/                     # Konfigurasi PostgreSQL, skema & seed data
│   │   ├── client.ts           # Koneksi Pool Database
│   │   ├── init.ts             # DDL Database Tables & Indexes
│   │   └── seed.ts             # Data inisialisasi awal
│   │
│   ├── features/               # Arsitektur Berbasis Fitur (Domain-Driven)
│   │   ├── admin/              # Modul Admin (Dashboard, Users, Schedules, Reports)
│   │   ├── auth/               # Modul Autentikasi (Context, Hooks, Form)
│   │   ├── buddy/              # Modul Sahabat Sehat (Connections, Cheers)
│   │   ├── consumption/        # Modul Monitoring, Kalender & Log Konsumsi
│   │   ├── schedule/           # Modul Pengingat & Jadwal Minum Obat
│   │   └── user/               # Modul Profil Siswi & Dashboard Aggregator
│   │
│   └── shared/                 # Komponen & Utilitas Bersama
│       ├── components/
│       │   ├── domain/         # Komponen domain (StreakCard, Chart, BuddyCard)
│       │   └── ui/             # Desain sistem atomik (Button, Card, Badge, Chip)
│       ├── hooks/              # Reusable custom hooks (usePWA, useToast)
│       └── utils/              # Helper tanggal, notifikasi, realtime sync
│
├── package.json
└── tsconfig.json
```

---

## 🚀 Panduan Memulai

### Prasyarat

Pastikan perangkat Anda telah terpasang:
- **Node.js** (versi 18.18.0 atau lebih baru)
- **NPM** atau **PNPM** / **Yarn**
- **PostgreSQL Database** aktif

### Instalasi

1. Clone repositori ke komputer lokal Anda:
   ```bash
   git clone https://github.com/username/fe-tablet.git
   cd fe-tablet
   ```

2. Pasang semua dependensi proyek:
   ```bash
   npm install
   ```

### Konfigurasi Environment

Salin berkas `.env.example` menjadi `.env` dan sesuaikan kredensial database PostgreSQL Anda:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/fe_tablet_db
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=fe_tablet_db

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Inisialisasi & Seeding Database

Jalankan perintah berikut untuk membuat struktur tabel dan mengisi data awal:

```bash
# Inisialisasi skema tabel database
npm run db:init

# Mengisi data awal (Dummy Users, Schedules, Logs, Articles)
npm run db:seed
```

### Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka peramban dan akses [http://localhost:3000](http://localhost:3000).

---

## 📜 Script NPM

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan lokal dengan Hot Reload |
| `npm run build` | Melakukan kompilasi dan optimasi bundle untuk produksi |
| `npm run start` | Menjalankan server aplikasi Next.js mode produksi |
| `npm run lint` | Menjalankan linter ESLint untuk memeriksa kualitas kode |
| `npm run db:init` | Menginisialisasi skema tabel di database PostgreSQL |
| `npm run db:seed` | Mengisi data contoh (*mock data*) ke database |

---

## 📱 Dukungan PWA (Progressive Web App)

Aplikasi ini dirancang sebagai **Progressive Web App (PWA)** dengan kapabilitas:
- Dapat diinstal langsung pada smartphone Android, iOS, maupun desktop.
- Desain *responsive first* dioptimalkan untuk perangkat seluler dan tablet.
- Service worker untuk *caching* asset statis dan fallback halaman saat offline.
- Tampilan layar penuh (*standalone mode*) tanpa *browser URL bar*.

---

## 🤝 Kontribusi

Kontribusi, perbaikan bug, dan saran fitur sangat kami apresiasi:
1. *Fork* repositori ini
2. Buat branch fitur baru (`git checkout -b feature/fitur-keren`)
3. *Commit* perubahan Anda (`git commit -m 'feat: menambahkan fitur keren'`)
4. *Push* ke branch Anda (`git push origin feature/fitur-keren`)
5. Ajukan *Pull Request*

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk mendukung program pencegahan anemia remaja putri Indonesia.</p>
</div>
