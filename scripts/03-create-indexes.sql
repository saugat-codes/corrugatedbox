-- Create indexes for better performance
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
CREATE INDEX idx_wastage_sales_user ON public.wastage_sales(user_id);
