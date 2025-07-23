-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
DROP POLICY IF EXISTS "Allow admin creation" ON public.users;

-- Recreate the correct policy for user insertion
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

-- Fix all policies with incorrect JSONB syntax
DROP POLICY IF EXISTS "Authorized users can manage suppliers" ON public.suppliers;
CREATE POLICY "Authorized users can manage suppliers" ON public.suppliers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'suppliers'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage paper types" ON public.paper_types;
CREATE POLICY "Authorized users can manage paper types" ON public.paper_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage stitching wire types" ON public.stitching_wire_types;
CREATE POLICY "Authorized users can manage stitching wire types" ON public.stitching_wire_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage gum types" ON public.gum_types;
CREATE POLICY "Authorized users can manage gum types" ON public.gum_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can insert raw materials" ON public.raw_materials;
CREATE POLICY "Authorized users can insert raw materials" ON public.raw_materials
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'rawMaterials'->>'add')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can update raw materials" ON public.raw_materials;
CREATE POLICY "Authorized users can update raw materials" ON public.raw_materials
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'rawMaterials'->>'modify')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can delete raw materials" ON public.raw_materials;
CREATE POLICY "Authorized users can delete raw materials" ON public.raw_materials
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'rawMaterials'->>'delete')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage customers" ON public.customers;
CREATE POLICY "Authorized users can manage customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'customers'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage box types" ON public.box_types;
CREATE POLICY "Authorized users can manage box types" ON public.box_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage printing types" ON public.printing_types;
CREATE POLICY "Authorized users can manage printing types" ON public.printing_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'masterData'->>'manage')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can insert finished goods" ON public.finished_goods;
CREATE POLICY "Authorized users can insert finished goods" ON public.finished_goods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'finishedGoods'->>'add')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can update finished goods" ON public.finished_goods;
CREATE POLICY "Authorized users can update finished goods" ON public.finished_goods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'finishedGoods'->>'modify')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can delete finished goods" ON public.finished_goods;
CREATE POLICY "Authorized users can delete finished goods" ON public.finished_goods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'finishedGoods'->>'delete')::boolean = true)
    )
  );

DROP POLICY IF EXISTS "Authorized users can manage wastage sales" ON public.wastage_sales;
CREATE POLICY "Authorized users can manage wastage sales" ON public.wastage_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR ((permissions::jsonb)->'wastageSales'->>'manage')::boolean = true)
    )
  );
