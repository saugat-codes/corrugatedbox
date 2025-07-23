"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink, User, Shield, ArrowRight } from "lucide-react"

const ADMIN_CREATION_STEPS = [
  {
    id: "method1",
    title: "Method 1: Through Application (Recommended)",
    description: "Create admin account using the app interface",
    steps: [
      "Go to your application login page",
      "Click 'Don't have an account? Sign Up'",
      "Choose 'Admin' option",
      "Use the pre-filled credentials",
      "Click 'Create Admin Account'",
    ],
    credentials: {
      email: "saugat.codes@gmail.com",
      password: "Ilovenepal00*",
      name: "Saugat",
    },
  },
  {
    id: "method2",
    title: "Method 2: Direct Database Creation",
    description: "Create admin account directly in Supabase",
    sql: `-- Run this script after signing up through the app
-- It will automatically find your user and make them admin

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
    END IF;
END $$;

-- Verify the admin user was created
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
WHERE email = 'saugat.codes@gmail.com';`,
  },
  {
    id: "method3",
    title: "Method 3: Emergency Creation (If app doesn't work)",
    description: "Create admin account manually in Supabase dashboard",
    steps: [
      "Go to Supabase Dashboard → Authentication → Users",
      "Click 'Add user' button",
      "Enter email: saugat.codes@gmail.com",
      "Enter password: Ilovenepal00*",
      "Set 'Email Confirm' to Yes",
      "Click 'Create user'",
      "Run the emergency SQL script below",
    ],
    sql: `-- Emergency admin creation script
-- Run AFTER creating the user in Supabase Auth dashboard

DO $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Find the user ID from auth.users
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'saugat.codes@gmail.com'
    LIMIT 1;
    
    IF auth_user_id IS NULL THEN
        RAISE EXCEPTION 'User not found in auth.users. Please create the user in Supabase Auth dashboard first.';
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
END $$;

-- Verify the result
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.created_at,
    CASE 
        WHEN u.role = 'admin' THEN '✅ Admin Ready'
        ELSE '❌ Not Admin'
    END as status
FROM public.users u
WHERE u.email = 'saugat.codes@gmail.com';`,
  },
]

export default function AdminCreationGuide() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string>("method1")

  const copyToClipboard = async (sql: string, methodId: string) => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopiedScript(methodId)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <Shield className="h-16 w-16 text-green-600 mx-auto" />
        <h1 className="text-3xl font-bold">👤 Create Saugat's Admin Account</h1>
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 text-lg">
            Multiple methods to create your admin account with the specified credentials.
          </p>
        </div>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <User className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <strong>🎯 Admin Credentials Ready:</strong>
            <div className="ml-4 space-y-1 font-mono text-sm">
              <div>
                <strong>Name:</strong> Saugat
              </div>
              <div>
                <strong>Email:</strong> saugat.codes@gmail.com
              </div>
              <div>
                <strong>Password:</strong> Ilovenepal00*
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {ADMIN_CREATION_STEPS.map((method) => (
          <Button
            key={method.id}
            variant={selectedMethod === method.id ? "default" : "outline"}
            onClick={() => setSelectedMethod(method.id)}
            className="h-auto p-4 text-left"
          >
            <div>
              <div className="font-semibold text-sm">{method.title.split(":")[0]}</div>
              <div className="text-xs opacity-75 mt-1">{method.description}</div>
            </div>
          </Button>
        ))}
      </div>

      {ADMIN_CREATION_STEPS.map((method) => (
        <Card key={method.id} className={`${selectedMethod === method.id ? "border-green-300 bg-green-50" : "hidden"}`}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Badge variant="default">{method.id.replace("method", "")}</Badge>
              <span>{method.title}</span>
            </CardTitle>
            <CardDescription>{method.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {method.steps && (
              <div>
                <h4 className="font-semibold mb-2">Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {method.steps.map((step, index) => (
                    <li key={index} className="text-gray-700">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {method.credentials && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-semibold text-blue-900 mb-2">Use these credentials:</h4>
                <div className="space-y-1 text-sm font-mono">
                  <div>
                    <strong>Email:</strong> {method.credentials.email}
                  </div>
                  <div>
                    <strong>Password:</strong> {method.credentials.password}
                  </div>
                  <div>
                    <strong>Name:</strong> {method.credentials.name}
                  </div>
                </div>
              </div>
            )}

            {method.sql && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">SQL Script:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(method.sql!, method.id)}
                    className="flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copiedScript === method.id ? "Copied!" : "Copy SQL"}</span>
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">{method.sql}</pre>
                </div>
              </div>
            )}

            {method.id === "method1" && (
              <div className="flex justify-center">
                <Button onClick={() => (window.location.href = "/")} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Go to Login Page</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <strong>💡 Recommended Approach:</strong>
            <div className="ml-4 space-y-1">
              <div>1. Try Method 1 first (through the app)</div>
              <div>2. If that fails, use Method 2 (database script)</div>
              <div>3. If all else fails, use Method 3 (manual creation)</div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
              <strong>After creation:</strong> You'll have full admin access to manage inventory, users, and all system
              settings.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="text-center">
        <Button
          variant="outline"
          onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Open Supabase Dashboard</span>
        </Button>
      </div>
    </div>
  )
}
