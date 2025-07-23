"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"
import { supabase, isDevelopmentMode } from "@/lib/supabase-client"

interface ForgotPasswordModalProps {
  open: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ open, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("admin@example.com")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      if (isDevelopmentMode()) {
        // Mock success in development mode
        setMessage("Password reset link sent to your email! (Development mode)")
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
          setError(error.message)
        } else {
          setMessage("Password reset link sent to your email!")
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
            <DialogTitle>Reset Password</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email address below. We'll send you a link to reset your password.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
