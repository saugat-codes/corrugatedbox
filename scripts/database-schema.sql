-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
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
CREATE TABLE user_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company information
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application settings
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID UNIQUE REFERENCES companies(id),
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
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  email TEXT,
  contact_person TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper types
CREATE TABLE paper_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stitching wire types
CREATE TABLE stitching_wire_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gum types
CREATE TABLE gum_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Raw materials
CREATE TABLE raw_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Paper', 'StitchingWire', 'GumPowder')),
  date_added DATE NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  invoice_number TEXT,
  
  -- Paper specific fields
  material_form TEXT CHECK (material_form IN ('Reel', 'Sheet')),
  paper_type_id UUID REFERENCES paper_types(id),
  size_width_cm DECIMAL(8,2), -- For reels
  size_lxb_cm JSONB, -- For sheets: {"length": 100, "breadth": 70}
  gsm INTEGER,
  bf INTEGER,
  
  -- Stitching wire specific
  stitching_wire_type_id UUID REFERENCES stitching_wire_types(id),
  
  -- Gum powder specific
  gum_type_id UUID REFERENCES gum_types(id),
  
  -- Common fields
  rate_per_kg DECIMAL(10,2),
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  email TEXT,
  contact_person TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Box types
CREATE TABLE box_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Printing types
CREATE TABLE printing_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Finished goods
CREATE TABLE finished_goods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  box_name TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  length_cm DECIMAL(8,2) NOT NULL,
  height_cm DECIMAL(8,2) NOT NULL,
  width_cm DECIMAL(8,2) NOT NULL,
  box_type_id UUID REFERENCES box_types(id),
  number_of_ply INTEGER NOT NULL,
  same_composition_all_layers BOOLEAN DEFAULT TRUE,
  
  -- Paper composition
  top_paper_type_id UUID REFERENCES paper_types(id),
  flute_type TEXT,
  liner_type TEXT,
  
  printing_type_id UUID REFERENCES printing_types(id),
  lamination BOOLEAN DEFAULT FALSE,
  quantity_pcs INTEGER NOT NULL,
  weight_one_box_kg DECIMAL(8,3) NOT NULL,
  rate_per_piece DECIMAL(10,2),
  date_added DATE NOT NULL,
  created_by_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock logs for tracking all inventory movements
CREATE TABLE stock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  raw_material_id UUID REFERENCES raw_materials(id),
  finished_good_id UUID REFERENCES finished_goods(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Add', 'Use', 'Convert', 'Dispatch', 'Wastage')),
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  purpose_notes TEXT,
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wastage sales
CREATE TABLE wastage_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  item_description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  sale_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_raw_materials_type ON raw_materials(type);
CREATE INDEX idx_raw_materials_supplier ON raw_materials(supplier_id);
CREATE INDEX idx_raw_materials_created_by ON raw_materials(created_by_user_id);
CREATE INDEX idx_finished_goods_customer ON finished_goods(customer_id);
CREATE INDEX idx_finished_goods_created_by ON finished_goods(created_by_user_id);
CREATE INDEX idx_stock_logs_timestamp ON stock_logs(timestamp);
CREATE INDEX idx_stock_logs_user ON stock_logs(user_id);
CREATE INDEX idx_stock_logs_raw_material ON stock_logs(raw_material_id);
CREATE INDEX idx_stock_logs_finished_good ON stock_logs(finished_good_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE finished_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wastage_sales ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Raw materials policies
CREATE POLICY "Users can view raw materials" ON raw_materials
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert raw materials" ON raw_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'rawMaterials'->>'add')::boolean = true)
    )
  );

CREATE POLICY "Admins can update raw materials" ON raw_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'rawMaterials'->>'modify')::boolean = true)
    )
  );

CREATE POLICY "Admins can delete raw materials" ON raw_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'rawMaterials'->>'delete')::boolean = true)
    )
  );

-- Similar policies for other tables...
-- (Additional RLS policies would be implemented for finished_goods, stock_logs, etc.)
