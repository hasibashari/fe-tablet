# Design System: Fe-Tablet (Health & Blood Supplement Tracker)

## 1. Visual Theme & Atmosphere

Fe-Tablet is a specialized mobile-first application designed for **iron & blood supplement (TTD - Tablet Tambah Darah) reminder, habit tracking, and anemia prevention**, tailored primarily for adolescent girls and young women. 

Rather than adopting a sterile, cold, or intimidating clinical aesthetic, Fe-Tablet radiates **warmth, encouragement, and youthful vitality**. The interface sits on a gentle, soft blush canvas (`#fff5f7`) that immediately feels approachable, hygienic, and comforting. The primary brand accent is an energetic **Raspberry Rose** (`#e11d48`), complemented by soft pink tinted cards, crisp white interactive surfaces, and vibrant semantic indicators (Emerald Green for recorded doses, Rose Red for missed doses, and Warm Amber for pending reminders).

The UI is intentionally **soft, rounded, and card-based**. Generous border radiuses (`16px–20px` for cards, `9999px` full-pills for action buttons and chips) combined with tactile touch targets ensure an ergonomic, single-thumb mobile experience. Information hierarchy is structured around prominent **Hero Reminder Cards**, clear **Daily Status Badges**, and a persistent **5-Tab Bottom Navigation Bar**.

**Key Characteristics:**
- **Soft Blush Canvas** (`#fff5f7`): Non-glare, friendly, comforting background replacing harsh clinical whites.
- **Raspberry Rose Identity** (`#e11d48` / `#be123c`): Vibrant primary brand accent for CTAs, active states, and streak highlights.
- **Card-Centric Structure**: All core data (Reminders, Monitoring, Articles, Buddy Feed) lives in contained white cards with delicate pink borders (`#fce7f3`).
- **Triple-State Health Feedback**: Clear semantic system — 🟢 Recorded / Tercatat (`#10b981`), 🔴 Missed / Terlewat (`#f43f5e`), ⚪ Pending / Belum Dicatat (`#f59e0b`).
- **Full-Pill & Rounded Geometry**: `9999px` pill buttons, rounded input fields (`12px`), and curved container cards (`16px–20px`).
- **Thumb-Friendly Ergonomics**: 44px+ touch targets, bottom sheets for forms, and a fixed 5-tab Bottom Navigation bar.
- **UI-First & Data-Driven**: Decoupled UI components powered by realistic dummy data structures for rapid visual validation.

---

## 2. Color Palette & Roles

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FE-TABLET COLOR PALETTE                           │
├──────────────────────┬──────────────────────┬───────────────────────────┤
│ Token Role           │ Value / Hex Code     │ Purpose & Usage           │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Primary / Rose       │ #e11d48              │ Primary CTAs, active tabs │
│ Primary Hover / Dark │ #be123c              │ Pressed / hover states    │
│ Primary Light / Tint │ #ffe4e6              │ Pill badges, chip active  │
│ Primary Subtle       │ #fff1f2              │ Hero card background wash │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Background / Canvas  │ #fff5f7              │ Main application canvas   │
│ Surface / Card       │ #ffffff              │ Cards, modals, sheets     │
│ Surface Alt / Blush  │ #fdf2f4              │ Group containers, nudges  │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Text Primary / Ink   │ #1e293b              │ Headings, card titles     │
│ Text Secondary       │ #475569              │ Subtitles, descriptions   │
│ Text Muted           │ #94a3b8              │ Timestamps, placeholders  │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Success (Recorded)   │ #10b981 (bg:#ecfdf5) │ Status: Sudah Minum TTD   │
│ Warning (Missed)     │ #f43f5e (bg:#fff1f2) │ Status: Terlewat          │
│ Pending (Unrecorded) │ #f59e0b (bg:#fef3c7) │ Status: Belum Dicatat     │
├──────────────────────┼──────────────────────┼───────────────────────────┤
│ Border Default       │ #fce7f3              │ Card borders, dividers    │
│ Border Subtle        │ #f1f5f9              │ Inner element separators  │
│ Ring Focus           │ rgba(225, 29, 72, 0.35) Tailwind focus outline    │
└──────────────────────┴──────────────────────┴───────────────────────────┘
```

### 2.1 Primary Palette
- **Raspberry Rose (`#e11d48`)**: The dominant brand color. Used for primary CTA buttons, selected bottom navigation icons, key reminder highlights, and streak badges.
- **Rose Dark (`#be123c`)**: Used for active press states, dark contrast text on pink pills, and focused icons.
- **Rose Light (`#ffe4e6`)**: Background for active category chips, icon container circles, and subtle notification badges.
- **Rose Subtle (`#fff1f2`)**: Gradient start for the Hero Next Reminder card and promotional health nudges.

### 2.2 Surface & Canvas
- **Blush Canvas (`#fff5f7`)**: The global page background. Warm, non-clinical, reducing visual fatigue.
- **Pure White Surface (`#ffffff`)**: Interactive cards, bottom sheet modals, input fields, and bottom navigation bar.
- **Blush Surface Alt (`#fdf2f4`)**: Secondary card backgrounds and inactive tab containers.

### 2.3 Semantic & Status Palette
- **Recorded / Success** (`#10b981` text, `#ecfdf5` background, `#a7f3d0` border): Tablet successfully taken on schedule.
- **Missed / Warning** (`#f43f5e` text, `#fff1f2` background, `#fecdd3` border): Dosage missed or skipped.
- **Pending / Action Required** (`#f59e0b` text, `#fef3c7` background, `#fde68a` border): Today's dose waiting for user confirmation.

---

## 3. Typography Rules

### 3.1 Font Family
- **Primary Sans-Serif**: `Inter`, `Plus Jakarta Sans`, or `Outfit` with fallbacks: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Characteristics**: Rounded apertures, high x-height for mobile screen clarity, distinct numeric characters for scheduled hours (`08:00 WIB`) and dates.

### 3.2 Hierarchy Table

| Role | Size | Weight | Line Height | Letter Spacing | Usage Notes |
|---|---|---|---|---|---|
| **Display Hero** | 28px (1.75rem) | 700 (Bold) | 1.20 | -0.02em | Splash headline, Onboarding titles |
| **Heading 1** | 22px (1.375rem) | 700 (Bold) | 1.25 | -0.01em | Top page titles (Login, Register, Profil) |
| **Heading 2** | 18px (1.125rem) | 600 (SemiBold) | 1.30 | normal | Section titles (Status Hari Ini, Menu Cepat) |
| **Card Title** | 15px (0.938rem) | 600 (SemiBold) | 1.35 | normal | Schedule title, Article titles, Buddy names |
| **Body Large** | 16px (1.00rem) | 400 / 500 | 1.50 | normal | Next reminder date, AI chat message bubbles |
| **Body Standard** | 14px (0.875rem) | 400 (Regular) | 1.50 | normal | Description text, form inputs, articles |
| **Button Label** | 14px (0.875rem) | 600 (SemiBold) | 1.25 | normal | Primary button CTAs, action triggers |
| **Button Small** | 12px (0.75rem) | 600 (SemiBold) | 1.25 | normal | Compact action buttons (e.g. "Catat", "Kirim Semangat") |
| **Caption / Subtitle**| 12px (0.75rem) | 400 / 500 | 1.40 | normal | Timestamps, dosage metadata ("1 tablet, 1x seminggu") |
| **Micro Tag** | 11px (0.688rem) | 700 (Bold) | 1.20 | +0.02em | Status pills ("TERCATAT", "TERLEWAT", "🔥 6 STREAK") |

---

## 4. Component Stylings

### 4.1 Buttons

**Primary Action Button (`PrimaryRose`)**
- Background: `#e11d48` (Hover/Active: `#be123c`)
- Text: `#ffffff` (font-semibold, 14px)
- Padding: `12px 20px` (or full width `w-full`)
- Radius: `12px` (standard) or `9999px` (pill variant)
- Shadow: `0 4px 14px -2px rgba(225, 29, 72, 0.35)`
- Use: "Masuk", "Daftar", "Simpan Jadwal", "Mulai Konsultasi AI"

**Secondary / Outline Button**
- Background: `transparent` (Hover: `#fff1f2`)
- Text: `#e11d48` (font-semibold, 14px)
- Border: `1.5px solid #fce7f3` (Focus/Hover: `#e11d48`)
- Radius: `12px` or `9999px`
- Use: "Ubah Jadwal", "Lihat Riwayat Lengkap", "Batal"

**Soft Tint Button**
- Background: `#ffe4e6` (Hover: `#fecdd3`)
- Text: `#be123c` (font-semibold, 13px)
- Padding: `8px 16px`
- Radius: `9999px` (full pill)
- Use: "👏 Kirim Semangat", "Catat Sekarang", "Baca Selengkapnya"

**Status Action Buttons (Confirmation Dual Pills)**
- Taken (`Sudah Minum`): bg `#10b981`, text white, icon `Check`, radius `9999px`.
- Missed (`Belum / Terlewat`): bg `#fff1f2`, text `#f43f5e`, border `1px solid #fecdd3`, radius `9999px`.

---

### 4.2 Cards & Containers

**Hero Next Reminder Card (`ReminderCard.tsx`)**
- Background: `linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)`
- Border: `1.5px solid #fecdd3`
- Radius: `20px`
- Padding: `20px`
- Shadow: `0 10px 25px -5px rgba(225, 29, 72, 0.12)`
- Elements:
  - Header Tag: *"Pengingat TTD Berikutnya"* with capsule pill icon 💊.
  - Large Highlight: **Sabtu, 10 Oktober 2026 • 08:00 WIB**.
  - Subtitle: `1 tablet, 1x seminggu (setelah makan)`.
  - Floating status countdown pill: *"Tinggal 2 hari lagi"*.

**Standard Content Card (`Card.tsx`)**
- Background: `#ffffff`
- Border: `1px solid #fce7f3`
- Radius: `16px`
- Padding: `16px`
- Shadow: `0 2px 10px rgba(225, 29, 72, 0.04)`

**Buddy Streak Card (`BuddyCard.tsx`)**
- Header: Dual avatar display (User ── `🔥 6 🔥` ── Buddy) with pulsing flame glow.
- Body: Weekly sync status (Both completed / Waiting for buddy).
- CTA: Soft tint button *"Kirim Semangat"*.

**Consumption Chart Container (`ConsumptionChart.tsx`)**
- Card containing 6-month vertical bar visualization (Mei, Jun, Jul, Agu, Sep, Okt).
- Bars: `#e11d48` with rounded top corners (`rounded-t-lg`).
- Target baseline line at 4x/month (`border-dashed border-rose-300`).
- Summary metrics beneath: Total Konsumsi (`4 kali`) & Rata-rata (`3.8 kali/bln`).

---

### 4.3 Inputs & Forms

**Text & Password Input (`Input.tsx`)**
- Background: `#ffffff`
- Text: `#1e293b` (placeholder: `#94a3b8`)
- Border: `1.5px solid #fce7f3`
- Radius: `12px`
- Padding: `12px 16px`
- Focus State: Border color `#e11d48`, ring `3px rgba(225, 29, 72, 0.15)`
- Error State: Border color `#f43f5e`, helper text in red with alert icon.

**Category Filter Chips (`Chip.tsx`)**
- Inactive: bg `#ffffff`, text `#64748b`, border `1px solid #fce7f3`, radius `9999px`.
- Active: bg `#e11d48`, text `#ffffff`, border `1px solid #e11d48`, shadow soft.

---

### 4.4 Navigation & App Shell

**Mobile Top Bar (`ScreenHeader.tsx`)**
- Height: `56px`
- Sticky top with `backdrop-blur-md bg-white/90` or `#fff5f7`.
- Left: User greeting avatar + *"Hai, Sarah! 🌸"*.
- Right: Notification Bell button with unread red dot + Profile avatar icon.

**Mobile Bottom Navigation Bar (`BottomNavigation.tsx`)**
- Fixed bottom, `z-index: 50`.
- Height: `64px` + `padding-bottom: env(safe-area-inset-bottom)`.
- Background: `#ffffff` with top border `1px solid #fce7f3`.
- Shadow: `0 -4px 16px rgba(225, 29, 72, 0.06)`.
- 5 Navigation Items:
  1. **Beranda** (`/user/dashboard`) — Icon: `Home`
  2. **Monitoring** (`/user/history`) — Icon: `CalendarCheck`
  3. **Edukasi** (`/user/education`) — Icon: `BookOpen`
  4. **Buddy** (`/user/buddy`) — Icon: `Flame`
  5. **Konsultasi** (`/user/consultation`) — Icon: `Bot`
- Active State: Filled icon in `#e11d48`, small rose dot or soft pill background, label text in `#e11d48` font-semibold.

---

## 5. Layout Principles

### 5.1 Spacing System
- Base Grid: `4px / 8px`
- Increments: `4px`, `8px`, `12px`, `16px`, `20px`, `24px`, `32px`, `40px`, `48px`.
- Screen Padding: `px-4 sm:px-6` (16px to 24px horizontal gutters).
- Vertical Card Gaps: `space-y-4` (16px between section cards).

### 5.2 Container & Viewport
- **Mobile-First Width**: `max-w-md mx-auto` (bounded at `448px` max-width for tablet/desktop centering to maintain native mobile app feel).
- **Safe Scroll Area**: Page container (`<main>`) includes `pb-28` (112px bottom padding) to ensure content is never obscured by the fixed bottom navigation bar.

### 5.3 Border Radius Scale
- `rounded-lg` (8px): Inner badges, article thumbnails.
- `rounded-xl` (12px): Form inputs, dropdown selectors, secondary buttons.
- `rounded-2xl` (16px–20px): Content cards, hero reminder card, modal sheets.
- `rounded-full` (9999px): Action pills, filter chips, avatar circles, icon buttons.

---

## 6. Depth & Elevation

| Level | Treatment | Use Case |
|---|---|---|
| **Level 0 (Canvas)** | Flat `#fff5f7` without shadow | Page background |
| **Level 1 (Card Border)** | `#ffffff` surface + `1px solid #fce7f3` + `0 2px 8px rgba(225, 29, 72, 0.04)` | Content cards, quick menu items |
| **Level 2 (Hero Elevation)**| Gradient surface + `0 10px 25px -5px rgba(225, 29, 72, 0.12)` | Next Reminder Hero card, CTA buttons |
| **Level 3 (Nav & Floating)**| `0 -4px 16px rgba(225, 29, 72, 0.08)` | Fixed Bottom Navigation bar, floating toast |
| **Level 4 (Modal & Sheet)** | `0 20px 40px -10px rgba(0, 0, 0, 0.2)` + Backdrop blur overlay | Schedule editor modal, logout confirmation |

---

## 7. Do's and Don'ts

### Do
- Use the centralized Rose token palette (`#e11d48`, `#fff5f7`, `#fce7f3`) across all components.
- Make the **Next Reminder Card** the most prominent visual element on the Home screen.
- Maintain soft, friendly radiuses (`rounded-2xl` for cards, `rounded-full` for action pills).
- Provide immediate, tactile feedback for the 3 consumption states (Recorded, Missed, Pending).
- Ensure all interactive elements have minimum 44px × 44px tap targets for mobile usability.
- Use data-driven mock feeds for all screens (articles, buddy streak, consultation topics).
- Include `pb-28` safe area padding on all screens with bottom navigation.

### Don't
- Don't use cold clinical grays, sterile blue palettes, or harsh `#000000` borders.
- Don't use square `0px` radius containers — everything should feel soft and welcoming.
- Don't use arbitrary hardcoded hex codes directly inside page components.
- Don't place the Profile menu inside the 5-tab Bottom Navigation (keep Profile in the Top Bar).
- Don't use native browser `alert()` popups; use stylized dialogs and bottom sheets.
- Don't build complex backend API bindings before the dummy UI interactions are verified.

---

## 8. Responsive Behavior

| Breakpoint | Viewport Width | Layout Adaptation |
|---|---|---|
| **Mobile Portrait** | `< 480px` | 100% fluid width, single-column stacked cards, fixed bottom navigation. |
| **Tablet / Foldable** | `480px – 768px` | Centered app shell (`max-w-md`), elevated card container with subtle shadow. |
| **Desktop Preview** | `> 768px` | Centered mobile frame (`max-w-md`), simulating mobile viewport cleanly. |

---

## 9. Agent Prompt Guide (Copy-Paste Component Blueprints)

### 9.1 Quick Color Reference for Prompts
- Primary CTA: Rose Red (`#e11d48`)
- Canvas Background: Soft Blush (`#fff5f7`)
- Card Surface: White (`#ffffff`) with border (`#fce7f3`)
- Status Success: Emerald Green (`#10b981` bg: `#ecfdf5`)
- Status Missed: Rose Pink (`#f43f5e` bg: `#fff1f2`)
- Status Pending: Amber Gold (`#f59e0b` bg: `#fef3c7`)

---

### 9.2 Example Component Prompts

#### Prompt 1: Hero Next Reminder Card
```text
"Build a Hero Reminder Card in React/Tailwind for Fe-Tablet.
Background: gradient from #fff1f2 to #ffe4e6 with 1.5px border #fecdd3 and rounded-2xl padding 20px.
Top header: Capsule icon pill 'Pengingat TTD Berikutnya' with badge 'Tinggal 2 hari lagi'.
Main title: 'Sabtu, 10 Oktober 2026' in 20px font-bold text-#1e293b, with sub-heading 'Pukul 08:00 WIB • 1 tablet, 1x seminggu'.
Bottom note: 'Minum setelah sarapan bersama air putih atau jus jeruk'.
Right decorative element: Soft floating capsule 💊 illustration."
```

#### Prompt 2: Daily Status & Confirmation Action Card
```text
"Create a Daily Status Card for Fe-Tablet.
Container: White surface (#ffffff), border 1px solid #fce7f3, radius 16px, padding 16px.
Badge at top: 'Belum Dicatat' in amber (#f59e0b) with soft yellow background (#fef3c7).
Title: 'Status Hari Ini' in 16px font-semibold text-#1e293b.
Description: 'Yuk, catat konsumsi TTD-mu hari ini untuk menjaga streak kesehatanmu!'.
Two action buttons:
1. Primary pill '✓ Sudah Minum' (bg-#10b981, text-white, rounded-full, px-5 py-2.5).
2. Secondary pill '✕ Terlewat' (bg-#fff1f2, text-#f43f5e, border 1px solid #fecdd3, rounded-full, px-4 py-2.5)."
```

#### Prompt 3: Monitoring 3-Tab View with Consumption Chart
```text
"Build a 3-tab Monitoring interface (Hari Ini | Mingguan | Bulanan) for Fe-Tablet.
Tab bar: Segmented control with rounded-full pill selector, active tab in #e11d48 with white text.
Under 'Bulanan' tab:
Display 'ConsumptionChart' component showing 6 monthly bars (Mei to Okt).
Each bar has height proportional to count (max 4), colored in #e11d48 with rounded-t-lg.
Target dashed horizontal line at 4x/month.
Below chart, show a 2-column stats grid:
Card 1: 'Total Konsumsi' -> '4 kali' (Bulan ini).
Card 2: 'Rata-rata Kepatuhan' -> '92%' (Kategori Sangat Baik)."
```

#### Prompt 4: Buddy Streak & Social Cheer Card
```text
"Design a Buddy Streak card for Fe-Tablet.
Surface: White card with 16px radius and soft pink border (#fce7f3).
Top Header: Central pulsing flame badge '🔥 6 Minggu Streak 🔥' bridging two avatar circles:
Left avatar 'Sarah (Kamu)', Right avatar 'Alya (Buddy)'.
Tagline: 'Hebat! Kalian berdua sudah konsisten 6 minggu berturut-turut!'.
Activity feed: List of 3 recent items (e.g. 'Alya mencatat konsumsi TTD ✓ 08:30 WIB').
Bottom Action: Full-width button '👏 Kirim Semangat ke Alya' (bg-#ffe4e6, text-#be123c, rounded-full)."
```

#### Prompt 5: AI Consultation Landing & Quick Prompt Chips
```text
"Build an AI Consultation Landing Screen for Fe-Tablet.
Banner Card: Friendly robot doctor illustration with title 'Asisten Fe-Tablet' and subtitle 'Siap menjawab seputar TTD, efek samping mual, dan anemia.'.
Primary Button: '💬 Mulai Chat Sekarang' (bg-#e11d48, text-white, full-width, rounded-xl).
Section: 'Topik Populer' with horizontal flex wrap chips (rounded-full, bg-white, border #fce7f3, text-sm):
- '🍋 Bolehkah minum TTD bersama air jeruk?'
- '🤢 Tips atasi mual setelah minum TTD'
- '🩸 Tanda-tanda 5L gejala anemia'
- '💊 Mengapa feses berwarna gelap?'
Clicking any chip launches the chat view pre-filled with that query."
```

#### Prompt 6: Mobile Bottom Navigation Bar
```text
"Create a fixed Mobile Bottom Navigation Bar with 5 items in React.
Position: fixed bottom-0 left-0 right-0, z-50, max-w-md mx-auto.
Height: 64px with env(safe-area-inset-bottom).
Surface: White (#ffffff), top border 1px solid #fce7f3, shadow 0 -4px 16px rgba(225,29,72,0.06).
5 Tabs:
1. Beranda (Home icon, path: /user/dashboard)
2. Monitoring (CalendarCheck icon, path: /user/history)
3. Edukasi (BookOpen icon, path: /user/education)
4. Buddy (Flame icon, path: /user/buddy)
5. Konsultasi (Bot icon, path: /user/consultation)
Active item displays filled icon in #e11d48 with font-semibold label and soft pink active dot indicator."
```

---

### 9.3 Iteration & Implementation Guide

1. **Tokens First**: Ensure CSS variables and Tailwind tokens match Section 2 before generating screens.
2. **Component Granularity**: Build UI primitives (`Button`, `Card`, `Badge`, `Chip`, `Input`) before combining them into domain cards (`ReminderCard`, `BuddyCard`, `ConsumptionChart`).
3. **Data-Driven Props**: Every screen must accept and render TypeScript mock interfaces defined in Section 7 of the PRD / Mock Store.
4. **State Transitions**: Test all 3 visual states (Pending → Recorded / Missed) on the UI with immediate visual updates.
5. **No Blind Overwrites**: Preserve existing route architectures and file directories while updating visual layers.
