-- Fix the RLS policy to allow initial admin creation
-- This script should be run if you're getting "row-level security policy" errors

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Allow admin creation" ON public.users;

-- Create a new policy that allows initial admin creation
CREATE POLICY "Allow admin creation" ON public.users
  FOR INSERT WITH CHECK (
    -- Allow if no users exist (initial admin creation)
    NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
    OR
    -- Allow if created by existing admin
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Allow admin creation';
