-- Default User Permissions Setup
-- This script sets up default permissions for different user roles

-- Update existing admin users to have full permissions
UPDATE public.users 
SET permissions = jsonb_build_object(
  'suppliers', jsonb_build_object('view', true, 'manage', true),
  'masterData', jsonb_build_object('view', true, 'manage', true),
  'rawMaterials', jsonb_build_object('view', true, 'manage', true),
  'finishedGoods', jsonb_build_object('view', true, 'manage', true),
  'customers', jsonb_build_object('view', true, 'manage', true),
  'stockLogs', jsonb_build_object('view', true, 'manage', true),
  'wastageSales', jsonb_build_object('view', true, 'manage', true)
)
WHERE role = 'admin';

-- Update existing regular users to have view-only permissions
UPDATE public.users 
SET permissions = jsonb_build_object(
  'suppliers', jsonb_build_object('view', true, 'manage', false),
  'masterData', jsonb_build_object('view', true, 'manage', false),
  'rawMaterials', jsonb_build_object('view', true, 'manage', false),
  'finishedGoods', jsonb_build_object('view', true, 'manage', false),
  'customers', jsonb_build_object('view', true, 'manage', false),
  'stockLogs', jsonb_build_object('view', true, 'manage', false),
  'wastageSales', jsonb_build_object('view', true, 'manage', false)
)
WHERE role = 'user' AND (permissions IS NULL OR permissions = '{}');

-- Create a function to automatically set default permissions for new users
CREATE OR REPLACE FUNCTION set_default_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default permissions based on role
  IF NEW.role = 'admin' THEN
    NEW.permissions = jsonb_build_object(
      'suppliers', jsonb_build_object('view', true, 'manage', true),
      'masterData', jsonb_build_object('view', true, 'manage', true),
      'rawMaterials', jsonb_build_object('view', true, 'manage', true),
      'finishedGoods', jsonb_build_object('view', true, 'manage', true),
      'customers', jsonb_build_object('view', true, 'manage', true),
      'stockLogs', jsonb_build_object('view', true, 'manage', true),
      'wastageSales', jsonb_build_object('view', true, 'manage', true)
    );
  ELSIF NEW.role = 'user' THEN
    NEW.permissions = jsonb_build_object(
      'suppliers', jsonb_build_object('view', true, 'manage', false),
      'masterData', jsonb_build_object('view', true, 'manage', false),
      'rawMaterials', jsonb_build_object('view', true, 'manage', false),
      'finishedGoods', jsonb_build_object('view', true, 'manage', false),
      'customers', jsonb_build_object('view', true, 'manage', false),
      'stockLogs', jsonb_build_object('view', true, 'manage', false),
      'wastageSales', jsonb_build_object('view', true, 'manage', false)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set permissions for new users
DROP TRIGGER IF EXISTS set_user_permissions_trigger ON public.users;
CREATE TRIGGER set_user_permissions_trigger
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION set_default_user_permissions();

-- Test the setup
SELECT id, email, role, permissions 
FROM public.users 
ORDER BY role, email;
