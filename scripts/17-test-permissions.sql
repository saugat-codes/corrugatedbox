-- Test script to verify RLS policies are working correctly
-- Run this after running script 16

-- Test 1: Check if current user is authenticated
SELECT 
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'User is authenticated: ' || auth.uid()::text
        ELSE 'User is NOT authenticated'
    END as auth_status;

-- Test 2: Try to select from suppliers (should work if authenticated)
SELECT 'Testing suppliers table access...' as test;
SELECT COUNT(*) as supplier_count FROM suppliers;

-- Test 3: Try to select from customers (should work if authenticated)
SELECT 'Testing customers table access...' as test;
SELECT COUNT(*) as customer_count FROM customers;

-- Test 4: Try to select from raw_materials (should work if authenticated)
SELECT 'Testing raw_materials table access...' as test;
SELECT COUNT(*) as raw_materials_count FROM raw_materials;

-- Test 5: Check RLS policies are enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS is ENABLED'
        ELSE 'RLS is DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('suppliers', 'customers', 'raw_materials', 'finished_goods', 'wastage_sales', 'stock_logs', 'users')
ORDER BY tablename;

-- Test 6: List current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT 'Permission tests completed. Check results above.' as result;
