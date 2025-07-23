# Supabase Production Setup Guide

This guide will help you set up Supabase for production use with The Corrugated Box Inventory Management System.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `corrugated-box-inventory`
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
6. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API Keys** → **anon public** key

## Step 3: Configure Environment Variables

1. In your project root, create or update `.env.local`:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up the Database Schema

Run the SQL scripts in order in your Supabase SQL Editor:

1. **Enable Extensions**: Run `scripts/01-enable-extensions.sql`
2. **Create Tables**: Run `scripts/02-create-tables.sql`
3. **Create Indexes**: Run `scripts/03-create-indexes.sql`
4. **Enable RLS**: Run `scripts/04-enable-rls.sql`
5. **Create RLS Policies**: Run `scripts/05-create-rls-policies.sql`
6. **Create Functions**: Run `scripts/06-create-functions.sql`
7. **Seed Data**: Run `scripts/07-seed-data.sql`

### How to Run SQL Scripts:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the content of each script file
5. Click **Run** to execute
6. Repeat for all script files in order

## Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
- Set to your production domain: `https://your-domain.com`
- For development: `http://localhost:3000`

### Redirect URLs
Add these URLs:
- `https://your-domain.com/auth/callback`
- `http://localhost:3000/auth/callback` (for development)

### Email Templates (Optional)
Customize the email templates for:
- Confirm signup
- Reset password
- Magic link

## Step 6: Set Up Row Level Security (RLS)

The RLS policies are automatically created by the scripts, but verify they're working:

1. Go to **Authentication** → **Policies**
2. You should see policies for all tables
3. Test by creating a user and verifying they can only access their own data

## Step 7: Test the Setup

1. Restart your development server: `npm run dev`
2. Try creating an admin account
3. Test login/logout functionality
4. Add some test data to verify database operations

## Step 8: Production Deployment

### Environment Variables for Production:
Make sure to set these in your production environment (Vercel, Netlify, etc.):

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
\`\`\`

### Security Checklist:
- [ ] RLS policies are enabled on all tables
- [ ] API keys are properly configured
- [ ] Site URL is set to your production domain
- [ ] Email templates are customized
- [ ] Database backups are enabled (automatic in Supabase)

## Troubleshooting

### Common Issues:

1. **"Missing environment variables" error**
   - Ensure `.env.local` exists and has correct values
   - Restart your development server

2. **"Failed to create user profile" error**
   - Check if the database schema is properly set up
   - Verify RLS policies are not blocking user creation

3. **Authentication not working**
   - Verify Site URL and Redirect URLs are correct
   - Check browser console for errors

4. **Database connection issues**
   - Verify your Supabase project is active
   - Check if API keys are correct

### Getting Help:

- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Supabase Discord community
- GitHub issues for this project

## Security Best Practices

1. **Never commit `.env.local` to version control**
2. **Use different Supabase projects for development and production**
3. **Regularly rotate API keys**
4. **Monitor database usage and set up alerts**
5. **Enable database backups**
6. **Use HTTPS in production**
7. **Implement proper error handling**

## Monitoring and Maintenance

1. **Set up monitoring** in Supabase dashboard
2. **Configure alerts** for high usage or errors
3. **Regular database maintenance** (automatic in Supabase)
4. **Monitor API usage** and upgrade plan if needed
5. **Keep dependencies updated**

Your Supabase production setup is now complete! 🎉
