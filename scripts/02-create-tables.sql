-- Users table (extends Supabase auth.users)
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
  size_width_cm DECIMAL(8,2) CHECK (size_width_cm > 0), -- For reels
  size_lxb_cm JSONB, -- For sheets: {"length": 100, "breadth": 70}
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
);
