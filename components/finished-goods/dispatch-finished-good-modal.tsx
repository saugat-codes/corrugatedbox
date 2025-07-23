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

interface DispatchFinishedGoodModalProps {
  open: boolean
  onClose: () => void
  finishedGood: any
  onSuccess: () => void
}

export default function DispatchFinishedGoodModal({
  open,
  onClose,
  finishedGood,
  onSuccess,
}: DispatchFinishedGoodModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    quantityToDispatch: "",
    dispatchNotes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const quantityToDispatch = Number.parseInt(formData.quantityToDispatch)
    if (quantityToDispatch > finishedGood.quantity_pcs) {
      setError("Cannot dispatch more quantity than available")
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Update finished good quantity
      const newQuantity = finishedGood.quantity_pcs - quantityToDispatch
      const { error: updateError } = await supabase
        .from("finished_goods")
        .update({ quantity_pcs: newQuantity })
        .eq("id", finishedGood.id)

      if (updateError) throw updateError

      // Log the dispatch
      await supabase.from("stock_logs").insert([
        {
          finished_good_id: finishedGood.id,
          activity_type: "Dispatch",
          quantity: quantityToDispatch,
          weight_kg: quantityToDispatch * finishedGood.weight_one_box_kg,
          purpose_notes: formData.dispatchNotes,
          user_id: user.id,
        },
      ])

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to dispatch finished good")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Dispatch Finished Good</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm">
              <strong>Product:</strong> {finishedGood.box_name}
            </p>
            <p className="text-sm">
              <strong>Available Quantity:</strong> {finishedGood.quantity_pcs} pcs
            </p>
            <p className="text-sm">
              <strong>Customer:</strong> {finishedGood.customers?.name}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Dispatch Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity to Dispatch</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={finishedGood.quantity_pcs}
                value={formData.quantityToDispatch}
                onChange={(e) => setFormData({ ...formData, quantityToDispatch: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="notes">Dispatch Notes</Label>
              <Textarea
                id="notes"
                value={formData.dispatchNotes}
                onChange={(e) => setFormData({ ...formData, dispatchNotes: e.target.value })}
                placeholder="Add dispatch notes, delivery details, etc."
                required
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
                {loading ? "Dispatching..." : "Dispatch"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
