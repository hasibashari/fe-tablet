# Product Requirement Document (PRD)
# Fe-Tablet - Aplikasi Pengingat & Monitoring Konsumsi Tablet Tambah Darah (TTD)

**Status:** Active Specification  
**Versi:** 2.0.0 (UI/UX Aligned & Mobile-First Fe-Tablet Ecosystem)  
**Terakhir Diperbarui:** 21 September 2026  
**Tagline:** *"Small habit, big impact."*  

---

## 1. Executive Summary & Latar Belakang

### 1.1 Latar Belakang
Anemia defisiensi besi masih menjadi salah satu tantangan kesehatan masyarakat terbesar di Indonesia, terutama pada remaja putri dan wanita usia subur. Meskipun program suplementasi **Tablet Tambah Darah (TTD)** telah didistribusikan secara berkala, tingkat kepatuhan konsumsi rutin (1x seminggu) seringkali rendah akibat lupa, rasa bosan, kurangnya pemahaman tentang efek samping, serta minimnya dukungan sosial sebaya (*peer support*).

**Fe-Tablet** hadir sebagai platform mobile-first dan PWA modern yang berfokus pada:
1. **Pengingat Cerdas & Ergonomis:** Jadwal konsumsi TTD mingguan/harian yang fleksibel dan mudah dicatat.
2. **Monitoring Kepatuhan Komprehensif:** Visualisasi pencatatan status harian, riwayat mingguan, serta grafik kepatuhan bulanan.
3. **Edukasi & Literasi Interaktif:** Materi edukatif pencegahan anemia, panduan konsumsi bebas mual, dan klarifikasi mitos & fakta.
4. **Gamifikasi Sosial (Buddy Streak):** Fitur saling dukung antar-sahabat dengan indikator streak bersama (`🔥 6 Minggu Streak 🔥`) untuk membangun kebiasaan positif.
5. **Konsultasi Asisten Pintar (AI):** Tanya jawab cepat seputar keluhan TTD, gizi kaya zat besi, dan pencegahan anemia.

### 1.2 Tujuan Produk (Product Objectives)
- **Meningkatkan Kepatuhan Minum TTD:** Memudahkan pencatatan kepatuhan minum obat dalam 1-2 sentuhan (*thumb-friendly*).
- **Membangun Kebiasaan Melalui Komunitas:** Memanfaatkan efek dukungan sebaya lewat *Buddy Streak*.
- **Memberikan Pengalaman UI yang Ramah:** Mengeliminasi kesan medis yang dingin dengan palet warna ceria (*Rose Pastel*), kartu melengkung (*rounded cards*), dan tata letak modern.
- **Dukungan PWA & Offline-First:** Memastikan aplikasi dapat diinstal di smartphone/tablet serta mencatat status konsumsi meskipun koneksi internet tidak stabil.

---

## 2. Peran Pengguna & Matriks Hak Akses (RBAC)

Aplikasi memiliki **2 peran pengguna terpisah**:

```
+--------------------------------------------------------------------------------+
|                                  FE-TABLET                                     |
+---------------------------------------+----------------------------------------+
|                 USER                  |                 ADMIN                  |
|    (Remaja Putri / Pasien / Umum)     |    (Fasilitator Medis / Administrator) |
+---------------------------------------+----------------------------------------+
| - Splash & Onboarding Interaktif      | - Dashboard Statistik Kepatuhan Global |
| - Dashboard Hero Pengingat & Status   | - Manajemen Akun Pengguna / Siswi      |
| - Pengaturan Jadwal & Modal Ubah Waktu| - Manajemen Jadwal & Push Pengingat    |
| - Monitoring 3-Tab (Hari/Minggu/Bulan)| - Manajemen Katalog TTD & Suplemen     |
| - Modul Edukasi, Kategori & Artikel   | - CMS Publikasi Artikel Edukasi        |
| - Buddy Streak & Log Aktivitas Teman  | - Monitoring Program Kesehatan Sekolah |
| - Konsultasi Asisten AI & Topik Populer| - Laporan Analitik & Ekspor Data      |
| - Profil Mandiri & Pengaturan Notifikasi| - Profil & Pengaturan Sistem         |
+---------------------------------------+----------------------------------------+
```

### 2.1 Matriks Hak Akses Rute

| Rute / Modul | Deskripsi | User | Admin | Public / Guest |
|---|---|:---:|:---:|:---:|
| `/splash` | Layar Splash Branding | ✅ | ✅ | ✅ |
| `/onboarding` | Panduan Pengenalan 3 Slide | ✅ | ❌ | ✅ |
| `/auth/login` | Halaman Masuk Akun | ✅ | ✅ | ✅ |
| `/auth/register` | Halaman Pendaftaran Pengguna | ✅ | ❌ | ✅ |
| `/user/dashboard` | Dashboard Utama & Hero Pengingat | ✅ | ❌ | ❌ |
| `/user/schedule` | Pengaturan Jadwal Konsumsi TTD | ✅ | ❌ | ❌ |
| `/user/history` | Monitoring 3 Tab (Hari/Minggu/Bulan) | ✅ | ❌ | ❌ |
| `/user/education` | Katalog Materi & Artikel Edukasi | ✅ | ❌ | ❌ |
| `/user/buddy` | Gamifikasi Buddy Streak & Semangat | ✅ | ❌ | ❌ |
| `/user/consultation`| Asisten Pintar AI & Tanya Jawab | ✅ | ❌ | ❌ |
| `/user/profile` | Profil Pengguna & Pengaturan Akun | ✅ | ❌ | ❌ |
| `/admin/dashboard` | Dashboard Analitik & Kepatuhan Siswi | ❌ | ✅ | ❌ |
| `/admin/users` | Daftar Pengguna & Status Kepatuhan | ❌ | ✅ | ❌ |
| `/admin/schedules` | Pengelolaan Jadwal Massal | ❌ | ✅ | ❌ |
| `/admin/products` | Katalog Produk TTD & Suplemen | ❌ | ✅ | ❌ |
| `/admin/articles` | Editor Artikel Edukasi | ❌ | ✅ | ❌ |
| `/admin/reports` | Laporan & Analitik Kepatuhan | ❌ | ✅ | ❌ |

---

## 3. Arsitektur Informasi & Navigasi Mobile-First

### 3.1 Struktur Navigasi Aplikasi User

Struktur aplikasi user dirancang berbasis **Mobile-First** dengan orientasi *thumb-friendly*:
- **Top Bar (ScreenHeader):** Menampilkan sapaan nama pengguna (*"Hai, Sarah! 🌸"*), avatar mini (menuju `/user/profile`), dan ikon lonceng notifikasi.
- **Bottom Navigation Bar (5 Tab Tetap):**
  1. **Beranda (`/user/dashboard`):** Ikon `Home`
  2. **Monitoring (`/user/history`):** Ikon `CalendarCheck`
  3. **Edukasi (`/user/education`):** Ikon `BookOpen`
  4. **Buddy (`/user/buddy`):** Ikon `Flame`
  5. **Konsultasi (`/user/consultation`):** Ikon `Bot`

```
┌─────────────────────────────────────────────────────────────┐
│ Top Bar:  [ 🌸 Fe-Tablet ]         [ 🔔 Notif ] [ 👤 Sarah ] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                      PAGE CONTENT AREA                      │
│                (Scrollable, max-w-md mx-auto)               │
│                                                             │
│                    pb-28 (Safe Scroll Zone)                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Bottom Nav:                                                 │
│ [ 🏠 Beranda ] [ 📊 Pantau ] [ 📚 Edukasi ] [ 🔥 Buddy ] [ 🤖 AI ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### FR-1: Autentikasi & Onboarding
- **FR-1.1 Splash Screen:** Menampilkan animasi tetesan darah, logo, tagline, serta pemeriksaan session login / status onboarding otomatis.
- **FR-1.2 Onboarding Carousel:** 3 slide berbasis data (*data-driven*):
  - Slide 1: Pengingat Tepat Waktu (Jadwal mingguan otomatis).
  - Slide 2: Monitoring & Grafik (Pantau kepatuhan konsumsi).
  - Slide 3: Buddy Streak & AI (Cegah anemia bersama kawan & konsultasi pintar).
- **FR-1.3 Registrasi & Login:** Masuk dengan email/password, validasi input real-time, loading feedback spinner, dan banner penanganan error yang jelas.

### FR-2: Dashboard & Pengingat TTD (Home)
- **FR-2.1 Hero Card Pengingat:** Menampilkan jadwal TTD berikutnya (*Sabtu, 10 Oktober 2026 • 08:00 WIB*), dosis (*1 tablet, 1x seminggu*), dan badge hitung mundur (*Tinggal 2 hari lagi*).
- **FR-2.2 Status Hari Ini:** Menampilkan status konsumsi hari ini (Belum Dicatat / Sudah Dicatat) dengan tombol aksi cepat *[ Catat Sekarang ]*.
- **FR-2.3 Menu Cepat (Quick Action Grid):** Akses 1-sentuhan menuju Pengingat, Monitoring, Edukasi, Buddy Streak, dan Konsultasi AI.

### FR-3: Jadwal & Pengaturan Pengingat
- **FR-3.1 Tampilan Jadwal Aktif:** Card jadwal konsumsi rutin beserta switch toggle aktif/nonaktif pengingat.
- **FR-3.2 Modal Ubah Jadwal:**
  - Pemilihan hari (Senin – Minggu chip selector).
  - Pemilihan waktu/jam konsumsi.
  - Frekuensi konsumsi (1x seminggu atau harian).
  - Opsi notifikasi pengingat 15 menit sebelumnya.
- **FR-3.3 Informasi Medis Singkat:** Petunjuk konsumsi (misal: diminum setelah makan, hindari konsumsi bersamaan dengan teh/kopi/susu).

### FR-4: Monitoring & Riwayat Konsumsi
- **FR-4.1 Tab Hari Ini:**
  - Kartu konfirmasi status 3 tingkat: 🟢 **Tercatat (*recorded*)**, 🔴 **Terlewat (*missed*)**, ⚪ **Belum Dicatat (*pending*)**.
  - Tombol aksi konfirmasi minum obat: *[ ✓ Sudah Minum ]* dan *[ ✕ Terlewat ]*.
- **FR-4.2 Tab Mingguan:**
  - Timeline kepatuhan 4 minggu dalam bulan berjalan.
  - Detail tanggal dan jam konfirmasi setiap minggu.
- **FR-4.3 Tab Bulanan:**
  - **Grafik Konsumsi (`ConsumptionChart`):** Diagram batang vertikal 6 bulan terakhir dengan garis target kepatuhan.
  - **Statistik Kepatuhan:** Total konsumsi bulan ini, persentase kepatuhan, dan rekor streak mingguan.

### FR-5: Edukasi & Literasi Anemia
- **FR-5.1 Pencarian & Filter Kategori:** Search bar materi + Filter Chips (*Semua, Anemia, TTD, Nutrisi, Gaya Hidup, Mitos & Fakta*).
- **FR-5.2 Featured Article Banner:** Artikel sorotan utama dengan badge waktu baca dan gambar ilustrasi ramah.
- **FR-5.3 Katalog Artikel Populer:** Daftar materi edukasi ringkas dengan format kartu interaktif.

### FR-6: Buddy Streak (Gamifikasi & Dukungan Sebaya)
- **FR-6.1 Header Streak Bersama:** Indikator kobaran api bersama (`Sarah 🔥 6 Minggu Streak 🔥 Alya`).
- **FR-6.2 Status Kawan:** Indikator apakah sahabat sudah mengonfirmasi konsumsi TTD minggu ini.
- **FR-6.3 Activity Feed:** Rekam jejak aktivitas saling dukung (misal: *"Alya mencatat konsumsi TTD"*, *"Sarah mengirimkan stiker semangat"*).
- **FR-6.4 Aksi Kirim Semangat:** Tombol 1-klik untuk mengirim apresiasi dan motivasi kepada kawan.

### FR-7: Konsultasi AI (Asisten Fe-Tablet)
- **FR-7.1 Landing Page Asisten:** Banner sapaan asisten ramah + tombol *[ Mulai Chat ]*.
- **FR-7.2 Topik Populer (Quick Prompt Chips):** Rekomendasi pertanyaan umum (contoh: *"Bolehkah minum TTD bersama jeruk?"*, *"Tips atasi rasa mual"*).
- **FR-7.3 Antarmuka Chat Percakapan:** Bubble chat responsif dengan simulasi jawaban asisten pintar dan disclaimer medis.

### FR-8: Profil & Pengaturan Akun
- **FR-8.1 Data Pribadi:** Nama, email, asal sekolah/institusi, dan badge level kepatuhan (*Level 3: Super Consistent*).
- **FR-8.2 Menu Pengaturan:** Akun Saya, Pengaturan Pengingat, Notifikasi, Pusat Bantuan/FAQ, dan Tentang Aplikasi.
- **FR-8.3 Logout:** Modal dialog konfirmasi keluar dari akun.

### FR-9: Admin Portal (Monitoring & Fasilitasi)
- **FR-9.1 Dashboard Admin:** Metrik jumlah siswi/pengguna aktif, persentase kepatuhan global, dan alert kepatuhan rendah.
- **FR-9.2 Manajemen Pasien/Siswi:** Daftar pengguna, filter risiko anemia, dan pengiriman notifikasi pengingat langsung.
- **FR-9.3 Manajemen Konten:** CMS artikel edukasi dan katalog suplemen TTD.

---

## 5. Skema Data & Model (PostgreSQL & Mock Store)

Aplikasi mengadopsi arsitektur data konsisten antara Mock State lokal (`src/shared/mock/feTabletData.ts`) dan database PostgreSQL:

### 5.1 Skema Entitas Utama

```
┌─────────────────────────┐         ┌─────────────────────────┐
│          users          │1       *│   reminders_schedules   │
├─────────────────────────┼─────────┼─────────────────────────┤
│ id (PK)                 │         │ id (PK)                 │
│ name, email, phone      │         │ user_id (FK)            │
│ role ('user' | 'admin') │         │ day_of_week, time       │
│ school_or_org           │         │ tablet_name, dosage     │
│ avatar_url, hb_level    │         │ is_enabled, frequency   │
└────────────┬────────────┘         └────────────┬────────────┘
             │1                                  │1
             │                                   │
             │*                                  │*
┌────────────┴────────────┐         ┌────────────┴────────────┐
│   consumption_logs      │         │     buddy_relations     │
├─────────────────────────┤         ├─────────────────────────┤
│ id (PK)                 │         │ id (PK)                 │
│ user_id (FK)            │         │ user_id (FK)            │
│ schedule_id (FK)        │         │ buddy_user_id (FK)      │
│ scheduled_date, time    │         │ current_streak          │
│ taken_at                │         │ status ('active'|...)   │
│ status ('recorded'|...) │         │ last_activity_at        │
└─────────────────────────┘         └─────────────────────────┘
```

### 5.2 Definisi Model TypeScript

```ts
export type UserRole = "user" | "admin";
export type ConsumptionStatus = "recorded" | "missed" | "pending";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  schoolOrOrg?: string;
  streakCount: number;
  avatarUrl?: string;
  hbLevel?: number;
}

export interface ReminderSchedule {
  id: string;
  userId: string;
  dayOfWeek: string;
  time: string;
  tabletName: string;
  dosage: string;
  frequency: "weekly" | "daily";
  isEnabled: boolean;
  nextDate: string;
}

export interface ConsumptionLog {
  id: string;
  userId: string;
  scheduleId?: string;
  scheduledDate: string;
  scheduledTime: string;
  takenAt?: string;
  status: ConsumptionStatus;
  notes?: string;
}

export interface BuddyStreakData {
  buddyId: string;
  buddyName: string;
  buddyAvatar: string;
  streakCount: number;
  buddyStatusThisWeek: ConsumptionStatus;
  activities: {
    id: string;
    description: string;
    timestamp: string;
    isPositive: boolean;
  }[];
}

export interface EducationArticle {
  id: string;
  title: string;
  category: "Anemia" | "TTD" | "Gaya Hidup" | "Nutrisi" | "Mitos";
  readTime: string;
  summary: string;
  contentMarkdown?: string;
  imageUrl: string;
  isFeatured?: boolean;
}
```

---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Responsiveness & Ergonomi Mobile:**
   - Optimal pada resolusi layar mobile smartphone (360px – 430px) dengan container terpusat (`max-w-md mx-auto`) pada tablet/desktop.
   - Ukuran target sentuh tombol minimal 44px × 44px.
   - Safe area padding bawah (`pb-28`) untuk memastikan konten tidak tertutup bottom bar.
2. **PWA & Offline Usability:**
   - Manifest PWA valid dengan `display: standalone` dan tema warna Rose `#e11d48`.
   - Penyimpanan status konfirmasi lokal di `localStorage` saat perangkat offline, dengan sinkronisasi otomatis saat online kembali.
3. **Aksesibilitas & Kontras:**
   - Kontras warna teks memenuhi standar WCAG AA (rasio minimal 4.5:1 terhadap background).
   - Label atribut `aria-label` yang jelas pada seluruh tombol navigasi dan ikon.
4. **Keamanan & Proteksi:**
   - Enkripsi password menggunakan bcrypt / argon2.
   - Proteksi otorisasi berbasis token JWT / session cookies dengan pembatasan akses ketat antara area `/user/*` dan `/admin/*`.

---

## 7. Rencana Tahapan Implementasi (Action Roadmap)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FE-TABLET ROADMAP                               │
├───────────────────┬────────────────────────────────────────────────────┤
│ Phase 1: Tokens   │ - Sinkronisasi design tokens & styling di Tailwind │
│ & Design System   │ - Setup komponen dasar UI (Button, Card, Badge,    │
│                   │   Chip, Input, BottomSheet Modal, Navigation)      │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 2: Auth     │ - Pembuatan Splash Screen & alur router            │
│ & Onboarding      │ - Onboarding 3-Slide Carousel                      │
│                   │ - Desain form Login & Register dengan palet Rose   │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 3: Core App │ - Implementasi AppShell & BottomNavigationBar      │
│ Shell & Dashboard │ - Dashboard Beranda (Hero Reminder Card, Status    │
│                   │   Hari Ini, Grid 5 Menu Cepat)                     │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 4: Jadwal   │ - Halaman Pengingat & Modal Ubah Jadwal            │
│ & Monitoring      │ - Halaman Monitoring 3 Tab (Hari Ini, Mingguan,    │
│                   │   Bulanan dengan ConsumptionChart)                 │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 5: Edukasi  │ - Search & Category Filter Chips                   │
│ & Literasi        │ - Featured Article & Grid Artikel Populer          │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 6: Social   │ - Halaman Buddy Streak (Header Api, Log Aktivitas, │
│ & Gamifikasi      │   Aksi Kirim Semangat)                             │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 7: AI Chat  │ - Landing Asisten Fe-Tablet & Quick Topic Chips    │
│ & Konsultasi      │ - Chat Interface & Simulasi Respons Pintar         │
├───────────────────┼────────────────────────────────────────────────────┤
│ Phase 8: Profil   │ - Halaman Profil & Pengaturan Notifikasi           │
│ & Final Polish    │ - Modal Konfirmasi Logout & verifikasi PWA         │
└───────────────────┴────────────────────────────────────────────────────┘
```
