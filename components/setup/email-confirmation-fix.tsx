"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, Mail, AlertTriangle, ExternalLink } from "lucide-react"

const EMAIL_FIX_METHODS = [
  {
    id: "method1",
    title: "Method 1: Fix Existing User",
    description: "Confirm email for existing user account",
    sql: `-- Fix email confirmation for existing user
DO $$
DECLARE
    auth_user_id UUID;
BEGIN
    -- Find and update the user
    SELECT id INTO auth_user_id
    FROM auth.users
    WHERE email = 'saugat.codes@gmail.com'
    LIMIT 1;
    
    IF auth_user_id IS NOT NULL THEN
        -- Confirm the email
        UPDATE auth.users 
        SET 
            email_confirmed_at = NOW(),
            confirmed_at = NOW(),
            email_change_confirm_status = 0
        WHERE id = auth_user_id;
        
        -- Ensure admin profile exists
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        
        INSERT INTO public.users (
            id, email, full_name, role, permissions, created_at, updated_at
        ) VALUES (
            auth_user_id, 'saugat.codes@gmail.com', 'Saugat', 'admin', '{}', NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
            full_name = 'Saugat', role = 'admin', updated_at = NOW();
        
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE '✅ Email confirmed and admin profile ready!';
    ELSE
        RAISE NOTICE '❌ User not found. Please create user first.';
    END IF;
END $$;

-- Verify the fix
SELECT 
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    u.role,
    '✅ Ready to Login' as status
FROM auth.users au
JOIN public.users u ON au.id = u.id
WHERE au.email = 'saugat.codes@gmail.com';`,
  },
  {
    id: "method2",
    title: "Method 2: Manual Confirmation in Dashboard",
    description: "Confirm email through Supabase dashboard",
    steps: [
      "Go to Supabase Dashboard → Authentication → Users",
      "Find user: saugat.codes@gmail.com",
      "Click on the user to open details",
      "Look for 'Email Confirmed' field",
      "If it shows 'false' or is empty, click 'Confirm Email'",
      "Save the changes",
      "Try logging in again",
    ],
  },
  {
    id: "method3",
    title: "Method 3: Create Fresh User with Confirmed Email",
    description: "Delete and recreate user with confirmed email",
    sql: `-- Create user with pre-confirmed email
DO $$
DECLARE
    new_user_id UUID;
    encrypted_password TEXT;
BEGIN
    -- Delete existing user if exists (optional)
    DELETE FROM public.users WHERE email = 'saugat.codes@gmail.com';
    DELETE FROM auth.users WHERE email = 'saugat.codes@gmail.com';
    
    -- Generate new UUID and encrypt password
    new_user_id := gen_random_uuid();
    encrypted_password := crypt('Ilovenepal00*', gen_salt('bf'));
    
    -- Create user in auth.users with confirmed email
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, confirmed_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, created_at, updated_at, email_change_confirm_status
    ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 
        'authenticated', 'saugat.codes@gmail.com', encrypted_password,
        NOW(), NOW(), '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "Saugat", "role": "admin"}', false, NOW(), NOW(), 0
    );
    
    -- Create admin profile
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    INSERT INTO public.users (
        id, email, full_name, role, permissions, created_at, updated_at
    ) VALUES (
        new_user_id, 'saugat.codes@gmail.com', 'Saugat', 'admin', '{}', NOW(), NOW()
    );
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ Fresh admin account created with confirmed email!';
END $$;`,
  },
]

export default function EmailConfirmationFix() {
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
        <Mail className="h-16 w-16 text-red-600 mx-auto" />
        <h1 className="text-3xl font-bold">📧 Fix Email Confirmation</h1>
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 text-lg">
            The "Email not confirmed" error means your account exists but needs email verification.
          </p>
        </div>
      </div>

      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <strong>🚨 Issue Identified:</strong>
            <div className="ml-4 space-y-1">
              <div>• User account exists in Supabase Auth</div>
              <div>• Email confirmation is missing</div>
              <div>• This prevents login even with correct credentials</div>
            </div>
            <div className="mt-3 p-2 bg-red-100 rounded text-sm">
              <strong>Solution:</strong> We need to manually confirm the email address in the database.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {EMAIL_FIX_METHODS.map((method) => (
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

      {EMAIL_FIX_METHODS.map((method) => (
        <Card key={method.id} className={`${selectedMethod === method.id ? "border-blue-300 bg-blue-50" : "hidden"}`}>
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

            {method.id === "method2" && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Supabase Dashboard</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <strong>✅ After Running the Fix:</strong>
            <div className="ml-4 space-y-1">
              <div>• Email will be marked as confirmed</div>
              <div>• Admin profile will be created/updated</div>
              <div>• You can login immediately with:</div>
              <div className="ml-4 font-mono text-sm">
                <div>Email: saugat.codes@gmail.com</div>
                <div>Password: Ilovenepal00*</div>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">🔍 Quick Diagnosis</h3>
        <p className="text-yellow-800 text-sm">Run this query in Supabase SQL Editor to check the current status:</p>
        <div className="mt-2 bg-yellow-100 rounded p-2">
          <code className="text-xs">
            SELECT email, email_confirmed_at, confirmed_at FROM auth.users WHERE email = 'saugat.codes@gmail.com';
          </code>
        </div>
        <p className="text-yellow-700 text-xs mt-2">If email_confirmed_at is NULL, that's the problem we're fixing.</p>
      </div>
    </div>
  )
}
