"use client"

import type React from "react"

import { useAuth } from '@/contexts/auth-context'
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, LayoutDashboard, Package2, Trash2, FileText, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import ProtectedRoute from "@/components/auth/protected-route"
import { usePermissions, MODULES } from "@/hooks/use-permissions"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading, signOut } = useAuth()
  const { canView, isAdmin } = usePermissions()
  const pathname = usePathname()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", permission: null },
    { href: "/raw-materials", icon: Package2, label: "Raw Materials", permission: MODULES.RAW_MATERIALS },
    { href: "/finished-goods", icon: Package, label: "Finished Goods", permission: MODULES.FINISHED_GOODS },
    { href: "/wastage-sales", icon: Trash2, label: "Wastage Sales", permission: MODULES.WASTAGE_SALES },
    { href: "/stock-logs", icon: FileText, label: "Stock Logs", permission: MODULES.STOCK_LOGS },
  ]

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter(item => 
    !item.permission || canView(item.permission)
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">The Corrugated Box</h1>
                <p className="text-xs text-gray-600">Inventory Management System</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {visibleMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                )
              })}

              {/* Settings - Admin Only */}
              {isAdmin && (
                <Link
                  href="/settings"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/settings"
                      ? "bg-green-100 text-green-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </Link>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="pl-64">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex-1" />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-purple-600 text-white">
                        {user ? getInitials(user.full_name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.full_name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
