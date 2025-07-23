"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

interface ExportStockLogsModalProps {
  open: boolean
  onClose: () => void
}

export default function ExportStockLogsModal({ open, onClose }: ExportStockLogsModalProps) {
  const [exportDate, setExportDate] = useState(new Date().toISOString().split("T")[0])
  const [dateRange, setDateRange] = useState("")
  const [activityTypes, setActivityTypes] = useState({
    add: true,
    use: true,
    convert: true,
    dispatch: true,
    wastage: true,
  })
  const [loading, setLoading] = useState(false)

  const handleActivityTypeChange = (type: string, checked: boolean) => {
    setActivityTypes((prev) => ({ ...prev, [type]: checked }))
  }

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate PDF export
    setTimeout(() => {
      alert("PDF export functionality would be implemented here")
      setLoading(false)
      onClose()
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Export Stock Logs</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleExport} className="space-y-4">
          <div>
            <Label htmlFor="exportDate">Export Date</Label>
            <Input
              id="exportDate"
              type="date"
              value={exportDate}
              onChange={(e) => setExportDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="dateRange">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Activity Types to Include</Label>
            <div className="space-y-2 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add"
                  checked={activityTypes.add}
                  onCheckedChange={(checked) => handleActivityTypeChange("add", checked as boolean)}
                />
                <Label htmlFor="add" className="text-sm">
                  Add Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use"
                  checked={activityTypes.use}
                  onCheckedChange={(checked) => handleActivityTypeChange("use", checked as boolean)}
                />
                <Label htmlFor="use" className="text-sm">
                  Use Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="convert"
                  checked={activityTypes.convert}
                  onCheckedChange={(checked) => handleActivityTypeChange("convert", checked as boolean)}
                />
                <Label htmlFor="convert" className="text-sm">
                  Convert Stock
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dispatch"
                  checked={activityTypes.dispatch}
                  onCheckedChange={(checked) => handleActivityTypeChange("dispatch", checked as boolean)}
                />
                <Label htmlFor="dispatch" className="text-sm">
                  Dispatch
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wastage"
                  checked={activityTypes.wastage}
                  onCheckedChange={(checked) => handleActivityTypeChange("wastage", checked as boolean)}
                />
                <Label htmlFor="wastage" className="text-sm">
                  Wastage
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Exporting..." : "Export PDF"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
