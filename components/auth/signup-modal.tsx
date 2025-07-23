"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import CreateAdminModal from "./create-admin-modal"
import CreateUserModal from "./create-user-modal"

interface SignUpModalProps {
  open: boolean
  onClose: () => void
}

export default function SignUpModal({ open, onClose }: SignUpModalProps) {
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)

  const handleRoleSelection = (role: "admin" | "user") => {
    if (role === "admin") {
      setShowAdminModal(true)
    } else {
      setShowUserModal(true)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Create an Account</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">Are you an admin or a user? Choose your role to continue.</p>

            <div className="space-y-3">
              <Button
                onClick={() => handleRoleSelection("admin")}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                Admin
              </Button>
              <Button onClick={() => handleRoleSelection("user")} variant="outline" className="w-full" size="lg">
                User
              </Button>
            </div>

            <Button type="button" variant="ghost" onClick={onClose} className="w-full">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateAdminModal
        open={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onBack={() => {
          setShowAdminModal(false)
          // Don't close the main modal, just go back to role selection
        }}
      />
      <CreateUserModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        onBack={() => {
          setShowUserModal(false)
          // Don't close the main modal, just go back to role selection
        }}
      />
    </>
  )
}
