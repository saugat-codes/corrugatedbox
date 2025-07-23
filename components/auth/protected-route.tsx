"use client"

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/')
    }
  }, [user, loading, requireAuth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-red-100 text-red-800 p-4 rounded mb-4 font-semibold">
          Authentication session missing or expired. Please log in again.
        </div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded"
          onClick={() => router.push("/")}
        >
          Go to Login
        </button>
      </div>
    )
  }

  return <>{children}</>
}
