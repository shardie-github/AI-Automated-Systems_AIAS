-- ============================================================================
-- Content Studio Tokens for Admin Users
-- ============================================================================
-- Adds content_studio_token field to profiles table for admin users
-- This allows admin accounts to automatically access Content Studio
-- ============================================================================

-- Add content_studio_token column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS content_studio_token text UNIQUE;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_content_studio_token 
ON public.profiles(content_studio_token) 
WHERE content_studio_token IS NOT NULL;

-- Function to generate a secure random token
CREATE OR REPLACE FUNCTION public.generate_content_studio_token()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  token text;
BEGIN
  -- Generate a secure random token (32 bytes, base64 encoded = 44 chars)
  token := encode(gen_random_bytes(32), 'base64');
  -- Remove any special characters that might cause issues
  token := replace(replace(token, '/', '_'), '+', '-');
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE content_studio_token = token) LOOP
    token := encode(gen_random_bytes(32), 'base64');
    token := replace(replace(token, '/', '_'), '+', '-');
  END LOOP;
  RETURN token;
END;
$$;

-- Function to automatically generate token when admin role is assigned
CREATE OR REPLACE FUNCTION public.auto_generate_content_studio_token()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is being assigned admin role and doesn't have a token, generate one
  IF NEW.role = 'admin' THEN
    UPDATE public.profiles
    SET content_studio_token = public.generate_content_studio_token()
    WHERE id = NEW.user_id
      AND content_studio_token IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate token when admin role is assigned
DROP TRIGGER IF EXISTS trigger_auto_generate_content_studio_token ON public.user_roles;
CREATE TRIGGER trigger_auto_generate_content_studio_token
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
WHEN (NEW.role = 'admin')
EXECUTE FUNCTION public.auto_generate_content_studio_token();

-- Function to get or create token for admin user
CREATE OR REPLACE FUNCTION public.get_or_create_content_studio_token(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  token text;
  is_admin_user boolean;
BEGIN
  -- Check if user is admin
  SELECT public.is_admin(_user_id) INTO is_admin_user;
  
  IF NOT is_admin_user THEN
    RAISE EXCEPTION 'User is not an admin';
  END IF;
  
  -- Get existing token or generate new one
  SELECT content_studio_token INTO token
  FROM public.profiles
  WHERE id = _user_id;
  
  IF token IS NULL THEN
    token := public.generate_content_studio_token();
    UPDATE public.profiles
    SET content_studio_token = token
    WHERE id = _user_id;
  END IF;
  
  RETURN token;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.generate_content_studio_token() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_content_studio_token(uuid) TO authenticated;

-- RLS Policy: Users can only see their own token
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile (including token)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Service role can read all profiles (for admin operations)
DROP POLICY IF EXISTS "Service role can read all profiles" ON public.profiles;
CREATE POLICY "Service role can read all profiles"
ON public.profiles
FOR SELECT
USING (auth.jwt() ->> 'role' = 'service_role');
