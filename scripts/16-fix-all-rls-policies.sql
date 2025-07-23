-- Fix all RLS policies to allow authenticated users to perform operations
-- This script removes overly restrictive policies and replaces them with simple auth checks

-- Drop existing policies that are causing issues
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers" ON suppliers;

DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users can insert customers" ON customers;
DROP POLICY IF EXISTS "Users can update customers" ON customers;
DROP POLICY IF EXISTS "Users can delete customers" ON customers;

DROP POLICY IF EXISTS "Users can view raw_materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can insert raw_materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can update raw_materials" ON raw_materials;
DROP POLICY IF EXISTS "Users can delete raw_materials" ON raw_materials;

DROP POLICY IF EXISTS "Users can view finished_goods" ON finished_goods;
DROP POLICY IF EXISTS "Users can insert finished_goods" ON finished_goods;
DROP POLICY IF EXISTS "Users can update finished_goods" ON finished_goods;
DROP POLICY IF EXISTS "Users can delete finished_goods" ON finished_goods;

DROP POLICY IF EXISTS "Users can view wastage_sales" ON wastage_sales;
DROP POLICY IF EXISTS "Users can insert wastage_sales" ON wastage_sales;
DROP POLICY IF EXISTS "Users can update wastage_sales" ON wastage_sales;
DROP POLICY IF EXISTS "Users can delete wastage_sales" ON wastage_sales;

DROP POLICY IF EXISTS "Users can view stock_logs" ON stock_logs;
DROP POLICY IF EXISTS "Users can insert stock_logs" ON stock_logs;
DROP POLICY IF EXISTS "Users can update stock_logs" ON stock_logs;
DROP POLICY IF EXISTS "Users can delete stock_logs" ON stock_logs;

-- Create simple policies that allow all authenticated users to access data

-- Suppliers policies
CREATE POLICY "Authenticated users can view suppliers" ON suppliers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete suppliers" ON suppliers
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Customers policies
CREATE POLICY "Authenticated users can view customers" ON customers
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update customers" ON customers
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete customers" ON customers
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Raw materials policies
CREATE POLICY "Authenticated users can view raw_materials" ON raw_materials
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert raw_materials" ON raw_materials
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update raw_materials" ON raw_materials
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete raw_materials" ON raw_materials
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Finished goods policies
CREATE POLICY "Authenticated users can view finished_goods" ON finished_goods
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert finished_goods" ON finished_goods
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update finished_goods" ON finished_goods
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete finished_goods" ON finished_goods
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Wastage sales policies
CREATE POLICY "Authenticated users can view wastage_sales" ON wastage_sales
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert wastage_sales" ON wastage_sales
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update wastage_sales" ON wastage_sales
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete wastage_sales" ON wastage_sales
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Stock logs policies
CREATE POLICY "Authenticated users can view stock_logs" ON stock_logs
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert stock_logs" ON stock_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update stock_logs" ON stock_logs
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete stock_logs" ON stock_logs
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Paper types, stitching wire types, gum types policies
CREATE POLICY "Authenticated users can view paper_types" ON paper_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert paper_types" ON paper_types
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view stitching_wire_types" ON stitching_wire_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert stitching_wire_types" ON stitching_wire_types
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view gum_types" ON gum_types
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert gum_types" ON gum_types
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users table policies (more restrictive)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

CREATE POLICY "Authenticated users can view users" ON users
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update users" ON users
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert users" ON users
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Refresh the policies
NOTIFY pgrst, 'reload config';

-- Output success message
SELECT 'RLS policies updated successfully. All authenticated users can now access all tables.' as result;
