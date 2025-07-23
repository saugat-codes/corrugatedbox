import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { isSupabaseConfigured } from "@/lib/supabase-client"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "The Corrugated Box - Inventory Management",
  description: "Complete inventory management system for corrugated box manufacturing",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {!isSupabaseConfigured() && (
          <div className="bg-red-100 text-red-800 p-4 text-center font-semibold">
            Supabase is not configured. Please check your environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).
          </div>
        )}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
