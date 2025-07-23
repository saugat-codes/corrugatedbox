"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { isDevelopmentMode, mockUser } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onBack: () => void
}

export default function CreateUserModal({ open, onClose, onBack }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    accessCode: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { refreshUser } = useAuth()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      if (isDevelopmentMode()) {
        // Mock access code validation in development
        if (formData.accessCode !== "DEMO123") {
          setError("Invalid access code. Use 'DEMO123' for demo.")
          setLoading(false)
          return
        }

        // Create mock user with session
        const newUser = {
          ...mockUser,
          full_name: formData.fullName,
          email: formData.email,
          role: "user",
        }

        localStorage.setItem("mock-user", JSON.stringify(newUser))
        localStorage.setItem(
          "mock-session",
          JSON.stringify({
            user: { id: newUser.id, email: formData.email },
            access_token: "mock-user-token",
            expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        )

        onClose()
        router.push("/dashboard")
      } else {
        // Real Supabase logic remains the same...
        // Verify access code first
        const { data: accessCodeData, error: accessCodeError } = await supabase
          .from("user_access_codes")
          .select("*")
          .eq("code", formData.accessCode)
          .eq("used", false)
          .single()

        if (accessCodeError || !accessCodeData) {
          setError("Invalid or expired access code")
          setLoading(false)
          return
        }

        // Sign up the user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: "user",
            },
          },
        })

        if (signUpError) {
          setError(signUpError.message)
        } else {
          // Create user profile and mark access code as used
          const { error: profileError } = await supabase.from("users").insert([
            {
              id: data.user?.id,
              email: formData.email,
              full_name: formData.fullName,
              role: "user",
              access_code: formData.accessCode,
            },
          ])

          if (profileError) {
            setError("Failed to create user profile")
          } else {
            // Mark access code as used
            await supabase
              .from("user_access_codes")
              .update({ used: true, used_by: data.user?.id })
              .eq("code", formData.accessCode)

            // Refresh auth context
            await refreshUser()
            onClose()
            router.push("/dashboard")
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create User Account</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Your Full Name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Your Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              placeholder="Admin-Provided Access Code"
              value={formData.accessCode}
              onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
