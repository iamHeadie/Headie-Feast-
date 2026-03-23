-- Add phone column to profiles table.
-- This codifies the column that was added manually via the Supabase dashboard.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;
