"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X } from "lucide-react"

interface ConvertStockModalProps {
  open: boolean
  onClose: () => void
  material: any
  onSuccess: () => void
}

export default function ConvertStockModal({ open, onClose, material, onSuccess }: ConvertStockModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    weightToConvert: "",
    conversionType: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const weightToConvert = Number.parseFloat(formData.weightToConvert)
    if (weightToConvert > material.weight_kg) {
      setError("Cannot convert more weight than available")
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Update material weight
      const newWeight = material.weight_kg - weightToConvert
      const { error: updateError } = await supabase
        .from("raw_materials")
        .update({ weight_kg: newWeight })
        .eq("id", material.id)

      if (updateError) throw updateError

      // Log the stock conversion
      await supabase.from("stock_logs").insert([
        {
          raw_material_id: material.id,
          activity_type: "Convert",
          quantity: Number.parseInt(formData.quantity),
          weight_kg: weightToConvert,
          purpose_notes: `Converted to ${formData.conversionType}`,
          user_id: user.id,
        },
      ])

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to convert stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Convert Stock</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm">
              <strong>Material:</strong> {material.name}
            </p>
            <p className="text-sm">
              <strong>Available Weight:</strong> {material.weight_kg} kg
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="weightToConvert">Weight to Convert (kg)</Label>
              <Input
                id="weightToConvert"
                type="number"
                step="0.01"
                max={material.weight_kg}
                value={formData.weightToConvert}
                onChange={(e) => setFormData({ ...formData, weightToConvert: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="conversionType">Type of Conversion</Label>
              <Select
                value={formData.conversionType}
                onValueChange={(value) => setFormData({ ...formData, conversionType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select conversion type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="finished-goods">To Finished Goods</SelectItem>
                  <SelectItem value="wastage">To Wastage</SelectItem>
                  <SelectItem value="sample">Sample Production</SelectItem>
                  <SelectItem value="testing">Quality Testing</SelectItem>
                </SelectContent>
              </Select>
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
                {loading ? "Converting..." : "Convert"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
