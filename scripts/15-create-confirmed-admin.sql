-- Create admin user with confirmed email from scratch
-- This script creates the user directly in auth.users with confirmed email

DO $$
DECLARE
    new_user_id UUID;
    user_exists BOOLEAN := FALSE;
    encrypted_password TEXT;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(
        SELECT 1 FROM auth.users WHERE email = 'saugat.codes@gmail.com'
    ) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'User already exists. Running email confirmation fix...';
        
        -- Get existing user ID
        SELECT id INTO new_user_id FROM auth.users WHERE email = 'saugat.codes@gmail.com';
        
        -- Confirm email for existing user
        UPDATE auth.users 
        SET 
            email_confirmed_at = NOW(),
            confirmed_at = NOW(),
            email_change_confirm_status = 0
        WHERE id = new_user_id;
        
    ELSE
        RAISE NOTICE 'Creating new user with confirmed email...';
        
        -- Generate new UUID
        new_user_id := gen_random_uuid();
        
        -- Encrypt password (Supabase uses bcrypt)
        -- Note: This is a simplified approach. In production, Supabase handles this.
        encrypted_password := crypt('Ilovenepal00*', gen_salt('bf'));
        
        -- Insert user directly into auth.users with confirmed email
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            email_change,
            email_change_sent_at,
            email_change_confirm_status,
            banned_until,
            reauthentication_sent_at,
            is_sso_user
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            'saugat.codes@gmail.com',
            encrypted_password,
            NOW(), -- email_confirmed_at - THIS IS KEY!
            NOW(), -- confirmed_at
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "Saugat", "role": "admin"}',
            false,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            NULL,
            0,
            NULL,
            NULL,
            false
        );
        
        RAISE NOTICE 'Created new user with ID: %', new_user_id;
    END IF;
    
    -- Create/update user profile
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
        new_user_id,
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
    
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ Admin account ready!';
    RAISE NOTICE 'Email: saugat.codes@gmail.com';
    RAISE NOTICE 'Password: Ilovenepal00*';
    RAISE NOTICE 'Email is pre-confirmed - you can login immediately!';
    
END $$;

-- Final verification
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    au.confirmed_at IS NOT NULL as account_confirmed,
    u.full_name,
    u.role,
    '✅ Ready to Login' as status
FROM auth.users au
JOIN public.users u ON au.id = u.id
WHERE au.email = 'saugat.codes@gmail.com';
