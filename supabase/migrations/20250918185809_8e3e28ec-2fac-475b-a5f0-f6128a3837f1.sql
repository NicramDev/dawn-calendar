-- Remove RLS policies from user_settings table
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can create their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

-- Disable RLS on user_settings table
ALTER TABLE public.user_settings DISABLE ROW LEVEL SECURITY;

-- Add session_id column to replace user_id
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Make user_id nullable since we'll use session_id instead
ALTER TABLE public.user_settings ALTER COLUMN user_id DROP NOT NULL;