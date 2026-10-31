-- Ensure each new Supabase Auth user has a matching public profile.
-- Uses a fixed empty search_path and fully qualified object names.
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  profile_name text;
BEGIN
  profile_name := COALESCE(
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'display_name'), ''),
    NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(BTRIM(SPLIT_PART(COALESCE(NEW.email, ''), '@', 1)), ''),
    'Usuário'
  );

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, LEFT(profile_name, 100))
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.handle_new_user_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

INSERT INTO public.profiles (id, display_name)
SELECT
  u.id,
  LEFT(
    COALESCE(
      NULLIF(BTRIM(u.raw_user_meta_data ->> 'display_name'), ''),
      NULLIF(BTRIM(u.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(BTRIM(SPLIT_PART(COALESCE(u.email, ''), '@', 1)), ''),
      'Usuário'
    ),
    100
  )
FROM auth.users AS u
ON CONFLICT (id) DO NOTHING;
