# RLS Policies Setup Guide

## Issue
Your Supabase database has Row Level Security (RLS) policies with incorrect JSON syntax for checking user permissions. The issue is in how permissions are being queried from the JSONB column.

## Incorrect Syntax (what you had)
```sql
(permissions->>'X'->>'Y')::boolean = true
```

## Correct Syntax (what you need)
```sql
((permissions::jsonb)->'X'->>'Y')::boolean = true
```

## What to Do

### Step 1: Run the RLS Policy Fix
Execute the SQL script `scripts/fix-rls-policies.sql` in your Supabase SQL editor. This will:
- Drop existing problematic policies
- Create new policies with correct JSON syntax
- Set up proper permission checking for all tables

### Step 2: Setup User Permissions
Execute the SQL script `scripts/setup-user-permissions.sql` in your Supabase SQL editor. This will:
- Set default permissions for existing users
- Create a trigger to automatically assign permissions to new users
- Set up the proper permission structure

### Step 3: Test the Policies
After running both scripts, test that the policies work by:
1. Logging in as different user types (admin vs regular user)
2. Trying to access different sections of the app
3. Checking that users only see what they're permitted to see

## Permission Structure

The permissions are stored as JSONB in the following structure:
```json
{
  "suppliers": { "view": true, "manage": false },
  "masterData": { "view": true, "manage": false },
  "rawMaterials": { "view": true, "manage": true },
  "finishedGoods": { "view": true, "manage": true },
  "customers": { "view": true, "manage": false },
  "stockLogs": { "view": true, "manage": false },
  "wastageSales": { "view": true, "manage": false }
}
```

## Frontend Integration

The frontend now includes:
- `usePermissions` hook for checking user permissions
- `PermissionGate` component for conditional rendering
- Updated dashboard layout that hides/shows menu items based on permissions
- Permission-based navigation

## User Roles

### Admin Users
- Have access to all modules with full permissions
- Can manage other users and access settings
- See all navigation items

### Regular Users
- Have limited permissions based on their permission settings
- Only see navigation items they have access to
- Cannot access admin-only features

## Testing

To test the permission system:
1. Create users with different permission levels
2. Log in as different users
3. Verify that navigation and features are properly restricted
4. Check that database operations respect the RLS policies

## Troubleshooting

If you get permission errors:
1. Check that the user has a profile in the `users` table
2. Verify the permissions JSON structure is correct
3. Ensure RLS policies are enabled on all tables
4. Check that the user's role and permissions are set correctly
