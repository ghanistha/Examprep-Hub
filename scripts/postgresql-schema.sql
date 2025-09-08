-- PostgreSQL schema for ExamPrep Hub

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    exam_interest TEXT CHECK(exam_interest IN ('upsc', 'mpsc', 'ssc')),
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    exam_type TEXT CHECK(exam_type IN ('prelims', 'mains', 'interview', 'combined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    duration INTEGER, -- in minutes
    category TEXT,
    views INTEGER DEFAULT 0,
    exam_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Papers table
CREATE TABLE IF NOT EXISTS papers (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    year INTEGER,
    paper_type TEXT CHECK(paper_type IN ('prelims', 'mains', 'interview')),
    file_path TEXT,
    file_size INTEGER,
    download_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    exam_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    event_name TEXT NOT NULL,
    event_type TEXT CHECK(event_type IN ('notification', 'exam', 'result', 'interview')),
    start_date DATE,
    end_date DATE,
    description TEXT,
    exam_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    video_id INTEGER,
    paper_id INTEGER,
    progress_type TEXT,
    progress_percentage REAL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (video_id) REFERENCES videos(id),
    FOREIGN KEY (paper_id) REFERENCES papers(id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    video_id INTEGER,
    paper_id INTEGER,
    bookmark_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (video_id) REFERENCES videos(id),
    FOREIGN KEY (paper_id) REFERENCES papers(id)
);

-- Insert sample exams
INSERT INTO exams (name, code, description, exam_type) VALUES
('UPSC Civil Services Examination', 'UPSC_CSE', 'Union Public Service Commission Civil Services Examination', 'combined'),
('MPSC State Services', 'MPSC_SS', 'Maharashtra Public Service Commission State Services', 'combined'),
('SSC Combined Graduate Level', 'SSC_CGL', 'Staff Selection Commission Combined Graduate Level', 'combined')
ON CONFLICT (code) DO NOTHING;

-- Insert sample papers
INSERT INTO papers (title, description, year, paper_type, file_path, file_size, exam_id) VALUES
('UPSC Prelims 2023 Paper 1', 'General Studies Paper 1 - UPSC Civil Services Preliminary Examination 2023', 2023, 'prelims', '/uploads/papers/upsc 2023.pdf', 6947922, 1),
('MPSC Mains 2023 General Studies', 'General Studies Paper - MPSC State Services Mains 2023', 2023, 'mains', '/uploads/papers/mpsc paper.pdf', 2048000, 2),
('SSC CGL 2023 Tier 1', 'Combined Graduate Level Tier 1 Examination 2023', 2023, 'prelims', '/uploads/papers/ssc cgl paper.pdf', 1536000, 3)
ON CONFLICT DO NOTHING;


