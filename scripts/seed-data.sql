-- Insert default paper types
INSERT INTO paper_types (name) VALUES 
  ('Kraft Paper'),
  ('Duplex Board'),
  ('Art Paper'),
  ('Newsprint'),
  ('Corrugated Medium');

-- Insert default box types
INSERT INTO box_types (name) VALUES 
  ('Regular Slotted Container (RSC)'),
  ('Full Overlap Container (FOL)'),
  ('Half Slotted Container (HSC)'),
  ('Mailer Box'),
  ('Die Cut Box');

-- Insert default stitching wire types
INSERT INTO stitching_wire_types (name) VALUES 
  ('Galvanized Wire'),
  ('Stainless Steel Wire'),
  ('Copper Wire');

-- Insert default gum types
INSERT INTO gum_types (name) VALUES 
  ('Starch Based Gum'),
  ('Dextrin Gum'),
  ('PVA Gum');

-- Insert default printing types
INSERT INTO printing_types (name) VALUES 
  ('No Printing'),
  ('Flexographic'),
  ('Offset'),
  ('Digital'),
  ('Screen Printing');

-- Insert sample suppliers
INSERT INTO suppliers (name, email, contact_person, address) VALUES 
  ('ABC Paper Mills', 'contact@abcpaper.com', 'John Smith', '123 Industrial Area, Mumbai'),
  ('XYZ Packaging Supplies', 'info@xyzpack.com', 'Jane Doe', '456 Trade Center, Delhi'),
  ('Premium Paper Co.', 'sales@premiumpaper.com', 'Mike Johnson', '789 Business Park, Bangalore');

-- Insert sample customers
INSERT INTO customers (name, email, contact_person, address) VALUES 
  ('ABC Manufacturing Ltd', 'orders@abcmfg.com', 'Sarah Wilson', '321 Factory Road, Chennai'),
  ('XYZ Electronics', 'procurement@xyzelec.com', 'David Brown', '654 Tech Park, Pune'),
  ('Global Exports Inc', 'shipping@globalexp.com', 'Lisa Davis', '987 Export Zone, Kolkata');

-- Create a default company profile
INSERT INTO companies (name, email, address) VALUES 
  ('The Corrugated Box Company', 'admin@corrugatedbox.com', '123 Packaging Street, Industrial Area');

-- Insert default settings
INSERT INTO settings (
  company_id, 
  fiscal_year_start, 
  fiscal_year_end,
  paper_types,
  box_types
) VALUES (
  (SELECT id FROM companies LIMIT 1),
  '2024-04-01',
  '2025-03-31',
  '["Kraft Paper", "Duplex Board", "Art Paper"]',
  '["RSC", "FOL", "Mailer Box"]'
);
