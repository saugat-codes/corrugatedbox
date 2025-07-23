"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle } from "lucide-react"
import { isDevelopmentMode, isSupabaseConfigured } from "@/lib/supabase-client"

export default function DevelopmentBanner() {
  if (isSupabaseConfigured()) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <Info className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>Production Mode:</strong> Connected to Supabase database.
        </AlertDescription>
      </Alert>
    )
  }

  if (isDevelopmentMode()) {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Development Mode:</strong> Using mock data for testing. Supabase is not configured.
          <br />
          <span className="text-sm">
            Demo credentials - Admin: any email/password | User: use access code "DEMO123"
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-red-200 bg-red-50" variant="destructive">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800">
        <strong>Configuration Error:</strong> Supabase environment variables are invalid.
        <br />
        <span className="text-sm">Please check your .env.local file and ensure proper Supabase configuration.</span>
      </AlertDescription>
    </Alert>
  )
}
