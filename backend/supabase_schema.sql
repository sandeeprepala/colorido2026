-- COLORIDO '26 College Festival Database Schema for Supabase PostgreSQL
-- Cultural + Technical + Sports Festival

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    college TEXT,
    department TEXT,
    year TEXT,
    student_id TEXT,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Events Table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('technical', 'cultural', 'sports')),
    description TEXT NOT NULL,
    image_url TEXT,
    venue TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    registration_deadline DATE NOT NULL,
    max_participants INTEGER DEFAULT 100,
    prize_pool TEXT,
    eligibility TEXT,
    rules TEXT,
    judging_criteria TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Event Rounds Table
CREATE TABLE IF NOT EXISTS event_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    round_order INTEGER NOT NULL,
    round_name TEXT NOT NULL,
    description TEXT,
    time TEXT
);

-- 4. Event Registrations Table
CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT,
    college TEXT,
    department TEXT,
    year TEXT,
    registration_id TEXT UNIQUE NOT NULL,
    qr_token TEXT UNIQUE NOT NULL,
    registration_data JSONB DEFAULT '{}',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'attended', 'cancelled')),
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Stalls Table
CREATE TABLE IF NOT EXISTS stalls (
    id TEXT PRIMARY KEY,
    stall_id TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('food', 'game')),
    name TEXT,
    section TEXT,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'occupied', 'unavailable')),
    applicant_name TEXT,
    applicant_email TEXT,
    item_name TEXT,
    description TEXT,
    price TEXT,
    rules TEXT,
    requirements TEXT,
    manager_count INTEGER DEFAULT 0
);

-- 6. Stall Applications Table
CREATE TABLE IF NOT EXISTS stall_applications (
    id TEXT PRIMARY KEY,
    stall_id TEXT REFERENCES stalls(stall_id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT NOT NULL,
    applicant_phone TEXT,
    college TEXT,
    type TEXT NOT NULL CHECK (type IN ('food', 'game')),
    item_name TEXT NOT NULL,
    description TEXT NOT NULL,
    price TEXT NOT NULL,
    rules TEXT,
    requirements TEXT,
    manager_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

-- 7. Leaderboards Table
CREATE TABLE IF NOT EXISTS leaderboards (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    sport_name TEXT NOT NULL,
    status TEXT DEFAULT 'UPCOMING' CHECK (status IN ('LIVE', 'UPCOMING', 'COMPLETED')),
    match_info TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Leaderboard Entries Table
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY,
    leaderboard_id TEXT REFERENCES leaderboards(id) ON DELETE CASCADE,
    team_name TEXT NOT NULL,
    participant_name TEXT,
    score TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    rank INTEGER DEFAULT 1,
    form TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Discussion Messages Table
CREATE TABLE IF NOT EXISTS discussion_messages (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role TEXT DEFAULT 'student',
    user_dept TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    certificate_id TEXT UNIQUE NOT NULL,
    registration_id TEXT REFERENCES event_registrations(id) ON DELETE SET NULL,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    event_name TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    participant_email TEXT NOT NULL,
    achievement TEXT NOT NULL,
    issued_date DATE NOT NULL,
    organizer_signature TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    event_id TEXT,
    event_name TEXT,
    subject TEXT NOT NULL,
    body TEXT,
    type TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'delivered'
);
