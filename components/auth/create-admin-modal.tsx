"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Shield } from "lucide-react"
import { isDevelopmentMode } from "@/lib/supabase-client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/contexts/auth-context"

interface CreateAdminModalProps {
  open: boolean
  onClose: () => void
  onBack: () => void
}

export default function CreateAdminModal({ open, onClose, onBack }: CreateAdminModalProps) {
  const [formData, setFormData] = useState({
    fullName: "Saugat",
    email: "saugat.codes@gmail.com",
    password: "Ilovenepal00*",
    confirmPassword: "Ilovenepal00*",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { refreshUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    if (!formData.fullName.trim()) {
      setError("Full name is required")
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError("Email is required")
      setLoading(false)
      return
    }

    try {
      if (isDevelopmentMode()) {
        // Development mode - use mock data
        console.log("Creating admin account in development mode...")

        const newUser = {
          id: `mock-admin-${Date.now()}`,
          email: formData.email,
          full_name: formData.fullName,
          role: "admin" as const,
          access_code: null,
          permissions: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Store mock user and session
        localStorage.setItem("mock-user", JSON.stringify(newUser))
        localStorage.setItem(
          "mock-session",
          JSON.stringify({
            user: { id: newUser.id, email: formData.email },
            access_token: "mock-admin-token",
            expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        )

        console.log("Mock admin account created successfully")

        // Small delay to show loading state
        await new Promise((resolve) => setTimeout(resolve, 500))

        onClose()
        router.push("/dashboard")
      } else {
        // Production mode - use real Supabase
        console.log("Creating admin account with Supabase...")

        // First, try to sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: "admin",
            },
          },
        })

        if (signUpError) {
          console.error("Supabase signup error:", signUpError)

          // If user already exists, try to sign them in
          if (signUpError.message.includes("already registered")) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            })

            if (signInError) {
              setError(`Sign in failed: ${signInError.message}`)
              return
            }

            // Check if user profile exists
            const { data: existingUser, error: fetchError } = await supabase
              .from("users")
              .select("*")
              .eq("email", formData.email)
              .single()

            if (fetchError && !fetchError.message.includes("No rows")) {
              console.error("Error checking existing user:", fetchError)
            }

            if (!existingUser) {
              // User exists in auth but not in users table, create profile
              const { error: profileError } = await supabase.from("users").insert([
                {
                  id: signInData.user.id,
                  email: formData.email,
                  full_name: formData.fullName,
                  role: "admin",
                  permissions: {},
                },
              ])

              if (profileError) {
                console.error("Profile creation error:", profileError)
                setError(`Profile creation failed: ${profileError.message}`)
                return
              }
            }

            console.log("Admin account verified/created successfully")
            onClose()
            router.push("/dashboard")
            return
          } else {
            setError(signUpError.message)
            return
          }
        }

        if (!signUpData.user) {
          setError("Failed to create user account")
          return
        }

        console.log("Supabase user created, creating profile...")

        // Create user profile in database with better error handling
        const { error: profileError } = await supabase.from("users").insert([
          {
            id: signUpData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            role: "admin",
            permissions: {},
          },
        ])

        if (profileError) {
          console.error("Profile creation error:", profileError)

          // Check if it's an RLS policy issue
          if (profileError.message.includes("row-level security policy")) {
            setError("Database setup incomplete. Please run the RLS policy fix script first.")
          } else if (profileError.message.includes("duplicate key")) {
            // Profile already exists, that's fine
            console.log("User profile already exists")
          } else {
            setError(`Profile creation failed: ${profileError.message}`)
            return
          }
        }

        console.log("Admin account created successfully")
        onClose()
        router.push("/dashboard")
      }
    } catch (err: any) {
      console.error("Admin creation error:", err)
      setError(err.message || "An unexpected error occurred while creating the account")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: "Saugat",
      email: "saugat.codes@gmail.com",
      password: "Ilovenepal00*",
      confirmPassword: "Ilovenepal00*",
    })
    setError("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleBack = () => {
    resetForm()
    onBack()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create Admin Account</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Admin Access</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Creating an admin account gives full access to the system, including billing and user management.
            </p>
          </div>

          {isDevelopmentMode() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Development Mode:</strong> This will create a mock admin account for testing purposes.
              </p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Pre-filled Credentials:</strong> The form is pre-filled with your requested admin credentials. You
              can modify them if needed.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {formData.password && formData.password.length > 0 && formData.password.length < 6 && (
              <p className="text-xs text-red-600">Password must be at least 6 characters long</p>
            )}

            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleBack} disabled={loading}>
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating Account..." : "Create Admin Account"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
