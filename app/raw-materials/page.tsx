"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Search, Download, Eye, Package } from "lucide-react"
import AddRawMaterialModal from "@/components/raw-materials/add-raw-material-modal"
import AddSupplierModal from "@/components/raw-materials/add-supplier-modal"
import ExportRawMaterialsModal from "@/components/raw-materials/export-raw-materials-modal"
import RawMaterialDetailView from "@/components/raw-materials/raw-material-detail-view"
import UseStockModal from "@/components/raw-materials/use-stock-modal"
import ConvertStockModal from "@/components/raw-materials/convert-stock-modal"
import AuthDebug from "@/components/debug/auth-debug"
import DashboardLayout from "@/components/layout/dashboard-layout";

interface RawMaterial {
  id: string
  name: string
  type: "Paper" | "StitchingWire" | "GumPowder"
  date_added: string
  quantity: number
  weight_kg: number
  supplier_id: string | null
  invoice_number: string | null
  material_form: "Reel" | "Sheet" | null
  paper_type_id: string | null
  size_width_cm: number | null
  size_lxb_cm: any | null
  gsm: number | null
  bf: number | null
  stitching_wire_type_id: string | null
  gum_type_id: string | null
  rate_per_kg: number | null
  created_by_user_id: string | null
  created_at: string
  updated_at: string
  suppliers?: { name: string }
  paper_types?: { name: string }
  stitching_wire_types?: { name: string }
  gum_types?: { name: string }
}

interface Supplier {
  id: string
  name: string
}

export default function RawMaterialsPage() {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showUseStockModal, setShowUseStockModal] = useState(false)
  const [showConvertStockModal, setShowConvertStockModal] = useState(false)
  const [showDebug, setShowDebug] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError("")

    try {
      // Fetch raw materials with related data
      const { data: materialsData, error: materialsError } = await supabase
        .from("raw_materials")
        .select(`
          *,
          suppliers (name),
          paper_types (name),
          stitching_wire_types (name),
          gum_types (name)
        `)
        .order("created_at", { ascending: false })

      if (materialsError) throw materialsError

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase.from("suppliers").select("*").order("name")

      if (suppliersError) throw suppliersError

      setRawMaterials(materialsData || [])
      setSuppliers(suppliersData || [])
    } catch (err: any) {
      console.error("Error fetching data:", err)
      setError(err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddSuccess = () => {
    fetchData()
    setShowAddModal(false)
  }

  const handleAddSupplierSuccess = () => {
    fetchData()
    setShowAddSupplierModal(false)
  }

  const handleViewDetails = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setShowDetailView(true)
  }

  const handleUseStock = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setShowUseStockModal(true)
  }

  const handleConvertStock = (material: RawMaterial) => {
    setSelectedMaterial(material)
    setShowConvertStockModal(true)
  }

  const handleStockAction = () => {
    fetchData()
    setShowUseStockModal(false)
    setShowConvertStockModal(false)
  }

  const filteredMaterials = rawMaterials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = selectedType === "all" || material.type === selectedType

    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Paper":
        return "bg-blue-100 text-blue-800"
      case "StitchingWire":
        return "bg-green-100 text-green-800"
      case "GumPowder":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalValue = rawMaterials.reduce((sum, material) => {
    return sum + material.weight_kg * (material.rate_per_kg || 0)
  }, 0)

  const totalWeight = rawMaterials.reduce((sum, material) => sum + material.weight_kg, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading raw materials...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Raw Materials</h1>
            <p className="text-gray-600 mt-2">Manage your raw material inventory</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => setShowDebug(!showDebug)} variant="outline" size="sm">
              {showDebug ? "Hide Debug" : "Show Debug"}
            </Button>
            <Button onClick={() => setShowAddSupplierModal(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Supplier
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Raw Material
            </Button>
          </div>
        </div>

        {showDebug && (
          <div className="mb-8">
            <AuthDebug />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rawMaterials.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWeight.toFixed(2)} kg</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search materials, suppliers, or invoice numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="Paper">Paper</option>
            <option value="StitchingWire">Stitching Wire</option>
            <option value="GumPowder">Gum Powder</option>
          </select>

          <Button onClick={() => setShowExportModal(true)} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <Badge className={`mt-2 ${getTypeColor(material.type)}`}>{material.type}</Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(material)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <span className="font-medium">{material.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Weight:</span>
                    <span className="font-medium">{material.weight_kg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Supplier:</span>
                    <span className="font-medium">{material.suppliers?.name || "N/A"}</span>
                  </div>
                  {material.rate_per_kg && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rate:</span>
                      <span className="font-medium">₹{material.rate_per_kg}/kg</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Added:</span>
                    <span className="font-medium">{new Date(material.date_added).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleUseStock(material)} className="flex-1">
                    Use Stock
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleConvertStock(material)} className="flex-1">
                    Convert
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No raw materials found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by adding your first raw material."}
            </p>
            {!searchTerm && selectedType === "all" && (
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Raw Material
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <AddRawMaterialModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddSuccess}
          suppliers={suppliers}
        />

        <AddSupplierModal
          open={showAddSupplierModal}
          onClose={() => setShowAddSupplierModal(false)}
          onSuccess={handleAddSupplierSuccess}
        />

        <ExportRawMaterialsModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          rawMaterials={filteredMaterials}
        />

        {selectedMaterial && (
          <>
            <RawMaterialDetailView
              open={showDetailView}
              onClose={() => setShowDetailView(false)}
              material={selectedMaterial}
            />

            <UseStockModal
              open={showUseStockModal}
              onClose={() => setShowUseStockModal(false)}
              onSuccess={handleStockAction}
              material={selectedMaterial}
            />

            <ConvertStockModal
              open={showConvertStockModal}
              onClose={() => setShowConvertStockModal(false)}
              onSuccess={handleStockAction}
              material={selectedMaterial}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
