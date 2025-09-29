# Database Setup for Your Supabase Project

## Your Supabase Project Details:
- **Project URL**: https://dorqjkqhaqakjlsfvyyj.supabase.co
- **Project ID**: dorqjkqhaqakjlsfvyyj

## Quick Setup Steps:

### 1. Go to Your Supabase Dashboard
1. Visit: https://supabase.com/dashboard
2. Find your project: `dorqjkqhaqakjlsfvyyj`
3. Click on it to open the dashboard

### 2. Set Up the Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql` file
3. Paste it into the SQL Editor
4. Click **"Run"** to execute the script

### 3. Create Storage Bucket for Vehicle Images
1. Go to **Storage** in your Supabase dashboard
2. Click **"Create a new bucket"**
3. Name: `vehicle-images`
4. Make it **Public**
5. Click **"Create bucket"**

### 4. Create Your First Admin User
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter:
   - **Email**: your-email@example.com
   - **Password**: a strong password
4. Click **"Create user"**
5. Copy the **User ID** (looks like: `12345678-1234-1234-1234-123456789abc`)

### 5. Make User an Admin
1. Go to **SQL Editor**
2. Run this SQL (replace with your actual user ID):
```sql
UPDATE user_profiles 
SET is_admin = true 
WHERE user_id = 'your-user-id-here';
```

### 6. Test Your Setup
1. Visit: http://localhost:3000
2. Try registering a new account
3. Try the admin panel at `/admin`

## What This Sets Up:

### ✅ Database Tables:
- **user_profiles**: User account information
- **drivers**: Driver profiles and credentials  
- **routes**: Transportation routes between cities
- **vehicles**: Fleet of buses and vehicles (with image support)
- **trips**: Scheduled trips with vehicles and drivers
- **bookings**: User bookings and reservations

### ✅ Security:
- Row Level Security (RLS) policies
- User authentication
- Admin role management
- Data protection

### ✅ Features:
- User registration and login
- Trip search and booking
- Payment processing with Paystack
- Admin dashboard
- Vehicle management with images
- Booking management

## Troubleshooting:

### If you get errors:
1. **"Table doesn't exist"**: Make sure you ran the SQL schema
2. **"Permission denied"**: Check RLS policies are set up
3. **"Image upload fails"**: Make sure storage bucket exists
4. **"Admin access denied"**: Make sure user is marked as admin

### Need Help?
- Check the Supabase documentation
- Verify your environment variables
- Check the browser console for errors
- Ensure all SQL scripts ran successfully

---

**Your app is now ready with full Supabase integration! 🚀**
