"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Download, TrendingUp } from "lucide-react"
import AddWastageSaleModal from "@/components/wastage-sales/add-wastage-sale-modal"
import ExportWastageSalesModal from "@/components/wastage-sales/export-wastage-sales-modal"

interface WastageSale {
  id: string
  date: string
  item_description: string
  quantity: number
  weight_kg: number
  sale_amount: number
  notes?: string
  users?: { full_name: string }
  created_at: string
}

interface WastageSummary {
  totalSales: number
  totalWeight: number
  totalAmount: number
  averageRate: number
}

export default function WastageSalesPage() {
  const [wastageSales, setWastageSales] = useState<WastageSale[]>([])
  const [summary, setSummary] = useState<WastageSummary>({
    totalSales: 0,
    totalWeight: 0,
    totalAmount: 0,
    averageRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchWastageSales()
  }, [])

  const fetchWastageSales = async () => {
    try {
      const { data, error } = await supabase
        .from("wastage_sales")
        .select(`
          *,
          users(full_name)
        `)
        .order("date", { ascending: false })

      if (error) throw error

      setWastageSales(data || [])

      // Calculate summary
      const totalSales = data?.length || 0
      const totalWeight = data?.reduce((sum, sale) => sum + sale.weight_kg, 0) || 0
      const totalAmount = data?.reduce((sum, sale) => sum + sale.sale_amount, 0) || 0
      const averageRate = totalWeight > 0 ? totalAmount / totalWeight : 0

      setSummary({
        totalSales,
        totalWeight,
        totalAmount,
        averageRate,
      })
    } catch (error) {
      console.error("Error fetching wastage sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredWastageSales = wastageSales.filter(
    (sale) =>
      sale.item_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.notes?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Wastage Sales</h1>
          <p className="text-gray-600">Track and manage sales of waste materials and scraps.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalSales}</div>
              <p className="text-xs text-muted-foreground">wastage transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalWeight.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground">waste material sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">from wastage sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.averageRate.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">per kg</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search wastage sales... (e.g., 'paper scraps', 'cardboard waste')"
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
              Add Wastage Sale
            </Button>
          </div>
        </div>

        {/* Wastage Sales Table */}
        <Card>
          <CardHeader>
            <CardTitle>Wastage Sales Records</CardTitle>
            <CardDescription>All wastage sales transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead>Sale Amount</TableHead>
                  <TableHead>Rate/kg</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Added By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWastageSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{sale.item_description}</TableCell>
                    <TableCell>{sale.quantity}</TableCell>
                    <TableCell>{sale.weight_kg.toFixed(2)} kg</TableCell>
                    <TableCell>₹{sale.sale_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">₹{(sale.sale_amount / sale.weight_kg).toFixed(2)}/kg</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{sale.notes || "-"}</TableCell>
                    <TableCell>{sale.users?.full_name || "Unknown"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AddWastageSaleModal open={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={fetchWastageSales} />

        <ExportWastageSalesModal open={showExportModal} onClose={() => setShowExportModal(false)} />
      </div>
    </DashboardLayout>
  )
}
