"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

interface AddCustomerModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddCustomerModal({ open, onClose, onSuccess }: AddCustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactPerson: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: insertError } = await supabase.from("customers").insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          contact_person: formData.contactPerson.trim() || null,
          address: formData.address.trim() || null,
        },
      ])

      if (insertError) throw insertError

      onSuccess()
      setFormData({ name: "", email: "", contactPerson: "", address: "" })
    } catch (err: any) {
      setError(err.message || "Failed to add customer")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Customer</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Contact person name"
            />
          </div>

          <div>
            <Label htmlFor="customerAddress">Address</Label>
            <Input
              id="customerAddress"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Customer address"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
