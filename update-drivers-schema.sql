-- Update drivers table to include comprehensive driver information
-- Add new columns to the existing drivers table

-- Add full_name column
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add age column
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 18 AND age <= 70);

-- Add address column
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS address TEXT;

-- Add emergency_contact column
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_contact TEXT;

-- Add emergency_phone column
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS emergency_phone TEXT;

-- Add image_url column
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the license_expiry column name to match our interface
-- (it already exists as license_expiry, so no change needed)

-- Make full_name required (set a default for existing records)
UPDATE drivers SET full_name = 'Driver ' || license_number WHERE full_name IS NULL;
ALTER TABLE drivers ALTER COLUMN full_name SET NOT NULL;

-- Make age required (set a default for existing records)
UPDATE drivers SET age = 25 WHERE age IS NULL;
ALTER TABLE drivers ALTER COLUMN age SET NOT NULL;

-- Make address required (set a default for existing records)
UPDATE drivers SET address = 'Address not provided' WHERE address IS NULL;
ALTER TABLE drivers ALTER COLUMN address SET NOT NULL;

-- Make emergency_contact required (set a default for existing records)
UPDATE drivers SET emergency_contact = 'Emergency contact not provided' WHERE emergency_contact IS NULL;
ALTER TABLE drivers ALTER COLUMN emergency_contact SET NOT NULL;

-- Make emergency_phone required (set a default for existing records)
UPDATE drivers SET emergency_phone = '000-000-0000' WHERE emergency_phone IS NULL;
ALTER TABLE drivers ALTER COLUMN emergency_phone SET NOT NULL;

-- Create storage bucket for driver images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('driver-images', 'driver-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for driver images
CREATE POLICY "Driver images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'driver-images');

CREATE POLICY "Authenticated users can upload driver images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'driver-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update driver images" ON storage.objects
FOR UPDATE USING (bucket_id = 'driver-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete driver images" ON storage.objects
FOR DELETE USING (bucket_id = 'driver-images' AND auth.role() = 'authenticated');
