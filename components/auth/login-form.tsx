"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"
import ForgotPasswordModal from "./forgot-password-modal"
import SignUpModal from "./signup-modal"
import SupabaseStatus from "@/components/ui/supabase-status"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { isDevelopmentMode, isSupabaseConfigured } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [status, setStatus] = useState<"ready" | "logging-in" | "success" | "error">("ready")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)

  const router = useRouter()
  const { refreshUser } = useAuth()
  const supabase = createClientComponentClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("logging-in")
    setError("")

    try {
      if (isDevelopmentMode()) {
        // Development mode - check for mock user
        const mockUser = localStorage.getItem("mock-user")
        if (mockUser) {
          const user = JSON.parse(mockUser)
          // Simple validation - any email/password works in dev mode
          if (email && password) {
            // Create session with longer expiry
            const sessionData = {
              user: { id: user.id, email: user.email },
              access_token: "mock-token",
              expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            }
            localStorage.setItem("mock-session", JSON.stringify(sessionData))
            localStorage.setItem("mock-user", JSON.stringify(user))
            
            setStatus("success")
            // Small delay to show success state
            setTimeout(() => {
              router.push("/dashboard")
            }, 500)
            return
          }
        }

        // If no mock user exists, show error
        setError("No account found. Please create an admin account first.")
        setStatus("error")
      } else {
        // Production mode - use real Supabase
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) {
          console.error("Auth error:", authError)
          // Check if it's a schema issue
          if (authError.message.includes("does not exist")) {
            setNeedsSetup(true)
            setError("Database schema not set up. Please run the setup scripts first.")
          } else {
            setError(authError.message)
          }
          setStatus("error")
        } else if (data.session) {
          console.log("Login successful, session created")
          setStatus("success")
          // Refresh user context to ensure profile is loaded
          await refreshUser()
          // Wait a moment to ensure session is properly set and user profile is fetched
          setTimeout(() => {
            router.push("/dashboard")
          }, 1000)
        } else {
          setError("Login failed - no session created")
          setStatus("error")
        }
      }
    } catch (err: any) {
      console.error("Login error:", err)
      if (err.message?.includes("does not exist")) {
        setNeedsSetup(true)
        setError("Database schema not set up. Please run the setup scripts first.")
      } else {
        setError(err.message || "An unexpected error occurred")
      }
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "ready":
        return { icon: CheckCircle, text: "Ready to Login", color: "text-green-600" }
      case "logging-in":
        return { icon: AlertCircle, text: "Logging in...", color: "text-blue-600" }
      case "success":
        return { icon: CheckCircle, text: "Login successful!", color: "text-green-600" }
      case "error":
        return { icon: AlertCircle, text: `Login failed: ${error}`, color: "text-red-600" }
    }
  }

  const statusInfo = getStatusMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <SupabaseStatus />

        <div className="text-center">
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900">The Corrugated Box</h1>
          <p className="mt-2 text-sm text-gray-600">Inventory Management System</p>
        </div>

        {needsSetup && isSupabaseConfigured() && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <AlertCircle className="h-8 w-8 text-orange-600 mx-auto" />
                <h3 className="font-semibold text-orange-900">Database Setup Required</h3>
                <p className="text-sm text-orange-800">
                  Your Supabase project is connected, but the database tables need to be created.
                  <br />
                  <strong>Don't worry - we've made this super easy!</strong>
                </p>
                <div className="space-y-2">
                  <Link href="/setup">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full">
                      🚀 Start Interactive Setup Guide
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <p className="text-xs text-orange-700">
                    Takes about 5 minutes • Step-by-step instructions • Copy-paste ready
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-purple-600 hover:text-purple-500"
                disabled={loading}
              >
                Forgot Password?
              </button>
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="text-purple-600 hover:text-purple-500"
                disabled={loading}
              >
                Don't have an account? Sign Up
              </button>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
              <span className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</span>
            </div>
          </CardContent>
        </Card>

        <ForgotPasswordModal open={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
        <SignUpModal open={showSignUp} onClose={() => setShowSignUp(false)} />
      </div>
    </div>
  )
}
