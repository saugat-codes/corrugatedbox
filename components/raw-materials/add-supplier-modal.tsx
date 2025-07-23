"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

interface AddSupplierModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddSupplierModal({ open, onClose, onSuccess }: AddSupplierModalProps) {
  const [supplierName, setSupplierName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)

  const supabase = createClientComponentClient()

  // Check authentication status when modal opens
  useEffect(() => {
    let listener: any;
    if (open) {
      checkAuth();
      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setError("");
        } else {
          setUser(null);
          setError("You must be logged in to add suppliers. Please log in and try again.");
        }
      });
      listener = data?.subscription;
    }
    return () => {
      if (listener) listener.unsubscribe();
    };
  }, [open]);

  const checkAuth = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        console.error("User error:", userError)
        setError("Authentication error. Please try logging in again.")
        return
      }

      if (user) {
        setUser(user)
        setError("")
      } else {
        setError("You must be logged in to add suppliers. Please log in and try again.")
      }
    } catch (err: any) {
      console.error("Auth check error:", err)
      setError("Failed to verify authentication. Please refresh and try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to add suppliers")
      return
    }

    if (!supplierName.trim()) {
      setError("Supplier name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Double-check authentication before inserting
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error("Authentication expired. Please log in again.")
      }

      // Try to insert the supplier
      const { data, error: insertError } = await supabase
        .from("suppliers")
        .insert([
          {
            name: supplierName.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (insertError) {
        console.error("Insert error:", insertError)

        // Provide more helpful error messages
        if (insertError.message.includes("row-level security")) {
          throw new Error(
            "Permission denied. The database policies may need to be updated. Please run script 16-fix-all-rls-policies.sql",
          )
        } else if (insertError.message.includes("duplicate") || insertError.code === "23505") {
          throw new Error("A supplier with this name already exists.")
        } else if (insertError.message.includes("not-null")) {
          throw new Error("All required fields must be filled.")
        } else {
          throw new Error(`Failed to add supplier: ${insertError.message}`)
        }
      }

      console.log("Supplier added successfully:", data)
      onSuccess()
      setSupplierName("")
      onClose()
    } catch (err: any) {
      console.error("Error adding supplier:", err)
      setError(err.message || "Failed to add supplier")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSupplierName("")
    setError("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Supplier</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!user && open && (
          <Alert variant="destructive">
            <AlertDescription>You must be logged in to add suppliers. Please log in and try again.</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="Enter supplier name"
              required
              disabled={loading || !user}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !supplierName.trim() || !user}>
              {loading ? "Adding..." : "Add Supplier"}
            </Button>
          </div>
        </form>

        {user && <div className="text-xs text-muted-foreground mt-2">Logged in as: {user.email}</div>}
      </DialogContent>
    </Dialog>
  )
}
