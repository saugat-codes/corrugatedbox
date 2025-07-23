-- Fix email confirmation for Saugat's admin account
-- This script will confirm the email and ensure the user can login

DO $$
DECLARE
    auth_user_id UUID;
    user_found BOOLEAN := FALSE;
BEGIN
    -- Find the user in auth.users
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'saugat.codes@gmail.com'
    LIMIT 1;
    
    IF auth_user_id IS NOT NULL THEN
        user_found := TRUE;
        RAISE NOTICE 'Found user with ID: %', auth_user_id;
        
        -- Update the auth.users table to confirm email
        UPDATE auth.users 
        SET 
            email_confirmed_at = NOW(),
            confirmed_at = NOW(),
            email_change_confirm_status = 0,
            raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"email_verified": true}'::jsonb
        WHERE id = auth_user_id;
        
        RAISE NOTICE '✅ Email confirmed for user';
        
        -- Ensure user profile exists in public.users
        -- Temporarily disable RLS
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        
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
        
        RAISE NOTICE '✅ Admin profile created/updated';
        
    ELSE
        RAISE NOTICE '❌ User not found in auth.users';
        RAISE NOTICE 'Please create the user first using one of these methods:';
        RAISE NOTICE '1. Sign up through the application';
        RAISE NOTICE '2. Create manually in Supabase Auth dashboard';
    END IF;
END $$;

-- Verify the user is ready to login
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.confirmed_at,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email Confirmed'
        ELSE '❌ Email Not Confirmed'
    END as email_status,
    u.full_name,
    u.role,
    CASE 
        WHEN u.role = 'admin' THEN '✅ Admin Role'
        ELSE '❌ Not Admin'
    END as role_status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE au.email = 'saugat.codes@gmail.com';
