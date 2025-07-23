"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MoreHorizontal, Edit, Trash2, Truck } from "lucide-react"
import DispatchFinishedGoodModal from "./dispatch-finished-good-modal"

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

interface FinishedGoodDetailViewProps {
  boxName: string
  finishedGoods: FinishedGood[]
  onBack: () => void
  onRefresh: () => void
}

export default function FinishedGoodDetailView({
  boxName,
  finishedGoods,
  onBack,
  onRefresh,
}: FinishedGoodDetailViewProps) {
  const [user, setUser] = useState<any>(null)
  const [showDispatch, setShowDispatch] = useState(false)
  const [selectedFinishedGood, setSelectedFinishedGood] = useState<FinishedGood | null>(null)

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

  const totalQuantity = finishedGoods.reduce((sum, g) => sum + g.quantity_pcs, 0)
  const totalWeight = finishedGoods.reduce((sum, g) => sum + g.quantity_pcs * g.weight_one_box_kg, 0)
  const totalAmount = finishedGoods.reduce((sum, g) => sum + (g.rate_per_piece || 0) * g.quantity_pcs, 0)

  const canModify = user?.role === "admin" || user?.permissions?.finishedGoods?.modify

  const handleDispatch = (finishedGood: FinishedGood) => {
    setSelectedFinishedGood(finishedGood)
    setShowDispatch(true)
  }

  const handleDelete = async (finishedGoodId: string) => {
    if (!confirm("Are you sure you want to delete this finished good?")) return

    try {
      const { error } = await supabase.from("finished_goods").delete().eq("id", finishedGoodId)

      if (error) throw error

      onRefresh()
    } catch (error) {
      console.error("Error deleting finished good:", error)
      alert("Failed to delete finished good")
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
            <h2 className="text-2xl font-bold">{boxName} Details</h2>
            <p className="text-gray-600">
              Showing {finishedGoods.length} batches | Total: {totalQuantity} pcs, {totalWeight.toFixed(2)} kg | Amount:
              ₹{totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{boxName}</CardTitle>
          <CardDescription>Detailed breakdown of all {boxName} inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CUSTOMER</TableHead>
                <TableHead>DIMENSIONS</TableHead>
                <TableHead>PLY</TableHead>
                <TableHead>QUANTITY</TableHead>
                <TableHead>WEIGHT/BOX</TableHead>
                <TableHead>TOTAL WEIGHT</TableHead>
                <TableHead>AMOUNT</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {finishedGoods.map((good) => (
                <TableRow key={good.id}>
                  <TableCell>{good.customers?.name || "Unknown"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {good.length_cm}×{good.height_cm}×{good.width_cm}cm
                    </Badge>
                  </TableCell>
                  <TableCell>{good.number_of_ply} ply</TableCell>
                  <TableCell>{good.quantity_pcs} pcs</TableCell>
                  <TableCell>{good.weight_one_box_kg.toFixed(3)} kg</TableCell>
                  <TableCell>{(good.quantity_pcs * good.weight_one_box_kg).toFixed(2)} kg</TableCell>
                  <TableCell>₹{((good.rate_per_piece || 0) * good.quantity_pcs).toFixed(2)}</TableCell>
                  <TableCell>{new Date(good.date_added).toLocaleDateString()}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleDispatch(good)}>
                          <Truck className="h-4 w-4 mr-2" />
                          Dispatch
                        </DropdownMenuItem>
                        {canModify && (
                          <DropdownMenuItem onClick={() => handleDelete(good.id)} className="text-red-600">
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

      {selectedFinishedGood && (
        <DispatchFinishedGoodModal
          open={showDispatch}
          onClose={() => {
            setShowDispatch(false)
            setSelectedFinishedGood(null)
          }}
          finishedGood={selectedFinishedGood}
          onSuccess={onRefresh}
        />
      )}
    </div>
  )
}
