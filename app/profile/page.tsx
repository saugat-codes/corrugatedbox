"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    newPassword: "",
    confirmPassword: "",
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        newPassword: "",
        confirmPassword: "",
      })
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    try {
      if (!user) {
        setError("User not found")
        return
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from("users")
        .update({ full_name: formData.fullName })
        .eq("id", user.id)

      if (updateError) throw updateError

      setMessage("Profile updated successfully!")
      await refreshUser()
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      setSaving(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      })

      if (error) throw error

      setMessage("Password changed successfully!")
      setFormData({ ...formData, newPassword: "", confirmPassword: "" })
    } catch (err: any) {
      setError(err.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and edit your personal information.</p>
        </div>

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <Button type="submit" disabled={saving}>
                  {saving ? "Changing Password..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* User Information Display */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Role</Label>
                <p className="text-sm font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Account Created</Label>
                <p className="text-sm">{new Date(user?.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {user?.access_code && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Access Code Used</Label>
                <p className="text-sm font-mono">{user.access_code}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
