"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface ExportWastageSalesModalProps {
  open: boolean
  onClose: () => void
}

export default function ExportWastageSalesModal({ open, onClose }: ExportWastageSalesModalProps) {
  const [exportDate, setExportDate] = useState(new Date().toISOString().split("T")[0])
  const [dateRange, setDateRange] = useState("")
  const [loading, setLoading] = useState(false)

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
            <DialogTitle>Export Wastage Sales</DialogTitle>
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
                <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
              </SelectContent>
            </Select>
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
