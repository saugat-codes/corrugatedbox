import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if we're in development mode (no Supabase configured)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const isDevelopmentMode = !supabaseUrl || 
    !supabaseAnonKey || 
    supabaseUrl.includes("demo-project") || 
    supabaseUrl === "your_supabase_project_url_here"
  
  // Only apply auth middleware to dashboard routes and when Supabase is configured
  if (!isDevelopmentMode && (
      req.nextUrl.pathname.startsWith('/dashboard') || 
      req.nextUrl.pathname.startsWith('/raw-materials') ||
      req.nextUrl.pathname.startsWith('/finished-goods') ||
      req.nextUrl.pathname.startsWith('/wastage-sales') ||
      req.nextUrl.pathname.startsWith('/stock-logs') ||
      req.nextUrl.pathname.startsWith('/profile') ||
      req.nextUrl.pathname.startsWith('/settings'))) {
    
    try {
      const supabase = createMiddlewareClient({ req, res })
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Redirect to login if no session
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      // On error, redirect to login
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/raw-materials/:path*',
    '/finished-goods/:path*',
    '/wastage-sales/:path*',
    '/stock-logs/:path*',
    '/profile/:path*',
    '/settings/:path*'
  ]
}
