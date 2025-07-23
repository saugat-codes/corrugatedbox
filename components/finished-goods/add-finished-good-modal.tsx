"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus } from "lucide-react"
import AddCustomerModal from "./add-customer-modal"

interface AddFinishedGoodModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Customer {
  id: string
  name: string
}

interface BoxType {
  id: string
  name: string
}

interface PaperType {
  id: string
  name: string
}

interface PrintingType {
  id: string
  name: string
}

export default function AddFinishedGoodModal({ open, onClose, onSuccess }: AddFinishedGoodModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [boxTypes, setBoxTypes] = useState<BoxType[]>([])
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([])
  const [printingTypes, setPrintingTypes] = useState<PrintingType[]>([])
  const [showAddCustomer, setShowAddCustomer] = useState(false)

  const [formData, setFormData] = useState({
    boxName: "",
    customerId: "",
    lengthCm: "",
    heightCm: "",
    widthCm: "",
    boxTypeId: "",
    numberOfPly: "",
    sameCompositionAllLayers: true,
    topPaperTypeId: "",
    fluteType: "",
    linerType: "",
    printingTypeId: "",
    lamination: false,
    quantityPcs: "",
    weightOneBoxKg: "",
    ratePerPiece: "",
    dateAdded: new Date().toISOString().split("T")[0],
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    try {
      const [customersRes, boxTypesRes, paperTypesRes, printingTypesRes] = await Promise.all([
        supabase.from("customers").select("*").order("name"),
        supabase.from("box_types").select("*").order("name"),
        supabase.from("paper_types").select("*").order("name"),
        supabase.from("printing_types").select("*").order("name"),
      ])

      setCustomers(customersRes.data || [])
      setBoxTypes(boxTypesRes.data || [])
      setPaperTypes(paperTypesRes.data || [])
      setPrintingTypes(printingTypesRes.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const finishedGoodData = {
        box_name: formData.boxName,
        customer_id: formData.customerId,
        length_cm: Number.parseFloat(formData.lengthCm),
        height_cm: Number.parseFloat(formData.heightCm),
        width_cm: Number.parseFloat(formData.widthCm),
        box_type_id: formData.boxTypeId,
        number_of_ply: Number.parseInt(formData.numberOfPly),
        same_composition_all_layers: formData.sameCompositionAllLayers,
        top_paper_type_id: formData.topPaperTypeId,
        flute_type: formData.fluteType || null,
        liner_type: formData.linerType || null,
        printing_type_id: formData.printingTypeId,
        lamination: formData.lamination,
        quantity_pcs: Number.parseInt(formData.quantityPcs),
        weight_one_box_kg: Number.parseFloat(formData.weightOneBoxKg),
        rate_per_piece: formData.ratePerPiece ? Number.parseFloat(formData.ratePerPiece) : null,
        date_added: formData.dateAdded,
        created_by_user_id: user.id,
      }

      const { error: insertError } = await supabase.from("finished_goods").insert([finishedGoodData])

      if (insertError) throw insertError

      // Log the stock addition
      await supabase.from("stock_logs").insert([
        {
          finished_good_id: null, // Will be updated with the actual ID in a real implementation
          activity_type: "Add",
          quantity: Number.parseInt(formData.quantityPcs),
          weight_kg: Number.parseInt(formData.quantityPcs) * Number.parseFloat(formData.weightOneBoxKg),
          purpose_notes: `Added ${formData.boxName}`,
          user_id: user.id,
        },
      ])

      onSuccess()
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to add finished good")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      boxName: "",
      customerId: "",
      lengthCm: "",
      heightCm: "",
      widthCm: "",
      boxTypeId: "",
      numberOfPly: "",
      sameCompositionAllLayers: true,
      topPaperTypeId: "",
      fluteType: "",
      linerType: "",
      printingTypeId: "",
      lamination: false,
      quantityPcs: "",
      weightOneBoxKg: "",
      ratePerPiece: "",
      dateAdded: new Date().toISOString().split("T")[0],
    })
    setError("")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Add Finished Good</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boxName">Box Name</Label>
                <Input
                  id="boxName"
                  value={formData.boxName}
                  onChange={(e) => setFormData({ ...formData, boxName: e.target.value })}
                  placeholder="e.g., RSC Box for Electronics"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddCustomer(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length">Length (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={formData.lengthCm}
                  onChange={(e) => setFormData({ ...formData, lengthCm: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="width">Width (cm)</Label>
                <Input
                  id="width"
                  type="number"
                  step="0.1"
                  value={formData.widthCm}
                  onChange={(e) => setFormData({ ...formData, widthCm: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Box Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="boxType">Box Type</Label>
                <Select
                  value={formData.boxTypeId}
                  onValueChange={(value) => setFormData({ ...formData, boxTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select box type" />
                  </SelectTrigger>
                  <SelectContent>
                    {boxTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="numberOfPly">Number of Ply</Label>
                <Input
                  id="numberOfPly"
                  type="number"
                  min="1"
                  value={formData.numberOfPly}
                  onChange={(e) => setFormData({ ...formData, numberOfPly: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Paper Composition */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sameComposition"
                  checked={formData.sameCompositionAllLayers}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sameCompositionAllLayers: checked as boolean })
                  }
                />
                <Label htmlFor="sameComposition">Same composition for all layers</Label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="topPaperType">Top Paper Type</Label>
                  <Select
                    value={formData.topPaperTypeId}
                    onValueChange={(value) => setFormData({ ...formData, topPaperTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                    <SelectContent>
                      {paperTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="fluteType">Flute Type</Label>
                  <Input
                    id="fluteType"
                    value={formData.fluteType}
                    onChange={(e) => setFormData({ ...formData, fluteType: e.target.value })}
                    placeholder="e.g., B, C, E"
                  />
                </div>
                <div>
                  <Label htmlFor="linerType">Liner Type</Label>
                  <Input
                    id="linerType"
                    value={formData.linerType}
                    onChange={(e) => setFormData({ ...formData, linerType: e.target.value })}
                    placeholder="e.g., Test Liner"
                  />
                </div>
              </div>
            </div>

            {/* Printing and Finishing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="printingType">Printing Type</Label>
                <Select
                  value={formData.printingTypeId}
                  onValueChange={(value) => setFormData({ ...formData, printingTypeId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select printing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {printingTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="lamination"
                  checked={formData.lamination}
                  onCheckedChange={(checked) => setFormData({ ...formData, lamination: checked as boolean })}
                />
                <Label htmlFor="lamination">Lamination</Label>
              </div>
            </div>

            {/* Quantity and Pricing */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity (pcs)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantityPcs}
                  onChange={(e) => setFormData({ ...formData, quantityPcs: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="weightOneBox">Weight per Box (kg)</Label>
                <Input
                  id="weightOneBox"
                  type="number"
                  step="0.001"
                  value={formData.weightOneBoxKg}
                  onChange={(e) => setFormData({ ...formData, weightOneBoxKg: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ratePerPiece">Rate per Piece (₹)</Label>
                <Input
                  id="ratePerPiece"
                  type="number"
                  step="0.01"
                  value={formData.ratePerPiece}
                  onChange={(e) => setFormData({ ...formData, ratePerPiece: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dateAdded">Date Added</Label>
                <Input
                  id="dateAdded"
                  type="date"
                  value={formData.dateAdded}
                  onChange={(e) => setFormData({ ...formData, dateAdded: e.target.value })}
                  required
                />
              </div>
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
                {loading ? "Adding..." : "Add Finished Good"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddCustomerModal
        open={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSuccess={() => {
          setShowAddCustomer(false)
          fetchData()
        }}
      />
    </>
  )
}
