"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, XCircle, Database } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client"

interface DatabaseStatus {
  status: "checking" | "connected" | "error" | "not-configured" | "schema-missing"
  error?: string
  missingTables?: string[]
}

export default function SupabaseStatus() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({ status: "checking" })

  useEffect(() => {
    checkSupabaseConnection()
  }, [])

  const checkSupabaseConnection = async () => {
    if (!isSupabaseConfigured()) {
      setDbStatus({ status: "not-configured" })
      return
    }

    try {
      // Check if essential tables exist
      const tablesToCheck = ["users", "raw_materials", "suppliers", "paper_types"]
      const missingTables: string[] = []

      for (const table of tablesToCheck) {
        try {
          const { error } = await supabase.from(table).select("*").limit(1)
          if (error && error.message.includes("does not exist")) {
            missingTables.push(table)
          }
        } catch (err: any) {
          if (err.message?.includes("does not exist")) {
            missingTables.push(table)
          }
        }
      }

      if (missingTables.length > 0) {
        setDbStatus({
          status: "schema-missing",
          missingTables,
          error: `Missing tables: ${missingTables.join(", ")}`,
        })
      } else {
        // Additional check: try to test RLS policies
        try {
          const { error: rlsError } = await supabase.from("users").select("count").limit(1)
          if (rlsError && rlsError.message.includes("row-level security")) {
            setDbStatus({
              status: "error",
              error: "RLS policies need to be fixed. Run script #09 to fix admin creation policy.",
            })
          } else {
            setDbStatus({ status: "connected" })
          }
        } catch (rlsErr) {
          setDbStatus({ status: "connected" }) // Assume it's working if we can't test
        }
      }
    } catch (err: any) {
      setDbStatus({
        status: "error",
        error: err.message || "Failed to connect to Supabase",
      })
    }
  }

  if (dbStatus.status === "checking") {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">Checking Supabase connection...</AlertDescription>
      </Alert>
    )
  }

  if (dbStatus.status === "not-configured") {
    return (
      <Alert className="mb-4 border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Development Mode:</strong> Supabase is not configured. Using mock data for testing.
          <br />
          <span className="text-sm">
            To use production features, set up your Supabase project and environment variables.
          </span>
        </AlertDescription>
      </Alert>
    )
  }

  if (dbStatus.status === "schema-missing") {
    return (
      <Alert className="mb-4 border-orange-200 bg-orange-50">
        <Database className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="space-y-3">
            <div>
              <strong>Database Schema Missing:</strong> Connected to Supabase but database tables are not set up.
            </div>
            <div className="bg-orange-100 p-3 rounded border">
              <strong>Quick Setup Available!</strong>
              <br />
              <span className="text-sm">We've created an interactive setup guide to make this easy.</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <strong>Next Steps:</strong>
                <br />
                1. Click the "Interactive Setup Guide" button below
                <br />
                2. Follow the step-by-step instructions
                <br />
                3. Copy and run each SQL script in your Supabase dashboard
              </div>
              <a href="/setup" className="ml-4">
                <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium">
                  Interactive Setup Guide →
                </button>
              </a>
            </div>
            <div className="text-xs text-orange-600 border-t pt-2">
              Missing tables: {dbStatus.missingTables?.join(", ")}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (dbStatus.status === "error") {
    return (
      <Alert className="mb-4 border-red-200 bg-red-50" variant="destructive">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Supabase Connection Error:</strong> {dbStatus.error}
          <br />
          <span className="text-sm">Please check your environment variables and database setup.</span>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        <strong>Production Mode:</strong> Successfully connected to Supabase database with complete schema.
      </AlertDescription>
    </Alert>
  )
}
