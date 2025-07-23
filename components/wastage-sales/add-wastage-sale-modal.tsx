"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

interface AddWastageSaleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddWastageSaleModal({ open, onClose, onSuccess }: AddWastageSaleModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    itemDescription: "",
    quantity: "",
    weightKg: "",
    saleAmount: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const wastageSaleData = {
        date: formData.date,
        item_description: formData.itemDescription,
        quantity: Number.parseInt(formData.quantity),
        weight_kg: Number.parseFloat(formData.weightKg),
        sale_amount: Number.parseFloat(formData.saleAmount),
        notes: formData.notes || null,
        user_id: user.id,
      }

      const { error: insertError } = await supabase.from("wastage_sales").insert([wastageSaleData])

      if (insertError) throw insertError

      // Log the wastage sale
      await supabase.from("stock_logs").insert([
        {
          raw_material_id: null,
          finished_good_id: null,
          activity_type: "Wastage",
          quantity: Number.parseInt(formData.quantity),
          weight_kg: Number.parseFloat(formData.weightKg),
          purpose_notes: `Wastage sale: ${formData.itemDescription}`,
          user_id: user.id,
        },
      ])

      onSuccess()
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to add wastage sale")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      itemDescription: "",
      quantity: "",
      weightKg: "",
      saleAmount: "",
      notes: "",
    })
    setError("")
  }

  const calculateRate = () => {
    const weight = Number.parseFloat(formData.weightKg)
    const amount = Number.parseFloat(formData.saleAmount)
    if (weight > 0 && amount > 0) {
      return (amount / weight).toFixed(2)
    }
    return "0.00"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Wastage Sale</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Sale Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="itemDescription">Item Description</Label>
            <Input
              id="itemDescription"
              value={formData.itemDescription}
              onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
              placeholder="e.g., Paper scraps, Cardboard waste, Damaged boxes"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.01"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="saleAmount">Sale Amount (₹)</Label>
              <Input
                id="saleAmount"
                type="number"
                step="0.01"
                value={formData.saleAmount}
                onChange={(e) => setFormData({ ...formData, saleAmount: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Rate per kg</Label>
              <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center text-sm">
                ₹{calculateRate()}/kg
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the wastage sale"
              rows={3}
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
              {loading ? "Adding..." : "Add Wastage Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
