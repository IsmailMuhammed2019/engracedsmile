# Driver Schema Update Instructions

## Database Migration Required

To support the comprehensive driver information fields, you need to run the following SQL commands in your Supabase dashboard:

### Step 1: Add New Columns to Drivers Table

```sql
-- Add new columns to the existing drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 18 AND age <= 70);
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### Step 2: Update Existing Records (if any)

```sql
-- Set default values for existing records
UPDATE drivers SET 
  full_name = 'Driver ' || license_number,
  age = 25,
  address = 'Address not provided',
  emergency_contact = 'Emergency contact not provided',
  emergency_phone = '000-000-0000'
WHERE full_name IS NULL;
```

### Step 3: Make Required Fields NOT NULL

```sql
-- Make the new fields required
ALTER TABLE drivers ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE drivers ALTER COLUMN age SET NOT NULL;
ALTER TABLE drivers ALTER COLUMN address SET NOT NULL;
ALTER TABLE drivers ALTER COLUMN emergency_contact SET NOT NULL;
ALTER TABLE drivers ALTER COLUMN emergency_phone SET NOT NULL;
```

### Step 4: Create Storage Bucket for Driver Images

```sql
-- Create storage bucket for driver images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('driver-images', 'driver-images', true)
ON CONFLICT (id) DO NOTHING;
```

### Step 5: Set Up Storage Policies

```sql
-- Create policies for driver images
CREATE POLICY "Driver images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'driver-images');

CREATE POLICY "Authenticated users can upload driver images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'driver-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update driver images" ON storage.objects
FOR UPDATE USING (bucket_id = 'driver-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete driver images" ON storage.objects
FOR DELETE USING (bucket_id = 'driver-images' AND auth.role() = 'authenticated');
```

## How to Run These Commands

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste each SQL block above
4. Run them one by one in the order shown

## New Driver Fields

After running the migration, the drivers table will support:

- **full_name**: Driver's full name
- **age**: Driver's age (18-70 years)
- **phone_number**: Driver's phone number (existing)
- **license_number**: Driver's license number (existing)
- **license_expiry**: Driver's license expiry date (existing)
- **address**: Driver's full address
- **emergency_contact**: Emergency contact person's name
- **emergency_phone**: Emergency contact person's phone
- **image_url**: URL to driver's photo (stored in Supabase Storage)
- **is_active**: Whether driver is active (existing)

## Features Available After Migration

✅ **Comprehensive Driver Information**: All necessary driver details
✅ **Image Upload**: Driver photos with preview
✅ **Search Functionality**: Search by name, license, phone, or emergency contact
✅ **Professional UI**: Card-based layout with driver photos
✅ **Form Validation**: All required fields with proper validation
✅ **Edit/Delete**: Full CRUD operations for drivers
✅ **Status Management**: Activate/deactivate drivers
