# Supabase Setup Guide

## Quick Setup for Full Functionality

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: EngracedSmile Transport
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Credentials
1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)
   - **Service Role Key** (starts with `eyJ...`)

### 3. Update Environment File
Replace the placeholder values in `.env.local`:

```env
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Keep these as they are
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EngracedSmile Transport

# Your Paystack credentials (already configured)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_f76c452fe1f87d6820be26ca5ef16edc6f0f0a9b
PAYSTACK_SECRET_KEY=sk_test_e1ae4ec05d3e9958cc44e51fb73feae9b0f33365
```

### 4. Set Up Database
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the script

### 5. Create Storage Bucket (for vehicle images)
1. Go to **Storage** in your Supabase dashboard
2. Click **"Create a new bucket"**
3. Name: `vehicle-images`
4. Make it **Public**
5. Click **"Create bucket"**

### 6. Create Admin User
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter email and password
4. Click **"Create user"**
5. Copy the user ID
6. Go to **SQL Editor** and run:
   ```sql
   UPDATE user_profiles 
   SET is_admin = true 
   WHERE user_id = 'your-user-id-here';
   ```

### 7. Test Your Setup
1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Try registering a new account
4. Try the admin panel at `/admin`

## Features After Setup

### ✅ User Features:
- User registration and login
- Trip search and booking
- Payment processing with Paystack
- Booking management
- PWA installation

### ✅ Admin Features:
- Admin dashboard with analytics
- Vehicle management with image uploads
- Route management
- Booking management
- Driver management

## Troubleshooting

### Common Issues:
1. **"Invalid supabaseUrl"**: Make sure your URL starts with `https://`
2. **"Database not configured"**: Check your environment variables
3. **"Permission denied"**: Make sure RLS policies are set up correctly
4. **Image upload fails**: Check if the `vehicle-images` bucket exists

### Need Help?
- Check the Supabase documentation
- Verify your environment variables
- Check the browser console for errors
- Ensure all SQL scripts ran successfully

---

**Your app will work without Supabase for basic UI testing, but you'll need Supabase for full functionality!**
