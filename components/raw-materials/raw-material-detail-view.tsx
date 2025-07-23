"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Package } from "lucide-react"
import UseStockModal from "./use-stock-modal"
import ConvertStockModal from "./convert-stock-modal"

interface RawMaterial {
  id: string
  name: string
  type: string
  quantity: number
  weight_kg: number
  rate_per_kg?: number
  gsm?: number
  bf?: number
  size_width_cm?: number
  size_lxb_cm?: any
  suppliers?: { name: string }
  paper_types?: { name: string }
}

interface RawMaterialDetailViewProps {
  materialName: string
  materials: RawMaterial[]
  onBack: () => void
  onRefresh: () => void
}

export default function RawMaterialDetailView({
  materialName,
  materials,
  onBack,
  onRefresh,
}: RawMaterialDetailViewProps) {
  const [user, setUser] = useState<any>(null)
  const [showUseStock, setShowUseStock] = useState(false)
  const [showConvertStock, setShowConvertStock] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()
      setUser(userData)
    }
  }

  const totalQuantity = materials.reduce((sum, m) => sum + m.quantity, 0)
  const totalWeight = materials.reduce((sum, m) => sum + m.weight_kg, 0)
  const totalAmount = materials.reduce((sum, m) => sum + (m.rate_per_kg || 0) * m.weight_kg, 0)

  const canModify = user?.role === "admin" || user?.permissions?.rawMaterials?.modify

  const handleUseStock = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setShowUseStock(true)
  }

  const handleConvertStock = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setShowConvertStock(true)
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm("Are you sure you want to delete this material?")) return

    try {
      const { error } = await supabase.from("raw_materials").delete().eq("id", materialId)

      if (error) throw error

      onRefresh()
    } catch (error) {
      console.error("Error deleting material:", error)
      alert("Failed to delete material")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Summary
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{materialName} Details</h2>
            <p className="text-gray-600">
              Showing {materials.length} items | Total: {totalQuantity} qty, {totalWeight.toFixed(2)} kg | Amount: ₹
              {totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{materialName}</CardTitle>
          <CardDescription>Detailed breakdown of all {materialName} inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SIZE</TableHead>
                <TableHead>GSM</TableHead>
                <TableHead>BF</TableHead>
                <TableHead>QUANTITY</TableHead>
                <TableHead>WEIGHT</TableHead>
                <TableHead>AMOUNT</TableHead>
                <TableHead>SUPPLIER</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    {material.size_width_cm
                      ? `${material.size_width_cm}cm (W)`
                      : material.size_lxb_cm
                        ? `${material.size_lxb_cm.length}×${material.size_lxb_cm.breadth}cm`
                        : "N/A"}
                  </TableCell>
                  <TableCell>{material.gsm || "N/A"}</TableCell>
                  <TableCell>{material.bf || "N/A"}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{material.weight_kg.toFixed(2)} kg</TableCell>
                  <TableCell>₹{((material.rate_per_kg || 0) * material.weight_kg).toFixed(2)}</TableCell>
                  <TableCell>{material.suppliers?.name || "N/A"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canModify && (
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleUseStock(material)}>
                          <Package className="h-4 w-4 mr-2" />
                          Use Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleConvertStock(material)}>
                          <Package className="h-4 w-4 mr-2" />
                          Convert Stock
                        </DropdownMenuItem>
                        {canModify && (
                          <DropdownMenuItem onClick={() => handleDelete(material.id)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedMaterial && (
        <>
          <UseStockModal
            open={showUseStock}
            onClose={() => {
              setShowUseStock(false)
              setSelectedMaterial(null)
            }}
            material={selectedMaterial}
            onSuccess={onRefresh}
          />
          <ConvertStockModal
            open={showConvertStock}
            onClose={() => {
              setShowConvertStock(false)
              setSelectedMaterial(null)
            }}
            material={selectedMaterial}
            onSuccess={onRefresh}
          />
        </>
      )}
    </div>
  )
}
