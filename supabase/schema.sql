-- AuraBook Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ebooks table
CREATE TABLE ebooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cover_url TEXT DEFAULT '',
  category VARCHAR(100) DEFAULT '',
  synopsis TEXT DEFAULT '',
  rating DECIMAL(2,1) DEFAULT 5.0,
  views INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ebook pages table
CREATE TABLE ebook_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  chapter VARCHAR(255) DEFAULT '',
  content TEXT DEFAULT '',
  vertical_align VARCHAR(20) DEFAULT 'top',
  show_chapter_title BOOLEAN DEFAULT false,
  show_page_number BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banners table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  date VARCHAR(50) DEFAULT '',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ebook_id)
);

-- Reading history table
CREATE TABLE reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ebook_id UUID REFERENCES ebooks(id) ON DELETE CASCADE,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, ebook_id)
);

-- Indexes
CREATE INDEX idx_ebooks_author ON ebooks(author_id);
CREATE INDEX idx_ebooks_category ON ebooks(category);
CREATE INDEX idx_ebook_pages_ebook ON ebook_pages(ebook_id);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_reading_history_user ON reading_history(user_id);

-- Seed: Default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role, bio) VALUES
('Admin AuraBook', 'admin@aurabook.com', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9.iqHkQjS/sHo7pMBRzV.Kl2eC', 'admin', 'Administrator platform AuraBook.');

-- Seed: Default categories
INSERT INTO categories (name, "order") VALUES
('Pengembangan Diri', 1),
('Bisnis & Finansial', 2),
('Teknologi', 3),
('Fiksi', 4),
('Sastra', 5),
('Romantis', 6),
('Sedih', 7),
('Kata-Kata', 8);
