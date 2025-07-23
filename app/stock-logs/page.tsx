"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Filter, Activity } from "lucide-react"
import ExportStockLogsModal from "@/components/stock-logs/export-stock-logs-modal"

interface StockLog {
  id: string
  activity_type: "Add" | "Use" | "Convert" | "Dispatch" | "Wastage"
  quantity: number
  weight_kg: number
  purpose_notes?: string
  timestamp: string
  raw_materials?: { name: string }
  finished_goods?: { box_name: string }
  users?: { full_name: string }
}

interface ActivitySummary {
  totalActivities: number
  addActivities: number
  useActivities: number
  dispatchActivities: number
  wastageActivities: number
}

export default function StockLogsPage() {
  const [stockLogs, setStockLogs] = useState<StockLog[]>([])
  const [summary, setSummary] = useState<ActivitySummary>({
    totalActivities: 0,
    addActivities: 0,
    useActivities: 0,
    dispatchActivities: 0,
    wastageActivities: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activityFilter, setActivityFilter] = useState("all")
  const [showExportModal, setShowExportModal] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStockLogs()
  }, [])

  const fetchStockLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_logs")
        .select(`
          *,
          raw_materials(name),
          finished_goods(box_name),
          users(full_name)
        `)
        .order("timestamp", { ascending: false })

      if (error) throw error

      setStockLogs(data || [])

      // Calculate summary
      const totalActivities = data?.length || 0
      const addActivities = data?.filter((log) => log.activity_type === "Add").length || 0
      const useActivities = data?.filter((log) => log.activity_type === "Use").length || 0
      const dispatchActivities = data?.filter((log) => log.activity_type === "Dispatch").length || 0
      const wastageActivities = data?.filter((log) => log.activity_type === "Wastage").length || 0

      setSummary({
        totalActivities,
        addActivities,
        useActivities,
        dispatchActivities,
        wastageActivities,
      })
    } catch (error) {
      console.error("Error fetching stock logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityBadgeColor = (activityType: string) => {
    switch (activityType) {
      case "Add":
        return "bg-green-100 text-green-800"
      case "Use":
        return "bg-blue-100 text-blue-800"
      case "Convert":
        return "bg-purple-100 text-purple-800"
      case "Dispatch":
        return "bg-orange-100 text-orange-800"
      case "Wastage":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredStockLogs = stockLogs.filter((log) => {
    const matchesSearch =
      log.raw_materials?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.finished_goods?.box_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.purpose_notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.users?.full_name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = activityFilter === "all" || log.activity_type === activityFilter

    return matchesSearch && matchesFilter
  })

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
          <h1 className="text-3xl font-bold text-gray-900">Stock Logs</h1>
          <p className="text-gray-600">Track all inventory movements and activities.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalActivities}</div>
              <p className="text-xs text-muted-foreground">all time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Added</CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{summary.addActivities}</div>
              <p className="text-xs text-muted-foreground">additions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Used</CardTitle>
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.useActivities}</div>
              <p className="text-xs text-muted-foreground">usage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dispatched</CardTitle>
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.dispatchActivities}</div>
              <p className="text-xs text-muted-foreground">dispatches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wastage</CardTitle>
              <div className="h-2 w-2 rounded-full bg-red-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{summary.wastageActivities}</div>
              <p className="text-xs text-muted-foreground">wastage</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stock logs... (material, user, notes)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={activityFilter} onValueChange={setActivityFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="Add">Add Stock</SelectItem>
                <SelectItem value="Use">Use Stock</SelectItem>
                <SelectItem value="Convert">Convert Stock</SelectItem>
                <SelectItem value="Dispatch">Dispatch</SelectItem>
                <SelectItem value="Wastage">Wastage</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowExportModal(true)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stock Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Activity Log</CardTitle>
            <CardDescription>
              Showing {filteredStockLogs.length} of {stockLogs.length} activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Purpose/Notes</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStockLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getActivityBadgeColor(log.activity_type)}>{log.activity_type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.raw_materials?.name || log.finished_goods?.box_name || "Unknown Item"}
                    </TableCell>
                    <TableCell>{log.quantity}</TableCell>
                    <TableCell>{log.weight_kg.toFixed(2)} kg</TableCell>
                    <TableCell className="max-w-xs truncate">{log.purpose_notes || "-"}</TableCell>
                    <TableCell>{log.users?.full_name || "Unknown"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <ExportStockLogsModal open={showExportModal} onClose={() => setShowExportModal(false)} />
      </div>
    </DashboardLayout>
  )
}
