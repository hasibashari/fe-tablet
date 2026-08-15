-- ============================================================
-- POSTGRESQL SCHEMA FOR TABLET HEALTHCARE APP
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK(role IN ('admin', 'patient')),
    phone VARCHAR(50),
    avatar TEXT,
    title VARCHAR(255),
    age INTEGER,
    gender VARCHAR(50) CHECK(gender IN ('Laki-laki', 'Perempuan')),
    date_of_birth VARCHAR(50),
    blood_type VARCHAR(20),
    height DOUBLE PRECISION,
    weight DOUBLE PRECISION,
    assigned_doctor_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. PATIENT PROFILES
CREATE TABLE IF NOT EXISTS patient_profiles (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    risk_level VARCHAR(50) NOT NULL DEFAULT 'Rendah' CHECK(risk_level IN ('Tinggi', 'Sedang', 'Rendah')),
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Nonaktif')),
    medical_notes TEXT,
    last_reminder_sent VARCHAR(255),
    last_active VARCHAR(255),
    join_date VARCHAR(50) NOT NULL DEFAULT CURRENT_DATE::text
);

-- 3. PRODUCTS (INVENTORY)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK(category IN ('Obat Resep', 'Obat Bebas', 'Suplemen', 'Alat Kesehatan')),
    sku VARCHAR(100) NOT NULL UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    price DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL CHECK(status IN ('Tersedia', 'Stok Menipis', 'Habis')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. MEDICATION SCHEDULES & TIME SLOTS
CREATE TABLE IF NOT EXISTS medication_schedules (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK(status IN ('Aktif', 'Selesai', 'Diberhentikan')),
    category VARCHAR(100) NOT NULL CHECK(category IN ('Obat Resep', 'Suplemen', 'Aktivitas Medis')),
    instructions TEXT,
    last_reminder_sent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_time_slots (
    id SERIAL PRIMARY KEY,
    schedule_id VARCHAR(255) NOT NULL REFERENCES medication_schedules(id) ON DELETE CASCADE,
    time VARCHAR(50) NOT NULL
);

-- 5. REMINDERS & CONSUMPTION LOGS
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id VARCHAR(255) REFERENCES medication_schedules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'COMPLETED', 'MISSED')),
    type VARCHAR(50) NOT NULL CHECK(type IN ('MEDICATION', 'CHECKUP', 'EXERCISE', 'OTHER')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consumption_logs (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reminder_id VARCHAR(255) REFERENCES reminders(id) ON DELETE SET NULL,
    schedule_id VARCHAR(255) REFERENCES medication_schedules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK(category IN ('MEDICATION', 'CHECKUP', 'EXERCISE', 'OTHER')),
    dosage VARCHAR(100),
    scheduled_date VARCHAR(50) NOT NULL,
    scheduled_time VARCHAR(50) NOT NULL,
    taken_at VARCHAR(50),
    status VARCHAR(50) NOT NULL CHECK(status IN ('ON_TIME', 'LATE', 'MISSED', 'SKIPPED')),
    notes TEXT,
    taken_by VARCHAR(100) NOT NULL DEFAULT 'Self',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ARTICLES & SECTIONS
CREATE TABLE IF NOT EXISTS articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    lead_paragraph TEXT,
    image_url TEXT NOT NULL,
    image_caption TEXT,
    read_time VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Terbit' CHECK(status IN ('Terbit', 'Draf')),
    views INTEGER NOT NULL DEFAULT 0,
    published_at VARCHAR(50) NOT NULL,
    author_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    author_role VARCHAR(255),
    author_avatar TEXT,
    author_bio TEXT,
    key_takeaways TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS article_sections (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 1,
    heading VARCHAR(255),
    subheading VARCHAR(255),
    paragraphs TEXT NOT NULL,
    callout_type VARCHAR(50) CHECK(callout_type IN ('tip', 'quote', 'warning')),
    callout_title VARCHAR(255),
    callout_text TEXT,
    bullet_points TEXT
);

CREATE TABLE IF NOT EXISTS user_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- 7. HEALTH PROGRAMS
CREATE TABLE IF NOT EXISTS health_programs (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    duration_weeks INTEGER NOT NULL DEFAULT 4,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Draf', 'Arsip')),
    target_category VARCHAR(100) NOT NULL,
    created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_program_enrollments (
    id SERIAL PRIMARY KEY,
    program_id VARCHAR(255) NOT NULL REFERENCES health_programs(id) ON DELETE CASCADE,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at VARCHAR(50) NOT NULL DEFAULT CURRENT_DATE::text,
    progress_percentage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Selesai', 'Berhenti')),
    UNIQUE(program_id, patient_id)
);

-- 8. ADMIN NUDGES (MANUAL REMINDERS)
CREATE TABLE IF NOT EXISTS admin_nudges (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(255) NOT NULL,
    schedule_id VARCHAR(255) REFERENCES medication_schedules(id) ON DELETE SET NULL,
    medication_name VARCHAR(255),
    dosage VARCHAR(100),
    time_slot VARCHAR(50),
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'app' CHECK(channel IN ('app', 'whatsapp')),
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD' CHECK(status IN ('UNREAD', 'READ', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX IF NOT EXISTS idx_nudges_patient_status ON admin_nudges(patient_id, status);
