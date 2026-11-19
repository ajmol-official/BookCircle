-- =========================================================================
-- BookCircle: Purge placeholder stock avatars from user profiles
-- =========================================================================

-- 1. Clear placeholder female avatar from existing real profiles
UPDATE public.profiles
SET avatar_url = NULL
WHERE avatar_url LIKE '%photo-1534528741775-53994a69daeb%'
   OR avatar_url LIKE '%photo-1535713875002-d1d0cf377fde%';

-- 2. Clear placeholder female avatar from books table if any
UPDATE public.books
SET owner_avatar = NULL
WHERE owner_avatar LIKE '%photo-1534528741775-53994a69daeb%'
   OR owner_avatar LIKE '%photo-1535713875002-d1d0cf377fde%';

-- 3. Ensure handle_new_user trigger defaults to NULL (initials badge)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    location,
    member_since
  )
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL),
    'Nearby Neighborhood',
    to_char(now(), 'Month YYYY')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
