import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabase = createClientComponentClient()

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
      // Additional table types would be defined here...
    }
  }
}
