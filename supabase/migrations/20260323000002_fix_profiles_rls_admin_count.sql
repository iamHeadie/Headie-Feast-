-- ──────────────────────────────────────────────────────────────────────────────
-- Fix Admin Dashboard "0 Users" issue
--
-- Root cause: RLS on the profiles table blocks anonymous/authenticated reads
-- when the anon key is used for counting. The dashboard needs:
--   1. A SECURITY DEFINER RPC to count all profiles rows (bypasses RLS).
--   2. An RLS policy so that admin users can SELECT all profiles rows
--      (needed for the pending-riders and active-riders counts too).
-- ──────────────────────────────────────────────────────────────────────────────

-- 1. SECURITY DEFINER count function (Total Community fallback)
--    Bypasses RLS completely — always returns the true row count.
CREATE OR REPLACE FUNCTION public.get_profiles_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COUNT(*) FROM public.profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_profiles_count() TO authenticated, anon;

-- 2. Enable RLS on profiles (idempotent — safe to run if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: users can always read their OWN profile row
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Policy: admin users can read ALL profile rows
--    (required for pending-rider and active-rider counts in the dashboard)
DROP POLICY IF EXISTS "profiles_select_admin_all" ON public.profiles;
CREATE POLICY "profiles_select_admin_all"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
        AND p.is_admin = true
    )
  );
