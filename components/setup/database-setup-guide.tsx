"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink, Database, User } from "lucide-react"

const SQL_SCRIPTS = [
  {
    id: "01",
    name: "Enable Extensions",
    file: "01-enable-extensions.sql",
    description: "Enable UUID and crypto extensions",
    sql: `-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;`,
  },
  {
    id: "02",
    name: "Create Tables",
    file: "02-create-tables.sql",
    description: "Create all database tables",
    sql: `-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  access_code TEXT UNIQUE,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User access codes for registration
CREATE TABLE public.user_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.users(id),
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Company information
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application settings
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE REFERENCES public.companies(id),
  fiscal_year_start DATE,
  fiscal_year_end DATE,
  dimension_unit TEXT DEFAULT 'cm' CHECK (dimension_unit IN ('cm', 'inch')),
  weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lbs')),
  paper_types JSONB DEFAULT '[]',
  box_types JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  email TEXT,
  contact_person TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper types
CREATE TABLE public.paper_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stitching wire types
CREATE TABLE public.stitching_wire_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gum types
CREATE TABLE public.gum_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raw materials
CREATE TABLE public.raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Paper', 'StitchingWire', 'GumPowder')),
  date_added DATE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  weight_kg DECIMAL(10,2) NOT NULL CHECK (weight_kg >= 0),
  supplier_id UUID REFERENCES public.suppliers(id),
  invoice_number TEXT,
  
  -- Paper specific fields
  material_form TEXT CHECK (material_form IN ('Reel', 'Sheet')),
  paper_type_id UUID REFERENCES public.paper_types(id),
  size_width_cm DECIMAL(8,2) CHECK (size_width_cm > 0),
  size_lxb_cm JSONB,
  gsm INTEGER CHECK (gsm > 0),
  bf INTEGER CHECK (bf > 0),
  
  -- Stitching wire specific
  stitching_wire_type_id UUID REFERENCES public.stitching_wire_types(id),
  
  -- Gum powder specific
  gum_type_id UUID REFERENCES public.gum_types(id),
  
  -- Common fields
  rate_per_kg DECIMAL(10,2) CHECK (rate_per_kg >= 0),
  created_by_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  email TEXT,
  contact_person TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Box types
CREATE TABLE public.box_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Printing types
CREATE TABLE public.printing_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finished goods
CREATE TABLE public.finished_goods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_name TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id),
  length_cm DECIMAL(8,2) NOT NULL CHECK (length_cm > 0),
  height_cm DECIMAL(8,2) NOT NULL CHECK (height_cm > 0),
  width_cm DECIMAL(8,2) NOT NULL CHECK (width_cm > 0),
  box_type_id UUID REFERENCES public.box_types(id),
  number_of_ply INTEGER NOT NULL CHECK (number_of_ply > 0),
  same_composition_all_layers BOOLEAN DEFAULT TRUE,
  
  -- Paper composition
  top_paper_type_id UUID REFERENCES public.paper_types(id),
  flute_type TEXT,
  liner_type TEXT,
  
  printing_type_id UUID REFERENCES public.printing_types(id),
  lamination BOOLEAN DEFAULT FALSE,
  quantity_pcs INTEGER NOT NULL CHECK (quantity_pcs >= 0),
  weight_one_box_kg DECIMAL(8,3) NOT NULL CHECK (weight_one_box_kg > 0),
  rate_per_piece DECIMAL(10,2) CHECK (rate_per_piece >= 0),
  date_added DATE NOT NULL,
  created_by_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock logs for tracking all inventory movements
CREATE TABLE public.stock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_material_id UUID REFERENCES public.raw_materials(id),
  finished_good_id UUID REFERENCES public.finished_goods(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Add', 'Use', 'Convert', 'Dispatch', 'Wastage')),
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  purpose_notes TEXT,
  user_id UUID REFERENCES public.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wastage sales
CREATE TABLE public.wastage_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  weight_kg DECIMAL(10,2) NOT NULL CHECK (weight_kg >= 0),
  sale_amount DECIMAL(10,2) NOT NULL CHECK (sale_amount >= 0),
  notes TEXT,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
  },
  {
    id: "03",
    name: "Create Indexes",
    file: "03-create-indexes.sql",
    description: "Add performance indexes",
    sql: `-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_user_access_codes_code ON public.user_access_codes(code);
CREATE INDEX idx_user_access_codes_used ON public.user_access_codes(used);
CREATE INDEX idx_user_access_codes_expires ON public.user_access_codes(expires_at);

CREATE INDEX idx_raw_materials_type ON public.raw_materials(type);
CREATE INDEX idx_raw_materials_supplier ON public.raw_materials(supplier_id);
CREATE INDEX idx_raw_materials_created_by ON public.raw_materials(created_by_user_id);
CREATE INDEX idx_raw_materials_date_added ON public.raw_materials(date_added);

CREATE INDEX idx_finished_goods_customer ON public.finished_goods(customer_id);
CREATE INDEX idx_finished_goods_created_by ON public.finished_goods(created_by_user_id);
CREATE INDEX idx_finished_goods_date_added ON public.finished_goods(date_added);

CREATE INDEX idx_stock_logs_timestamp ON public.stock_logs(timestamp);
CREATE INDEX idx_stock_logs_user ON public.stock_logs(user_id);
CREATE INDEX idx_stock_logs_raw_material ON public.stock_logs(raw_material_id);
CREATE INDEX idx_stock_logs_finished_good ON public.stock_logs(finished_good_id);
CREATE INDEX idx_stock_logs_activity_type ON public.stock_logs(activity_type);

CREATE INDEX idx_wastage_sales_date ON public.wastage_sales(date);
CREATE INDEX idx_wastage_sales_user ON public.wastage_sales(user_id);`,
  },
  {
    id: "04",
    name: "Enable RLS",
    file: "04-enable-rls.sql",
    description: "Enable Row Level Security",
    sql: `-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stitching_wire_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gum_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wastage_sales ENABLE ROW LEVEL SECURITY;`,
  },
  {
    id: "05",
    name: "Create RLS Policies (FIXED)",
    file: "05-create-rls-policies-fixed.sql",
    description: "Create security policies with initial admin support",
    sql: `-- RLS Policies for Users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow initial admin creation when no users exist, or when created by existing admin
CREATE POLICY "Allow admin creation" ON public.users
  FOR INSERT WITH CHECK (
    -- Allow if no users exist (initial admin creation)
    NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
    OR
    -- Allow if created by existing admin
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for User Access Codes
CREATE POLICY "Admins can manage access codes" ON public.user_access_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view unused access codes for signup" ON public.user_access_codes
  FOR SELECT USING (used = false AND expires_at > NOW());

-- RLS Policies for Companies and Settings
CREATE POLICY "Authenticated users can view company info" ON public.companies
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage company info" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view settings" ON public.settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for Master Data (Suppliers, Paper Types, etc.)
CREATE POLICY "Authenticated users can view suppliers" ON public.suppliers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage suppliers" ON public.suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'suppliers'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view paper types" ON public.paper_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage paper types" ON public.paper_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view stitching wire types" ON public.stitching_wire_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage stitching wire types" ON public.stitching_wire_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view gum types" ON public.gum_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage gum types" ON public.gum_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

-- RLS Policies for Raw Materials
CREATE POLICY "Authenticated users can view raw materials" ON public.raw_materials
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can insert raw materials" ON public.raw_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'rawMaterials'->>'add')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can update raw materials" ON public.raw_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'rawMaterials'->>'modify')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can delete raw materials" ON public.raw_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'rawMaterials'->>'delete')::boolean = true)
    )
  );

-- RLS Policies for Customers
CREATE POLICY "Authenticated users can view customers" ON public.customers
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'customers'->>'manage')::boolean = true)
    )
  );

-- RLS Policies for Box Types and Printing Types
CREATE POLICY "Authenticated users can view box types" ON public.box_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage box types" ON public.box_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view printing types" ON public.printing_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage printing types" ON public.printing_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

-- RLS Policies for Finished Goods
CREATE POLICY "Authenticated users can view finished goods" ON public.finished_goods
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can insert finished goods" ON public.finished_goods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'finishedGoods'->>'add')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can update finished goods" ON public.finished_goods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'finishedGoods'->>'modify')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can delete finished goods" ON public.finished_goods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'finishedGoods'->>'delete')::boolean = true)
    )
  );

-- RLS Policies for Stock Logs
CREATE POLICY "Authenticated users can view stock logs" ON public.stock_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert stock logs" ON public.stock_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for Wastage Sales
CREATE POLICY "Authenticated users can view wastage sales" ON public.wastage_sales
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage wastage sales" ON public.wastage_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'wastageSales'->>'manage')::boolean = true)
    )
  );`,
  },
  {
    id: "06",
    name: "Create Functions",
    file: "06-create-functions.sql",
    description: "Add triggers and functions",
    sql: `-- Function to handle user creation after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_raw_materials_updated_at
  BEFORE UPDATE ON public.raw_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finished_goods_updated_at
  BEFORE UPDATE ON public.finished_goods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();`,
  },
  {
    id: "07",
    name: "Seed Data",
    file: "07-seed-data.sql",
    description: "Insert default data",
    sql: `-- Insert default paper types
INSERT INTO public.paper_types (name) VALUES 
  ('Kraft Paper'),
  ('Duplex Board'),
  ('Art Paper'),
  ('Newsprint'),
  ('Corrugated Medium'),
  ('Test Liner'),
  ('White Top Test Liner'),
  ('Recycled Paper')
ON CONFLICT (name) DO NOTHING;

-- Insert default box types
INSERT INTO public.box_types (name) VALUES 
  ('Regular Slotted Container (RSC)'),
  ('Full Overlap Container (FOL)'),
  ('Half Slotted Container (HSC)'),
  ('Mailer Box'),
  ('Die Cut Box'),
  ('Tray Box'),
  ('Telescope Box'),
  ('Five Panel Folder')
ON CONFLICT (name) DO NOTHING;

-- Insert default stitching wire types
INSERT INTO public.stitching_wire_types (name) VALUES 
  ('Galvanized Wire'),
  ('Stainless Steel Wire'),
  ('Copper Wire'),
  ('Brass Wire'),
  ('Aluminum Wire')
ON CONFLICT (name) DO NOTHING;

-- Insert default gum types
INSERT INTO public.gum_types (name) VALUES 
  ('Starch Based Gum'),
  ('Dextrin Gum'),
  ('PVA Gum'),
  ('Casein Gum'),
  ('Synthetic Gum')
ON CONFLICT (name) DO NOTHING;

-- Insert default printing types
INSERT INTO public.printing_types (name) VALUES 
  ('No Printing'),
  ('Flexographic'),
  ('Offset'),
  ('Digital'),
  ('Screen Printing'),
  ('Gravure'),
  ('Letterpress')
ON CONFLICT (name) DO NOTHING;

-- Insert default company profile
INSERT INTO public.companies (name, email, address) VALUES 
  ('The Corrugated Box Company', 'admin@corrugatedbox.com', '123 Packaging Street, Industrial Area')
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO public.settings (
  company_id, 
  fiscal_year_start, 
  fiscal_year_end,
  paper_types,
  box_types
) VALUES (
  (SELECT id FROM public.companies LIMIT 1),
  '2024-04-01',
  '2025-03-31',
  '["Kraft Paper", "Duplex Board", "Art Paper", "Test Liner"]',
  '["RSC", "FOL", "Mailer Box", "Die Cut Box"]'
)
ON CONFLICT (company_id) DO NOTHING;`,
  },
  {
    id: "08",
    name: "Fix Admin Creation (IMPORTANT)",
    file: "09-fix-admin-creation-policy.sql",
    description: "MUST RUN: Fix RLS policies to allow admin creation",
    sql: `-- Fix the RLS policy to allow initial admin creation
-- This script should be run if you're getting "row-level security policy" errors

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Allow admin creation" ON public.users;

-- Create a new policy that allows initial admin creation
CREATE POLICY "Allow admin creation" ON public.users
  FOR INSERT WITH CHECK (
    -- Allow if no users exist (initial admin creation)
    NOT EXISTS (SELECT 1 FROM public.users LIMIT 1)
    OR
    -- Allow if created by existing admin
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Allow admin creation';`,
  },
]

export default function DatabaseSetupGuide() {
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [completedScripts, setCompletedScripts] = useState<string[]>([])

  const copyToClipboard = async (sql: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopiedScript(scriptId)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const markAsCompleted = (scriptId: string) => {
    if (!completedScripts.includes(scriptId)) {
      setCompletedScripts([...completedScripts, scriptId])
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <Database className="h-16 w-16 text-blue-600 mx-auto" />
        <h1 className="text-3xl font-bold">🚀 Quick Database Setup</h1>
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 text-lg">
            Your Supabase project is connected! Now let's create the database tables in just a few minutes.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">✨ This interactive guide will walk you through each step</p>
            <p className="text-blue-700 text-sm mt-1">
              Just copy each SQL script and paste it into your Supabase dashboard. We'll track your progress!
            </p>
          </div>
        </div>
      </div>

      <Alert className="border-green-200 bg-green-50">
        <User className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <strong>🎯 Admin Account Ready!</strong>
            <div className="ml-4 space-y-1">
              <div>
                • <strong>Name:</strong> Saugat
              </div>
              <div>
                • <strong>Email:</strong> saugat.codes@gmail.com
              </div>
              <div>
                • <strong>Password:</strong> Ilovenepal00*
              </div>
            </div>
            <div className="mt-3 p-2 bg-green-100 rounded text-sm">
              💡 <strong>After running the scripts:</strong> Use the "Create Admin Account" button on the login page to
              create your admin account with these credentials.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Alert className="border-red-200 bg-red-50">
        <Database className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="space-y-2">
            <strong>🔧 IMPORTANT: Admin Creation Fix Included!</strong>
            <div className="ml-4 space-y-1">
              <div>
                • Script #08 is <strong>CRITICAL</strong> - it fixes admin creation policies
              </div>
              <div>
                • <strong>MUST RUN</strong> script #08 before creating your admin account
              </div>
              <div>• All JSONB permission syntax has been corrected</div>
            </div>
            <div className="mt-3 p-2 bg-red-100 rounded text-sm">
              ⚠️ <strong>Without script #08:</strong> You'll get "row-level security policy" errors when creating the
              admin account.
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Alert className="border-blue-200 bg-blue-50">
        <Database className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <div className="space-y-2">
            <strong>📋 Simple 3-Step Process:</strong>
            <div className="ml-4 space-y-1">
              <div>
                1. <strong>Copy</strong> each SQL script below (click the "Copy SQL" button)
              </div>
              <div>
                2. <strong>Paste & Run</strong> in your Supabase SQL Editor
              </div>
              <div>
                3. <strong>Mark as Done</strong> and move to the next script
              </div>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded text-sm">
              💡 <strong>Tip:</strong> Keep this page open while you work in Supabase - we'll track your progress!
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {SQL_SCRIPTS.map((script, index) => (
          <Card key={script.id} className={`relative ${script.id === "08" ? "border-red-300 bg-red-50" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge
                    variant={
                      completedScripts.includes(script.id)
                        ? "default"
                        : script.id === "08"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {script.id}
                  </Badge>
                  <div>
                    <CardTitle className={`text-lg ${script.id === "08" ? "text-red-900" : ""}`}>
                      {script.name}
                      {script.id === "08" && <span className="ml-2 text-red-600 font-bold">⚠️ CRITICAL</span>}
                    </CardTitle>
                    <CardDescription className={script.id === "08" ? "text-red-700" : ""}>
                      {script.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {completedScripts.includes(script.id) && <CheckCircle className="h-5 w-5 text-green-600" />}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(script.sql, script.id)}
                    className="flex items-center space-x-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span>{copiedScript === script.id ? "Copied!" : "Copy SQL"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAsCompleted(script.id)}
                    disabled={completedScripts.includes(script.id)}
                  >
                    {completedScripts.includes(script.id) ? "Completed" : "Mark Done"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{script.sql}</pre>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm text-gray-600">Completed:</span>
          <Badge variant="outline">
            {completedScripts.length} / {SQL_SCRIPTS.length}
          </Badge>
        </div>

        {completedScripts.length === SQL_SCRIPTS.length && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <strong>🎉 All scripts completed!</strong>
                <div className="space-y-1">
                  <div>✅ Database schema is ready</div>
                  <div>✅ RLS policies are fixed</div>
                  <div>✅ Admin creation is enabled</div>
                </div>
                <div className="mt-3 p-2 bg-green-100 rounded text-sm">
                  <strong>Next Step:</strong> Go back to the login page and click "Create Admin Account" to create your
                  admin account with the pre-filled credentials.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
          className="flex items-center space-x-2"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Open Supabase Dashboard</span>
        </Button>
      </div>
    </div>
  )
}
