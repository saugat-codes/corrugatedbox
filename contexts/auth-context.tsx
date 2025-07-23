"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { isDevelopmentMode, mockUser, isRealError } from '@/lib/supabase-client'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  permissions?: any
  created_at?: string
  access_code?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Initial session check
    checkSession()

    if (!isDevelopmentMode()) {
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event)
        
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchUserProfile(session.user.id)
        }
      })

      return () => {
        subscription?.unsubscribe()
      }
    }
  }, [])

  const checkSession = async () => {
    try {
      if (isDevelopmentMode()) {
        const storedSession = localStorage.getItem("mock-session")
        const storedUser = localStorage.getItem("mock-user")
        
        if (storedSession && storedUser) {
          const session = JSON.parse(storedSession)
          if (session.expires_at > Date.now()) {
            setUser(JSON.parse(storedUser))
          } else {
            localStorage.removeItem("mock-session")
            localStorage.removeItem("mock-user")
          }
        }
      } else {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setUser(null)
        } else if (session) {
          await fetchUserProfile(session.user.id)
        }
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Only log meaningful errors
      if (isRealError(error)) {
        console.error('User profile fetch error:', error)
        // Fallback to auth user data
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email!,
            role: 'user'
          })
        }
      } else if (userData) {
        setUser(userData)
      } else {
        // No user profile found (empty result), create fallback user
        console.log('No user profile found in database, creating fallback user data')
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          const fallbackUser = {
            id: authUser.id,
            email: authUser.email!,
            full_name: authUser.user_metadata?.full_name || authUser.email!,
            role: 'user'
          }
          setUser(fallbackUser)
          
          // Optionally, create the user profile in the database
          try {
            await supabase.from('users').insert([fallbackUser])
            console.log('Created user profile in database')
          } catch (insertError) {
            console.log('Could not create user profile, continuing with fallback data')
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signOut = async () => {
    try {
      if (isDevelopmentMode()) {
        localStorage.removeItem("mock-user")
        localStorage.removeItem("mock-session")
      } else {
        await supabase.auth.signOut()
      }
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      // Force sign out
      setUser(null)
      router.push('/')
    }
  }

  const refreshUser = async () => {
    if (isDevelopmentMode()) {
      await checkSession()
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await fetchUserProfile(session.user.id)
      }
    }
  }

  const value = {
    user,
    loading,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
