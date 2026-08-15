-- ============================================================
-- NATIVE SQLITE SCHEMA FOR TABLET HEALTHCARE APP
-- ============================================================

PRAGMA foreign_keys = ON;

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK(role IN ('admin', 'patient')),
    phone TEXT,
    avatar TEXT,
    title TEXT,
    age INTEGER,
    gender TEXT CHECK(gender IN ('Laki-laki', 'Perempuan')),
    date_of_birth TEXT,
    blood_type TEXT,
    height REAL,
    weight REAL,
    assigned_doctor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    risk_level TEXT NOT NULL DEFAULT 'Rendah' CHECK(risk_level IN ('Tinggi', 'Sedang', 'Rendah')),
    status TEXT NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Nonaktif')),
    medical_notes TEXT,
    last_reminder_sent TEXT,
    last_active TEXT,
    join_date TEXT NOT NULL DEFAULT (date('now'))
);

-- 3. PRODUCTS (INVENTORY)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Obat Resep', 'Obat Bebas', 'Suplemen', 'Alat Kesehatan')),
    sku TEXT NOT NULL UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL CHECK(status IN ('Tersedia', 'Stok Menipis', 'Habis')),
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. MEDICATION SCHEDULES & TIME SLOTS
CREATE TABLE IF NOT EXISTS medication_schedules (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Aktif', 'Selesai', 'Diberhentikan')),
    category TEXT NOT NULL CHECK(category IN ('Obat Resep', 'Suplemen', 'Aktivitas Medis')),
    instructions TEXT,
    last_reminder_sent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_time_slots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schedule_id TEXT NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
    time TEXT NOT NULL
);

-- 5. REMINDERS & CONSUMPTION LOGS
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id TEXT REFERENCES medication_schedules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'COMPLETED', 'MISSED')),
    type TEXT NOT NULL CHECK(type IN ('MEDICATION', 'CHECKUP', 'EXERCISE', 'OTHER')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consumption_logs (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_id TEXT REFERENCES reminders(id) ON DELETE SET NULL,
    schedule_id TEXT REFERENCES medication_schedules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('MEDICATION', 'CHECKUP', 'EXERCISE', 'OTHER')),
    dosage TEXT,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    taken_at TEXT,
    status TEXT NOT NULL CHECK(status IN ('ON_TIME', 'LATE', 'MISSED', 'SKIPPED')),
    notes TEXT,
    taken_by TEXT NOT NULL DEFAULT 'Self',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ARTICLES & SECTIONS
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    lead_paragraph TEXT,
    image_url TEXT NOT NULL,
    image_caption TEXT,
    read_time TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Terbit' CHECK(status IN ('Terbit', 'Draf')),
    views INTEGER NOT NULL DEFAULT 0,
    published_at TEXT NOT NULL,
    author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    author_name TEXT,
    author_role TEXT,
    author_avatar TEXT,
    author_bio TEXT,
    key_takeaways TEXT, -- JSON string
    tags TEXT,          -- JSON string
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 1,
    heading TEXT,
    subheading TEXT,
    paragraphs TEXT NOT NULL, -- JSON string array
    callout_type TEXT CHECK(callout_type IN ('tip', 'quote', 'warning')),
    callout_title TEXT,
    callout_text TEXT,
    bullet_points TEXT        -- JSON string array
);

CREATE TABLE IF NOT EXISTS user_bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- 7. HEALTH PROGRAMS
CREATE TABLE IF NOT EXISTS health_programs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    status TEXT NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Draf', 'Arsip')),
    target_category TEXT NOT NULL,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_program_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id TEXT NOT NULL REFERENCES health_programs(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TEXT NOT NULL DEFAULT (date('now')),
    progress_percentage REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Selesai', 'Berhenti')),
    UNIQUE(program_id, patient_id)
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_schedules_patient ON medication_schedules(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_patient_date ON reminders(patient_id, date);
CREATE INDEX IF NOT EXISTS idx_logs_patient_date ON consumption_logs(patient_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_article_sections_art_order ON article_sections(article_id, order_index);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON user_bookmarks(user_id);
