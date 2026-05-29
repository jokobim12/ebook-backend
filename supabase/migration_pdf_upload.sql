-- Migration: Add PDF upload support
-- Run this in Supabase SQL Editor to add PDF ebook support

-- Add source_type column to ebooks table
ALTER TABLE ebooks 
ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'manual';

-- Add is_pdf_page column to ebook_pages table
ALTER TABLE ebook_pages 
ADD COLUMN IF NOT EXISTS is_pdf_page BOOLEAN DEFAULT false;

-- Add check constraint for source_type (only if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ebooks_source_type_check'
  ) THEN
    ALTER TABLE ebooks ADD CONSTRAINT ebooks_source_type_check 
    CHECK (source_type IN ('manual', 'pdf'));
  END IF;
END $$;
