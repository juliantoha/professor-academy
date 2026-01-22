-- Create professor_follows table for tracking which professors follow which apprentices
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS professor_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_email TEXT NOT NULL,
  apprentice_id TEXT NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a professor can only follow an apprentice once
  UNIQUE(professor_email, apprentice_id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_professor_follows_professor ON professor_follows(professor_email);
CREATE INDEX IF NOT EXISTS idx_professor_follows_apprentice ON professor_follows(apprentice_id);

-- Enable Row Level Security
ALTER TABLE professor_follows ENABLE ROW LEVEL SECURITY;

-- Policy: Professors can see their own follows
CREATE POLICY "Professors can view their own follows"
  ON professor_follows
  FOR SELECT
  USING (auth.jwt() ->> 'email' = professor_email);

-- Policy: Professors can insert their own follows
CREATE POLICY "Professors can create their own follows"
  ON professor_follows
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = professor_email);

-- Policy: Professors can delete their own follows
CREATE POLICY "Professors can delete their own follows"
  ON professor_follows
  FOR DELETE
  USING (auth.jwt() ->> 'email' = professor_email);
