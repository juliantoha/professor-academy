-- Add graduation columns to apprentices table
-- Run this in your Supabase SQL Editor

-- Add graduated boolean column (default false for existing records)
ALTER TABLE apprentices
ADD COLUMN IF NOT EXISTS graduated BOOLEAN DEFAULT FALSE;

-- Add graduatedAt timestamp column
ALTER TABLE apprentices
ADD COLUMN IF NOT EXISTS "graduatedAt" TIMESTAMP WITH TIME ZONE;

-- Add graduation_token for shareable celebration links
ALTER TABLE apprentices
ADD COLUMN IF NOT EXISTS graduation_token TEXT UNIQUE;

-- Create index for efficient queries on graduation status
CREATE INDEX IF NOT EXISTS idx_apprentices_graduated ON apprentices(graduated);

-- Create index for graduation token lookups
CREATE INDEX IF NOT EXISTS idx_apprentices_graduation_token ON apprentices(graduation_token);

-- Update RLS policy to allow professors to update graduation status
-- (Assuming you already have update policies, this adds clarity)
-- Professors can update their own apprentices' graduation status
DO $$
BEGIN
  -- Drop existing update policy if it exists
  DROP POLICY IF EXISTS "Professors can update their apprentices graduation" ON apprentices;

  -- Create new update policy for graduation
  CREATE POLICY "Professors can update their apprentices graduation"
    ON apprentices
    FOR UPDATE
    USING (
      auth.jwt() ->> 'email' = "professorEmail"
    )
    WITH CHECK (
      auth.jwt() ->> 'email' = "professorEmail"
    );
EXCEPTION
  WHEN duplicate_object THEN
    NULL; -- Policy already exists, ignore
END $$;
