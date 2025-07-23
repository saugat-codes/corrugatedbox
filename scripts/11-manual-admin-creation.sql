-- Manual admin creation script
-- Run this AFTER you've signed up through the Supabase Auth UI

-- Step 1: First sign up the user through your app or Supabase Auth UI with:
-- Email: saugat.codes@gmail.com
-- Password: Ilovenepal00*

-- Step 2: Find the user ID from auth.users table
-- SELECT id FROM auth.users WHERE email = 'saugat.codes@gmail.com';

-- Step 3: Replace 'USER_ID_FROM_AUTH_USERS' below with the actual UUID and run this script

-- Temporarily disable RLS to insert admin user
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Insert or update the admin user profile
-- REPLACE 'USER_ID_FROM_AUTH_USERS' with the actual UUID from auth.users
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  permissions,
  created_at,
  updated_at
) VALUES (
  'USER_ID_FROM_AUTH_USERS', -- Replace this with actual UUID
  'saugat.codes@gmail.com',
  'Saugat',
  'admin',
  '{}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at FROM public.users WHERE email = 'saugat.codes@gmail.com';
