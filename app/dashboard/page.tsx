"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Truck, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"
import { supabase, isDevelopmentMode } from "@/lib/supabase-client"

interface DashboardStats {
  rawMaterials: {
    totalWeight: number
    totalItems: number
  }
  finishedGoods: {
    totalPieces: number
    totalWeight: number
  }
  lowStockAlerts: {
    count: number
    items: number
  }
  stockAdded: {
    weight: number
    period: string
  }
  stockDispatched: {
    pieces: number
    weight: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    rawMaterials: { totalWeight: 0, totalItems: 0 },
    finishedGoods: { totalPieces: 0, totalWeight: 0 },
    lowStockAlerts: { count: 0, items: 0 },
    stockAdded: { weight: 0, period: "Last 30 days" },
    stockDispatched: { pieces: 0, weight: 0 },
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const authSupabase = createClientComponentClient()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (isDevelopmentMode()) {
        // Mock data for development
        setStats({
          rawMaterials: { totalWeight: 1250, totalItems: 15 },
          finishedGoods: { totalPieces: 450, totalWeight: 2800 },
          lowStockAlerts: { count: 3, items: 5 },
          stockAdded: { weight: 1250, period: "Last 30 days" },
          stockDispatched: { pieces: 450, weight: 2800 },
        })

        setRecentActivity([
          {
            id: "1",
            activity_type: "Add",
            weight_kg: 100,
            raw_materials: { name: "Kraft Paper 120GSM" },
            users: { full_name: "Admin User" },
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            activity_type: "Dispatch",
            weight_kg: 50,
            finished_goods: { box_name: "RSC Box 12x8x6" },
            users: { full_name: "Admin User" },
            timestamp: new Date().toISOString(),
          },
        ])
      } else {
        // Real Supabase queries
        const { data: rawMaterials } = await supabase.from("raw_materials").select("quantity, weight_kg")
        const { data: finishedGoods } = await supabase.from("finished_goods").select("quantity_pcs, weight_one_box_kg")
        const { data: stockLogs } = await supabase
          .from("stock_logs")
          .select(`
          *,
          raw_materials(name),
          finished_goods(box_name),
          users(full_name)
        `)
          .order("timestamp", { ascending: false })
          .limit(10)

        // Calculate stats
        const rawMaterialsStats = rawMaterials?.reduce(
          (acc, item) => ({
            totalWeight: acc.totalWeight + (item.weight_kg || 0),
            totalItems: acc.totalItems + 1,
          }),
          { totalWeight: 0, totalItems: 0 },
        ) || { totalWeight: 0, totalItems: 0 }

        const finishedGoodsStats = finishedGoods?.reduce(
          (acc, item) => ({
            totalPieces: acc.totalPieces + (item.quantity_pcs || 0),
            totalWeight: acc.totalWeight + (item.quantity_pcs || 0) * (item.weight_one_box_kg || 0),
          }),
          { totalPieces: 0, totalWeight: 0 },
        ) || { totalPieces: 0, totalWeight: 0 }

        setStats({
          rawMaterials: rawMaterialsStats,
          finishedGoods: finishedGoodsStats,
          lowStockAlerts: { count: 3, items: 5 },
          stockAdded: { weight: 1250, period: "Last 30 days" },
          stockDispatched: { pieces: 450, weight: 2800 },
        })

        setRecentActivity(stockLogs || [])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Here's a quick overview of your inventory.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Raw Materials</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rawMaterials.totalWeight.toFixed(0)} kg</div>
              <p className="text-xs text-muted-foreground">Total inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finished Goods</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.finishedGoods.totalPieces} pcs</div>
              <p className="text-xs text-muted-foreground">
                {stats.finishedGoods.totalWeight.toFixed(0)} kg ready for dispatch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockAlerts.items} Items</div>
              <p className="text-xs text-muted-foreground">nearing reorder point</p>
              <Button variant="link" className="p-0 h-auto text-xs mt-1">
                View All Alerts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Added</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{stats.stockAdded.weight} kg</div>
              <p className="text-xs text-muted-foreground">{stats.stockAdded.period}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Dispatched</CardTitle>
              <TrendingDown className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stockDispatched.pieces} pcs</div>
              <p className="text-xs text-muted-foreground">{stats.stockDispatched.weight} kg total weight</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Raw Materials vs. Finished Goods</CardTitle>
              <CardDescription>Total weight of raw materials vs. finished goods over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Chart placeholder - Raw Materials vs Finished Goods</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest stock movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {activity.activity_type} - {activity.raw_materials?.name || activity.finished_goods?.box_name}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {activity.weight_kg}kg by {activity.users?.full_name}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchases vs. Dispatches</CardTitle>
              <CardDescription>Total raw materials purchased vs. finished goods dispatched over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Chart placeholder - Purchases vs Dispatches</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wastage Tracker</CardTitle>
              <CardDescription>Raw material usage vs. finished goods weight and wastage percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">Chart placeholder - Wastage Tracker</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
