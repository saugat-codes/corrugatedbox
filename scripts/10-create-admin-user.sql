-- Create the admin user directly in the database
-- This bypasses RLS policies for initial setup

-- First, let's temporarily disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Insert the admin user directly (you'll need to get the UUID from Supabase auth after signup)
-- This is a placeholder - you'll need to replace the UUID with the actual one from auth.users

-- Note: You need to first sign up the user through Supabase Auth, then run this script
-- with the actual UUID from the auth.users table

-- Example (replace with actual UUID after signup):
-- INSERT INTO public.users (
--   id,
--   email,
--   full_name,
--   role,
--   permissions,
--   created_at,
--   updated_at
-- ) VALUES (
--   'actual-uuid-from-auth-users',
--   'saugat.codes@gmail.com',
--   'Saugat',
--   'admin',
--   '{}',
--   NOW(),
--   NOW()
-- ) ON CONFLICT (id) DO UPDATE SET
--   full_name = EXCLUDED.full_name,
--   role = EXCLUDED.role,
--   updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at FROM public.users WHERE email = 'saugat.codes@gmail.com';
