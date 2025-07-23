import { createClient } from "@supabase/supabase-js"

// Supabase configuration with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Helper function to check if we're in development mode with mock data
export const isDevelopmentMode = () => {
  return (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("demo-project") ||
    supabaseUrl === "your_supabase_project_url_here"
  )
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("demo-project") &&
    supabaseUrl !== "your_supabase_project_url_here" &&
    supabaseAnonKey !== "your_supabase_anon_key_here" &&
    supabaseUrl.startsWith("https://")
  )
}

// Helper function to check if an error object has meaningful content
export const isRealError = (error: any) => {
  if (!error) return false
  return error.message || error.code || error.details || Object.keys(error).length > 0
}

// Create Supabase client with error handling
let supabase: any = null

try {
  if (isSupabaseConfigured()) {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
    })
  } else {
    // Create a mock client for development
    supabase = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () =>
          Promise.resolve({ data: null, error: { message: "Development mode - use any credentials" } }),
        signUp: () => Promise.resolve({ data: null, error: { message: "Development mode - signup disabled" } }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ error: null }),
        updateUser: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: [], error: null }),
        update: () => ({ data: [], error: null }),
        delete: () => ({ data: [], error: null }),
        eq: function () {
          return this
        },
        single: () => ({ data: null, error: null }),
        order: function () {
          return this
        },
        limit: function () {
          return this
        },
      }),
    }
  }
} catch (error) {
  console.warn("Failed to initialize Supabase client:", error)
  // Fallback to mock client
  supabase = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: "Supabase configuration error" } }),
      signUp: () => Promise.resolve({ data: null, error: { message: "Supabase configuration error" } }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ error: null }),
      updateUser: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
      eq: function () {
        return this
      },
      single: () => ({ data: null, error: null }),
      order: function () {
        return this
      },
      limit: function () {
        return this
      },
    }),
  }
}

export { supabase }

// Mock data for development fallback
export const mockUser = {
  id: "mock-user-id",
  email: "admin@example.com",
  full_name: "Admin User",
  role: "admin" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockSession = {
  user: {
    id: "mock-user-id",
    email: "admin@example.com",
  },
  access_token: "mock-token",
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: "admin" | "user"
          access_code: string | null
          permissions: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: "admin" | "user"
          access_code?: string | null
          permissions?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: "admin" | "user"
          access_code?: string | null
          permissions?: any
          created_at?: string
          updated_at?: string
        }
      }
      raw_materials: {
        Row: {
          id: string
          name: string
          type: "Paper" | "StitchingWire" | "GumPowder"
          date_added: string
          quantity: number
          weight_kg: number
          supplier_id: string | null
          invoice_number: string | null
          material_form: "Reel" | "Sheet" | null
          paper_type_id: string | null
          size_width_cm: number | null
          size_lxb_cm: any | null
          gsm: number | null
          bf: number | null
          stitching_wire_type_id: string | null
          gum_type_id: string | null
          rate_per_kg: number | null
          created_by_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: "Paper" | "StitchingWire" | "GumPowder"
          date_added: string
          quantity: number
          weight_kg: number
          supplier_id?: string | null
          invoice_number?: string | null
          material_form?: "Reel" | "Sheet" | null
          paper_type_id?: string | null
          size_width_cm?: number | null
          size_lxb_cm?: any | null
          gsm?: number | null
          bf?: number | null
          stitching_wire_type_id?: string | null
          gum_type_id?: string | null
          rate_per_kg?: number | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: "Paper" | "StitchingWire" | "GumPowder"
          date_added?: string
          quantity?: number
          weight_kg?: number
          supplier_id?: string | null
          invoice_number?: string | null
          material_form?: "Reel" | "Sheet" | null
          paper_type_id?: string | null
          size_width_cm?: number | null
          size_lxb_cm?: any | null
          gsm?: number | null
          bf?: number | null
          stitching_wire_type_id?: string | null
          gum_type_id?: string | null
          rate_per_kg?: number | null
          created_by_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other table types as needed...
    }
  }
}
