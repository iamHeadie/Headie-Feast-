-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Auto-create a profile row when a new user signs up via Supabase Auth.
--    This ensures every auth.users row has a matching profiles row, so the
--    profiles table count stays in sync with the true user count.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;   -- idempotent: skip if profile already exists
  RETURN NEW;
END;
$$;

-- Drop and re-create the trigger so this migration is idempotent
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Back-fill profiles for any existing auth users that don't have one yet.
--    This brings historical sign-ups (the ~22 existing users) into profiles.
-- ──────────────────────────────────────────────────────────────────────────────

INSERT INTO public.profiles (user_id, display_name, avatar_url, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  NOW(),
  NOW()
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = au.id
);

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. RPC: get_total_user_count
--    Returns the exact number of rows in auth.users.
--    The admin dashboard calls this so Total Community reflects every sign-up,
--    even before the trigger back-fill runs or in edge-case timing gaps.
-- ──────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_total_user_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT COUNT(*) FROM auth.users;
$$;

-- Allow any authenticated user to call it (the admin dashboard uses the
-- publishable/service key; restrict further with RLS or a policy if needed).
GRANT EXECUTE ON FUNCTION public.get_total_user_count() TO authenticated, anon;
