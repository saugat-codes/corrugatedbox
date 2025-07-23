-- Create Saugat's admin account automatically
-- This script will work after the user signs up through Supabase Auth

-- First, let's check if the user exists in auth.users
DO $$
DECLARE
    user_uuid UUID;
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Try to find the user in auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'saugat.codes@gmail.com' 
    LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        user_exists := TRUE;
        RAISE NOTICE 'Found user in auth.users with ID: %', user_uuid;
        
        -- Temporarily disable RLS to insert admin user
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        
        -- Insert or update the admin user profile
        INSERT INTO public.users (
            id,
            email,
            full_name,
            role,
            permissions,
            created_at,
            updated_at
        ) VALUES (
            user_uuid,
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
        
        RAISE NOTICE 'Admin user profile created/updated successfully!';
    ELSE
        RAISE NOTICE 'User not found in auth.users. Please sign up first through the application.';
        RAISE NOTICE 'Steps to create admin account:';
        RAISE NOTICE '1. Go to your application login page';
        RAISE NOTICE '2. Click "Sign Up" and choose "Admin"';
        RAISE NOTICE '3. Use email: saugat.codes@gmail.com';
        RAISE NOTICE '4. Use password: Ilovenepal00*';
        RAISE NOTICE '5. Then run this script again';
    END IF;
END $$;

-- Verify the admin user was created (if user existed)
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    created_at,
    CASE 
        WHEN role = 'admin' THEN '✅ Admin access granted'
        ELSE '❌ Not an admin'
    END as status
FROM public.users 
WHERE email = 'saugat.codes@gmail.com';
