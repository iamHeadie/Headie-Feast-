-- Add vehicle_type column to profiles for rider delivery method
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS vehicle_type text;
