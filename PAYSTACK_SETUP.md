# Paystack Integration Setup Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Paystack Configuration (Testing)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
```

## Getting Paystack Test Credentials

1. **Sign up for Paystack**: Go to [https://paystack.com](https://paystack.com) and create an account
2. **Get Test Keys**: 
   - Login to your Paystack dashboard
   - Go to Settings > API Keys & Webhooks
   - Copy your **Test Public Key** (starts with `pk_test_`)
   - Copy your **Test Secret Key** (starts with `sk_test_`)

## Test Cards for Development

Use these test cards to simulate payments:

### Successful Payments
- **Card**: 4084084084084085
- **CVV**: 408
- **Expiry**: Any future date (e.g., 12/25)
- **PIN**: 1234 (for PIN verification)
- **OTP**: 123456 (for OTP verification)

### Failed Payments
- **Card**: 4000000000000002 (Insufficient funds)
- **Card**: 4000000000000119 (Processing error)

## Testing the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the booking flow**:
   - Go to `/book` and search for trips
   - Select a trip and proceed to booking
   - Fill in passenger details
   - Click "Confirm Booking"
   - Use the test card details above

3. **Verify payment in admin**:
   - Go to `/admin/payments` to see the payment records
   - Check the booking status in `/admin/bookings`

## Webhook Setup (Optional)

For real-time payment updates, set up webhooks:

1. **In Paystack Dashboard**:
   - Go to Settings > API Keys & Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Select events: `charge.success`, `charge.failed`

2. **Create webhook handler** (already exists at `/api/payment/verify`)

## Production Setup

When ready for production:

1. **Get Live Keys**:
   - In Paystack dashboard, switch to "Live" mode
   - Copy your **Live Public Key** (starts with `pk_live_`)
   - Copy your **Live Secret Key** (starts with `sk_live_`)

2. **Update Environment Variables**:
   ```bash
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
   PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
   ```

3. **Update Webhook URL** to your production domain

## Troubleshooting

### Common Issues:

1. **"Invalid public key"**: Check that your public key starts with `pk_test_` or `pk_live_`
2. **"Invalid secret key"**: Check that your secret key starts with `sk_test_` or `sk_live_`
3. **Payment not verifying**: Check that the webhook URL is accessible and the API route is working
4. **Database errors**: Ensure your Supabase database has the correct schema and RLS policies

### Debug Steps:

1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify environment variables are loaded correctly
4. Test the payment verification API endpoint directly

## Security Notes

- Never commit your `.env.local` file to version control
- Use different keys for development and production
- Regularly rotate your API keys
- Monitor your Paystack dashboard for suspicious activity
