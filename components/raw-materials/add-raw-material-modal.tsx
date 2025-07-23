"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { X, Plus } from "lucide-react"
import AddSupplierModal from "./add-supplier-modal"

interface AddRawMaterialModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface Supplier {
  id: string
  name: string
}

interface PaperType {
  id: string
  name: string
}

export default function AddRawMaterialModal({ open, onClose, onSuccess }: AddRawMaterialModalProps) {
  const [activeTab, setActiveTab] = useState("Paper")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [paperTypes, setPaperTypes] = useState<PaperType[]>([])
  const [showAddSupplier, setShowAddSupplier] = useState(false)

  const [formData, setFormData] = useState({
    dateAdded: new Date().toISOString().split("T")[0],
    quantity: "",
    weightKg: "",
    supplierId: "",
    invoiceNumber: "",
    // Paper specific
    materialForm: "Reel",
    paperTypeId: "",
    sizeWidthCm: "",
    sizeLxBCm: { length: "", breadth: "" },
    gsm: "",
    bf: "",
    ratePerKg: "",
    // Stitching Wire specific
    stitchingWireType: "",
    // Gum Powder specific
    gumType: "",
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    if (open) {
      fetchSuppliers()
      fetchPaperTypes()
    }
  }, [open])

  const fetchSuppliers = async () => {
    const { data } = await supabase.from("suppliers").select("*").order("name")
    setSuppliers(data || [])
  }

  const fetchPaperTypes = async () => {
    const { data } = await supabase.from("paper_types").select("*").order("name")
    setPaperTypes(data || [])
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

      // Prepare material data based on type
      let materialData: any = {
        name: getMaterialName(),
        type: activeTab,
        date_added: formData.dateAdded,
        quantity: Number.parseInt(formData.quantity),
        weight_kg: Number.parseFloat(formData.weightKg),
        supplier_id: formData.supplierId,
        invoice_number: formData.invoiceNumber || null,
        rate_per_kg: formData.ratePerKg ? Number.parseFloat(formData.ratePerKg) : null,
        created_by_user_id: user.id,
      }

      if (activeTab === "Paper") {
        materialData = {
          ...materialData,
          material_form: formData.materialForm,
          paper_type_id: formData.paperTypeId,
          size_width_cm: formData.materialForm === "Reel" ? Number.parseFloat(formData.sizeWidthCm) : null,
          size_lxb_cm: formData.materialForm === "Sheet" ? formData.sizeLxBCm : null,
          gsm: Number.parseInt(formData.gsm),
          bf: Number.parseInt(formData.bf),
        }
      } else if (activeTab === "StitchingWire") {
        materialData.stitching_wire_type = formData.stitchingWireType
      } else if (activeTab === "GumPowder") {
        materialData.gum_type = formData.gumType
      }

      const { error: insertError } = await supabase.from("raw_materials").insert([materialData])

      if (insertError) throw insertError

      // Log the stock addition
      await supabase.from("stock_logs").insert([
        {
          raw_material_id: null, // Will be updated with the actual ID in a real implementation
          activity_type: "Add",
          quantity: Number.parseInt(formData.quantity),
          weight_kg: Number.parseFloat(formData.weightKg),
          purpose_notes: `Added ${getMaterialName()}`,
          user_id: user.id,
        },
      ])

      onSuccess()
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to add raw material")
    } finally {
      setLoading(false)
    }
  }

  const getMaterialName = () => {
    if (activeTab === "Paper") {
      const paperType = paperTypes.find((p) => p.id === formData.paperTypeId)
      return `${paperType?.name || "Paper"} ${formData.gsm}GSM ${formData.bf}BF`
    } else if (activeTab === "StitchingWire") {
      return `${formData.stitchingWireType} Wire`
    } else {
      return `${formData.gumType} Gum`
    }
  }

  const resetForm = () => {
    setFormData({
      dateAdded: new Date().toISOString().split("T")[0],
      quantity: "",
      weightKg: "",
      supplierId: "",
      invoiceNumber: "",
      materialForm: "Reel",
      paperTypeId: "",
      sizeWidthCm: "",
      sizeLxBCm: { length: "", breadth: "" },
      gsm: "",
      bf: "",
      ratePerKg: "",
      stitchingWireType: "",
      gumType: "",
    })
    setActiveTab("Paper")
    setError("")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Add Raw Material</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="Paper">Paper</TabsTrigger>
                <TabsTrigger value="StitchingWire">Stitching Wire</TabsTrigger>
                <TabsTrigger value="GumPowder">Gum Powder</TabsTrigger>
              </TabsList>

              {/* Common Fields */}
              <div className="grid grid-cols-2 gap-4 mt-4">
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
                <div>
                  <Label htmlFor="supplier">Supplier Name</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddSupplier(true)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ratePerKg">Rate (₹/kg)</Label>
                  <Input
                    id="ratePerKg"
                    type="number"
                    step="0.01"
                    value={formData.ratePerKg}
                    onChange={(e) => setFormData({ ...formData, ratePerKg: e.target.value })}
                  />
                </div>
              </div>

              <TabsContent value="Paper" className="space-y-4">
                <div>
                  <Label>Material Form</Label>
                  <RadioGroup
                    value={formData.materialForm}
                    onValueChange={(value) => setFormData({ ...formData, materialForm: value })}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Reel" id="reel" />
                      <Label htmlFor="reel">Reel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sheet" id="sheet" />
                      <Label htmlFor="sheet">Sheet</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paperType">Paper Type</Label>
                    <Select
                      value={formData.paperTypeId}
                      onValueChange={(value) => setFormData({ ...formData, paperTypeId: value })}
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

                  {formData.materialForm === "Reel" && (
                    <div>
                      <Label htmlFor="sizeWidth">Size (Width) in cm</Label>
                      <Input
                        id="sizeWidth"
                        type="number"
                        step="0.1"
                        value={formData.sizeWidthCm}
                        onChange={(e) => setFormData({ ...formData, sizeWidthCm: e.target.value })}
                      />
                    </div>
                  )}

                  {formData.materialForm === "Sheet" && (
                    <>
                      <div>
                        <Label htmlFor="sizeLength">Length (cm)</Label>
                        <Input
                          id="sizeLength"
                          type="number"
                          step="0.1"
                          value={formData.sizeLxBCm.length}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sizeLxBCm: { ...formData.sizeLxBCm, length: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="sizeBreadth">Breadth (cm)</Label>
                        <Input
                          id="sizeBreadth"
                          type="number"
                          step="0.1"
                          value={formData.sizeLxBCm.breadth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sizeLxBCm: { ...formData.sizeLxBCm, breadth: e.target.value },
                            })
                          }
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="gsm">GSM</Label>
                    <Input
                      id="gsm"
                      type="number"
                      value={formData.gsm}
                      onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bf">BF</Label>
                    <Input
                      id="bf"
                      type="number"
                      value={formData.bf}
                      onChange={(e) => setFormData({ ...formData, bf: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="StitchingWire" className="space-y-4">
                <div>
                  <Label htmlFor="stitchingWireType">Type of Stitching Wire</Label>
                  <Input
                    id="stitchingWireType"
                    value={formData.stitchingWireType}
                    onChange={(e) => setFormData({ ...formData, stitchingWireType: e.target.value })}
                    placeholder="e.g., Galvanized, Stainless Steel"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="GumPowder" className="space-y-4">
                <div>
                  <Label htmlFor="gumType">Type of Gum</Label>
                  <Input
                    id="gumType"
                    value={formData.gumType}
                    onChange={(e) => setFormData({ ...formData, gumType: e.target.value })}
                    placeholder="e.g., Starch Based, Dextrin"
                    required
                  />
                </div>
              </TabsContent>
            </Tabs>

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
                {loading ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AddSupplierModal
        open={showAddSupplier}
        onClose={() => setShowAddSupplier(false)}
        onSuccess={() => {
          setShowAddSupplier(false)
          fetchSuppliers()
        }}
      />
    </>
  )
}
