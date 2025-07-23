"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthDebug() {
  const [authInfo, setAuthInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testResult, setTestResult] = useState<string>("")

  const supabase = createClientComponentClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    setLoading(true)
    try {
      // Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      // Get user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      setAuthInfo({
        session: sessionData.session,
        sessionError,
        user: userData.user,
        userError,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Auth check failed:", error)
      setAuthInfo({ error: error })
    } finally {
      setLoading(false)
    }
  }

  const testSupplierInsert = async () => {
    setTestResult("Testing...")
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .insert([
          {
            name: `Test Supplier ${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) {
        setTestResult(`❌ Insert failed: ${error.message}`)
      } else {
        setTestResult(`✅ Insert successful: ${JSON.stringify(data)}`)

        // Clean up - delete the test supplier
        if (data && data[0]) {
          await supabase.from("suppliers").delete().eq("id", data[0].id)
        }
      }
    } catch (error: any) {
      setTestResult(`❌ Test failed: ${error.message}`)
    }
  }

  if (loading) {
    return <div>Loading auth debug info...</div>
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button onClick={checkAuth} variant="outline" size="sm">
            Refresh Auth Info
          </Button>
          <Button onClick={testSupplierInsert} variant="outline" size="sm" className="ml-2 bg-transparent">
            Test Supplier Insert
          </Button>
        </div>

        {testResult && (
          <Alert>
            <AlertDescription>{testResult}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-semibold">Session Info:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(authInfo?.session, null, 2)}
          </pre>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">User Info:</h4>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(authInfo?.user, null, 2)}</pre>
        </div>

        {authInfo?.sessionError && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600">Session Error:</h4>
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto">
              {JSON.stringify(authInfo.sessionError, null, 2)}
            </pre>
          </div>
        )}

        {authInfo?.userError && (
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600">User Error:</h4>
            <pre className="text-xs bg-red-100 p-2 rounded overflow-auto">
              {JSON.stringify(authInfo.userError, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
