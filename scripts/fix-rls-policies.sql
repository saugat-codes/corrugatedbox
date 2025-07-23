-- Fix RLS Policies with Correct JSON Syntax
-- This script fixes the permission checking syntax in Row Level Security policies
-- Run this in your Supabase SQL editor

-- First, let's drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authorized users can manage suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Authorized users can manage paper types" ON public.paper_types;
DROP POLICY IF EXISTS "Authorized users can manage raw_materials" ON public.raw_materials;
DROP POLICY IF EXISTS "Authorized users can manage finished_goods" ON public.finished_goods;
DROP POLICY IF EXISTS "Authorized users can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Authorized users can manage stock_logs" ON public.stock_logs;
DROP POLICY IF EXISTS "Authorized users can manage wastage_sales" ON public.wastage_sales;

-- Suppliers Policy
CREATE POLICY "Authorized users can manage suppliers" ON public.suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'suppliers'->>'manage')::boolean = true
        OR ((permissions::jsonb)->'suppliers'->>'view')::boolean = true
      )
    )
  );

-- Paper Types Policy
CREATE POLICY "Authorized users can manage paper types" ON public.paper_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true
        OR ((permissions::jsonb)->'masterData'->>'view')::boolean = true
      )
    )
  );

-- Raw Materials Policy
CREATE POLICY "Authorized users can manage raw materials" ON public.raw_materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'rawMaterials'->>'manage')::boolean = true
        OR ((permissions::jsonb)->'rawMaterials'->>'view')::boolean = true
      )
    )
  );

-- Finished Goods Policy
CREATE POLICY "Authorized users can manage finished goods" ON public.finished_goods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'finishedGoods'->>'manage')::boolean = true
        OR ((permissions::jsonb)->'finishedGoods'->>'view')::boolean = true
      )
    )
  );

-- Customers Policy
CREATE POLICY "Authorized users can manage customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'customers'->>'manage')::boolean = true
        OR ((permissions::jsonb)->'customers'->>'view')::boolean = true
      )
    )
  );

-- Stock Logs Policy (usually read-only for most users)
CREATE POLICY "Authorized users can view stock logs" ON public.stock_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'stockLogs'->>'view')::boolean = true
        OR ((permissions::jsonb)->'rawMaterials'->>'view')::boolean = true
        OR ((permissions::jsonb)->'finishedGoods'->>'view')::boolean = true
      )
    )
  );

CREATE POLICY "Authorized users can insert stock logs" ON public.stock_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'stockLogs'->>'manage')::boolean = true
      )
    )
  );

-- Wastage Sales Policy
CREATE POLICY "Authorized users can manage wastage sales" ON public.wastage_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' 
        OR ((permissions::jsonb)->'wastageSales'->>'manage')::boolean = true
        OR ((permissions::jsonb)->'wastageSales'->>'view')::boolean = true
      )
    )
  );

-- Users table policy (users can view their own profile and admins can view all)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- User Access Codes Policy (admin only)
DROP POLICY IF EXISTS "Admins can manage access codes" ON public.user_access_codes;
CREATE POLICY "Admins can manage access codes" ON public.user_access_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Test the policies by checking if they exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
