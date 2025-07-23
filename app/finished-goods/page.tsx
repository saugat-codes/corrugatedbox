"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Download, Eye } from "lucide-react"
import AddFinishedGoodModal from "@/components/finished-goods/add-finished-good-modal"
import ExportFinishedGoodsModal from "@/components/finished-goods/export-finished-goods-modal"
import FinishedGoodDetailView from "@/components/finished-goods/finished-good-detail-view"

interface FinishedGood {
  id: string
  box_name: string
  customer_id: string
  length_cm: number
  height_cm: number
  width_cm: number
  number_of_ply: number
  quantity_pcs: number
  weight_one_box_kg: number
  rate_per_piece?: number
  date_added: string
  customers?: { name: string }
  box_types?: { name: string }
  printing_types?: { name: string }
  paper_types?: { name: string }
}

interface FinishedGoodSummary {
  box_name: string
  customer_name: string
  totalQuantity: number
  totalWeight: number
  totalAmount: number
  dimensions: string
}

export default function FinishedGoodsPage() {
  const [finishedGoods, setFinishedGoods] = useState<FinishedGood[]>([])
  const [finishedGoodsSummary, setFinishedGoodsSummary] = useState<FinishedGoodSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedFinishedGood, setSelectedFinishedGood] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("summary")

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchFinishedGoods()
  }, [])

  const fetchFinishedGoods = async () => {
    try {
      const { data, error } = await supabase
        .from("finished_goods")
        .select(`
          *,
          customers(name),
          box_types(name),
          printing_types(name),
          paper_types(name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      setFinishedGoods(data || [])

      // Calculate summary
      const summary = calculateFinishedGoodsSummary(data || [])
      setFinishedGoodsSummary(summary)
    } catch (error) {
      console.error("Error fetching finished goods:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateFinishedGoodsSummary = (goods: FinishedGood[]): FinishedGoodSummary[] => {
    const summaryMap = new Map<string, FinishedGoodSummary>()

    goods.forEach((good) => {
      const key = `${good.box_name}-${good.customer_id}`
      const existing = summaryMap.get(key)
      const totalWeight = good.quantity_pcs * good.weight_one_box_kg
      const totalAmount = (good.rate_per_piece || 0) * good.quantity_pcs
      const dimensions = `${good.length_cm}×${good.height_cm}×${good.width_cm}cm`

      if (existing) {
        existing.totalQuantity += good.quantity_pcs
        existing.totalWeight += totalWeight
        existing.totalAmount += totalAmount
      } else {
        summaryMap.set(key, {
          box_name: good.box_name,
          customer_name: good.customers?.name || "Unknown Customer",
          totalQuantity: good.quantity_pcs,
          totalWeight: totalWeight,
          totalAmount: totalAmount,
          dimensions: dimensions,
        })
      }
    })

    return Array.from(summaryMap.values())
  }

  const filteredSummary = finishedGoodsSummary.filter(
    (item) =>
      item.box_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredFinishedGoods = finishedGoods.filter(
    (good) =>
      good.box_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      good.customers?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleViewDetails = (boxName: string) => {
    setSelectedFinishedGood(boxName)
    setActiveTab("detail")
  }

  const handleBackToSummary = () => {
    setSelectedFinishedGood(null)
    setActiveTab("summary")
  }

  if (loading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Finished Goods</h1>
          <p className="text-gray-600">Manage your finished goods inventory and dispatch.</p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search finished goods... (e.g., 'RSC Box for ABC Corp')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Finished Good
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="summary">Summary View</TabsTrigger>
            <TabsTrigger value="detail">Detail View</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Finished Goods Summary</CardTitle>
                <CardDescription>Overview of all finished goods ready for dispatch</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Box Name</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Dimensions</TableHead>
                      <TableHead>Total Quantity</TableHead>
                      <TableHead>Total Weight</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSummary.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.box_name}</TableCell>
                        <TableCell>{item.customer_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.dimensions}</Badge>
                        </TableCell>
                        <TableCell>{item.totalQuantity} pcs</TableCell>
                        <TableCell>{item.totalWeight.toFixed(2)} kg</TableCell>
                        <TableCell>₹{item.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(item.box_name)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="detail" className="space-y-4">
            {selectedFinishedGood ? (
              <FinishedGoodDetailView
                boxName={selectedFinishedGood}
                finishedGoods={filteredFinishedGoods.filter((g) => g.box_name === selectedFinishedGood)}
                onBack={handleBackToSummary}
                onRefresh={fetchFinishedGoods}
              />
            ) : (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-gray-500">
                    Select a finished good from the summary view to see details
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <AddFinishedGoodModal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchFinishedGoods}
        />

        <ExportFinishedGoodsModal open={showExportModal} onClose={() => setShowExportModal(false)} />
      </div>
    </DashboardLayout>
  )
}
