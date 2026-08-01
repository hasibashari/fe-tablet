# Panduan Desain (Design Guidelines) - FE Tablet

Dokumen ini menjadi acuan utama (Single Source of Truth) untuk *styling*, tipografi, hierarki warna, dan komponen UI di seluruh aplikasi, terutama mengambil referensi dari fitur Home/Landing Page yang sudah sesuai standar (Modern, Clean, Trustworthy).

Tujuan dokumen ini adalah agar fitur-fitur lain (seperti Admin Panel, Dashboard, dll) mengikuti gaya visual yang konsisten.

## 1. Palet Warna (Color System)

Warna aplikasi diatur secara global di `src/app/globals.css` menggunakan CSS variables (Tailwind V4 theme). Dilarang menggunakan *hardcoded hex color* (contoh: `#0ea5e9`), melainkan selalu gunakan class Tailwind yang merujuk pada *theme variables*.

### Primary Colors (Brand & Action)
- **Primary** (`bg-primary`, `text-primary`): `#0ea5e9` - Digunakan untuk tombol utama, ikon aktif, dan aksen *brand*.
- **Primary Active** (`bg-primary-active`): `#0284c7` - Digunakan untuk *state hover* pada tombol utama.

### Text & Typography (Ink & Body)
- **Ink** (`text-ink`): `#0f172a` (Slate 900) - Digunakan untuk Heading utama (`h1`, `h2`, `h3`) dan teks yang membutuhkan penekanan tinggi (High Emphasis).
- **Body** (`text-body`): `#334155` (Slate 700) - Digunakan untuk paragraf biasa, deskripsi, dan teks reguler (Medium Emphasis).
- **Muted** (`text-muted`, `text-muted-soft`): `#64748b`, `#94a3b8` - Digunakan untuk label tambahan, meta teks, *placeholder*, dan teks yang kurang krusial (Low Emphasis).

### Surface & Background
- **Canvas** (`bg-white` / `bg-canvas`): `#ffffff` - Latar belakang utama halaman.
- **Surface Soft** (`bg-surface-soft`): `#f8fafc` (Slate 50) - Latar belakang untuk *card*, panel sekunder, atau area *highlight* lembut.
- **Hairline** (`border-hairline`): `#e2e8f0` (Slate 200) - Warna garis pembatas (*border*) pada tabel, *card*, dan pemisah konten.

### Dark Surface (Inverted/Dark Sections)
- **Surface Dark** (`bg-surface-dark`): `#1e293b`
- **Surface Dark Elevated** (`bg-surface-dark-elevated`): `#334155`

### Accent & Status
- **Teal / Success** (`text-accent-teal`): `#10b981` - Digunakan untuk badge "Certified", indikator sukses, atau *progress* positif.
- **Amber / Warning** (`text-accent-amber`): `#f59e0b` - Digunakan untuk peringatan.


## 2. Tipografi & Hierarki Teks (Typography Hierarchy)

Aplikasi menggunakan font keluarga **Inter** (`font-sans`).

| Level | Tailwind Classes | Penggunaan Utama |
| :--- | :--- | :--- |
| **Hero Title** | `text-4xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.1]` | Judul utama halaman (H1). Sangat besar, *bold*, dengan *letter-spacing* rapat. |
| **Section Title** | `text-3xl md:text-4xl font-bold text-ink mb-4` | Judul *section* atau grup utama (H2). |
| **Card Title** | `text-xl font-semibold text-ink mb-3` | Judul di dalam kotak (*Card*), modal, atau form (H3). |
| **Subtitle / Intro** | `text-lg lg:text-xl text-body leading-relaxed` | Teks pendukung di bawah judul besar. |
| **Body Text** | `text-base text-body leading-relaxed` | Paragraf reguler, isi artikel, deskripsi. |
| **Caption / Meta** | `text-sm text-muted font-medium` | Tag, tanggal, *helper text* di bawah form. |

**Aturan Emas Tipografi:** 
Selalu bedakan bobot (*weight*) dan warna antara Judul (Font Bold/Semibold + Warna Ink) dan Deskripsi (Font Normal + Warna Body/Muted) untuk menciptakan kontras hierarki yang jelas.


## 3. Komponen UI (UI Components)

### A. Tombol (Buttons)
- **Primary Button:** Tombol aksi utama pada layar.
  - Class: `bg-primary hover:bg-primary-active text-white rounded-full font-medium px-8 py-3.5 transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.23)] hover:-translate-y-0.5`
- **Secondary Button:** Tombol alternatif (Outlined/Ghost).
  - Class: `bg-white border border-hairline hover:border-muted-soft hover:bg-surface-soft text-ink rounded-full font-medium px-8 py-3.5 transition-all shadow-sm`

### B. Cards & Panels
- **Standard Card:** Kotak konten dengan border tipis dan latar belakang terang.
  - Class: `bg-white border border-hairline rounded-2xl p-6` (Gunakan `rounded-2xl` atau `rounded-3xl` untuk sudut membulat bergaya modern).
- **Soft Panel:** Kotak dengan latar belakang abu-abu sangat muda, sering digunakan untuk *image container* atau area statistik.
  - Class: `bg-surface-soft border border-hairline rounded-3xl`

### C. Badges & Chips
- Sering digunakan untuk status, label, atau kategori.
- Class: `inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-sm text-primary font-medium`

### D. Ikon (Icons)
- Gunakan *Lucide React* icons.
- **Ikon pada Card:** Letakkan ikon di dalam kontainer membulat agar lebih estetik.
  - Class (Light mode): `bg-primary/10 text-primary p-3 rounded-xl`
  - Class (Dark mode): `bg-white/5 text-primary p-4 rounded-xl`


## 4. Spacing & Layout

- **Pola Padding Section:** Gunakan `py-24` atau `py-32` untuk memberikan nafas (*breathing room*) yang luas antar bagian halaman (terutama *landing page*). Untuk dashboard internal (Admin), gunakan `p-6` atau `gap-6` untuk kepadatan informasi yang lebih tinggi namun tetap rapi.
- **Max Width Container:** Gunakan `container mx-auto px-6 max-w-7xl` untuk membungkus konten utama di tengah layar.


## 5. Implementasi Material UI vs Tailwind (Jika Menggunakan Keduanya)

Jika halaman Admin menggunakan Material UI (MUI), maka:
1. Pastikan *Theme Provider* di MUI diatur (*override*) warnanya menggunakan nilai Hex dari CSS variables (seperti `#0ea5e9` untuk primary dan `#0f172a` untuk text).
2. Hindari `sx={{ fontSize: "14px" }}` yang mem-bypass sistem tipografi. Gunakan varian tipografi standar (seperti `variant="h6"` atau `variant="body2"`) yang sudah di-custom di MUI Theme agar sejalan dengan hirarki font Inter pada Tailwind.
3. Sudut membulat pada komponen MUI (Card, Button, Dialog) harus diubah melalui *theme defaultProps/styleOverrides* menjadi `borderRadius: 12` (atau sesuai konteks, namun **jangan terlalu besar** seperti 16px+ untuk tabel/dashboard agar tidak terkesan *bulky*) agar sejalan dengan desain *Home* yang memiliki border-radius halus namun tetap proporsional.
4. **Komponen Reusable (Tabel, dll):** Pastikan struktur UI yang berulang, terutama Data Table, dibuat sebagai *reusable component* (komponen terpisah yang bisa digunakan bersama) untuk menghindari duplikasi kode dan menjaga konsistensi.
5. **Layout & Pencegahan Horizontal Scroll:** Ukuran *sidebar* dan *content* tidak boleh menyebabkan *scroll* horizontal pada keseluruhan halaman (body). Jika konten tabel melebar, bungkus tabel dengan `overflowX: auto` pada kontainernya saja, dan pastikan flex container menggunakan `minWidth: 0` agar tata letak tetap konsisten dan tidak "bocor" (break layout) antar halaman.
