-- Insert default paper types
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
ON CONFLICT (company_id) DO NOTHING;
