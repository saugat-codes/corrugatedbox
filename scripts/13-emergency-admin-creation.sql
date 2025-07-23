-- Emergency admin creation script
-- Use this if you need to create the admin account directly in Supabase

-- STEP 1: First, manually create the auth user in Supabase Auth
-- Go to Authentication > Users in your Supabase dashboard
-- Click "Add user" and create:
-- Email: saugat.codes@gmail.com
-- Password: Ilovenepal00*
-- Email Confirm: Yes

-- STEP 2: After creating the auth user, run this script
-- It will automatically find the user and create the admin profile

DO $$
DECLARE
    auth_user_id UUID;
    profile_exists BOOLEAN := FALSE;
BEGIN
    -- Find the user ID from auth.users
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'saugat.codes@gmail.com'
    LIMIT 1;
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users. Please create the user in Supabase Auth dashboard first.';
    END IF;
    
    RAISE NOTICE 'Found auth user with ID: %', auth_user_id;
    
    -- Check if profile already exists
    SELECT EXISTS(
        SELECT 1 FROM public.users WHERE id = auth_user_id
    ) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE 'User profile already exists. Updating to admin role...';
    ELSE
        RAISE NOTICE 'Creating new admin profile...';
    END IF;
    
    -- Temporarily disable RLS
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    
    -- Insert or update admin profile
    INSERT INTO public.users (
        id,
        email,
        full_name,
        role,
        permissions,
        created_at,
        updated_at
    ) VALUES (
        auth_user_id,
        'saugat.codes@gmail.com',
        'Saugat',
        'admin',
        '{}',
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = 'Saugat',
        role = 'admin',
        permissions = '{}',
        updated_at = NOW();
    
    -- Re-enable RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ Admin profile created successfully!';
    RAISE NOTICE 'You can now login with:';
    RAISE NOTICE 'Email: saugat.codes@gmail.com';
    RAISE NOTICE 'Password: Ilovenepal00*';
    
END $$;

-- Verify the result
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    au.email_confirmed_at,
    CASE 
        WHEN u.role = 'admin' THEN '✅ Admin Ready'
        ELSE '❌ Not Admin'
    END as status
FROM public.users u
JOIN auth.users au ON u.id = au.id
WHERE u.email = 'saugat.codes@gmail.com';
