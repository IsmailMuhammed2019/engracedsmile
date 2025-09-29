# Setup Instructions for EngracedSmile Transport

## Quick Start Guide

### 1. Environment Setup
1. Copy `.env.local` and update with your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the following variables in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Your Paystack public key
   - `PAYSTACK_SECRET_KEY` - Your Paystack secret key

### 2. Database Setup
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `supabase-schema.sql`
4. Click "Run" to execute the SQL script

### 3. Paystack Setup
1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your API keys from the Paystack dashboard:
   - Public Key (for frontend)
   - Secret Key (for backend)
3. Add the keys to your `.env.local` file

### 4. Create Admin User
After setting up the database, create an admin user:

1. Go to Authentication > Users in your Supabase dashboard
2. Create a new user with email and password
3. Go to SQL Editor and run:
   ```sql
   UPDATE user_profiles 
   SET is_admin = true 
   WHERE user_id = 'your-user-id-here';
   ```

### 5. Add Sample Data (Optional)
Run this SQL to add sample routes and vehicles:

```sql
-- Add sample vehicles
INSERT INTO vehicles (plate_number, make, model, year, capacity, vehicle_type, features) VALUES
('LAG-123-AB', 'Toyota', 'Coaster', 2022, 30, 'bus', ARRAY['AC', 'WiFi', 'USB Charging']),
('ABJ-456-CD', 'Mercedes', 'Sprinter', 2023, 18, 'minibus', ARRAY['AC', 'WiFi']),
('KAN-789-EF', 'Ford', 'Transit', 2021, 15, 'minibus', ARRAY['AC']);

-- Add sample drivers (you'll need to create users first)
-- INSERT INTO drivers (user_id, license_number, license_expiry, phone_number) VALUES
-- ('user-id-1', 'DL123456', '2025-12-31', '+2348012345678'),
-- ('user-id-2', 'DL789012', '2026-06-30', '+2348098765432');
```

### 6. Run the Application
```bash
npm run dev
```

Visit `http://localhost:3000` to see your application!

## Features to Test

### User Features
1. **Registration/Login**: Create an account and sign in
2. **Search Trips**: Search for trips between cities
3. **Book Trip**: Select a trip and complete booking
4. **View Bookings**: Check your booking history

### Admin Features
1. **Admin Dashboard**: View statistics and recent bookings
2. **Route Management**: Add/edit transportation routes
3. **Vehicle Management**: Manage your fleet
4. **Booking Management**: View and manage all bookings

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your Supabase URL and keys
   - Ensure your Supabase project is active

2. **Authentication Issues**
   - Check if RLS policies are properly set
   - Verify user profiles are created correctly

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check for TypeScript errors in the console

### Getting Help

1. Check the console for error messages
2. Verify your Supabase setup
3. Ensure all environment variables are set correctly
4. Check the database schema is properly created

## Next Steps

1. Customize the branding and colors
2. Add payment integration
3. Set up email notifications
4. Configure push notifications
5. Deploy to production

## Production Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Environment Variables for Production
```
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

That's it! Your EngracedSmile Transport PWA is ready to go! 🚀

