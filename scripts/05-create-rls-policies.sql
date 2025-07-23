-- RLS Policies for Users table
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

CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (
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
      AND (role = 'admin' OR (permissions->>'suppliers'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view paper types" ON public.paper_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage paper types" ON public.paper_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'masterData'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view stitching wire types" ON public.stitching_wire_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage stitching wire types" ON public.stitching_wire_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'masterData'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view gum types" ON public.gum_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage gum types" ON public.gum_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'masterData'->>'manage')::boolean = true)
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
      AND (role = 'admin' OR (permissions->>'rawMaterials'->>'add')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can update raw materials" ON public.raw_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'rawMaterials'->>'modify')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can delete raw materials" ON public.raw_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'rawMaterials'->>'delete')::boolean = true)
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
      AND (role = 'admin' OR (permissions->>'customers'->>'manage')::boolean = true)
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
      AND (role = 'admin' OR (permissions->>'masterData'->>'manage')::boolean = true)
    )
  );

CREATE POLICY "Authenticated users can view printing types" ON public.printing_types
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can manage printing types" ON public.printing_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'masterData'->>'manage')::boolean = true)
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
      AND (role = 'admin' OR (permissions->>'finishedGoods'->>'add')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can update finished goods" ON public.finished_goods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'finishedGoods'->>'modify')::boolean = true)
    )
  );

CREATE POLICY "Authorized users can delete finished goods" ON public.finished_goods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (permissions->>'finishedGoods'->>'delete')::boolean = true)
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
      AND (role = 'admin' OR (permissions->>'wastageSales'->>'manage')::boolean = true)
    )
  );
