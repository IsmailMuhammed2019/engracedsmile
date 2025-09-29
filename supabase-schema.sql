-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE vehicle_type AS ENUM ('bus', 'minibus', 'car');
CREATE TYPE trip_status AS ENUM ('scheduled', 'boarding', 'in_progress', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE trip_category AS ENUM ('regular', 'premium', 'luxury', 'express', 'overnight', 'weekend', 'holiday');

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    date_of_birth DATE,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_driver BOOLEAN DEFAULT FALSE
);

-- Create drivers table
CREATE TABLE drivers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    phone_number TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_trips INTEGER DEFAULT 0
);

-- Create routes table
CREATE TABLE routes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    from_city TEXT NOT NULL,
    to_city TEXT NOT NULL,
    distance_km INTEGER NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT
);

-- Create vehicles table
CREATE TABLE vehicles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    plate_number TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    features TEXT[] DEFAULT '{}',
    driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}',
    description TEXT
);

-- Create trips table
CREATE TABLE trips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    available_seats INTEGER NOT NULL,
    status trip_status DEFAULT 'scheduled',
    is_active BOOLEAN DEFAULT TRUE,
    category trip_category DEFAULT 'regular',
    is_promo BOOLEAN DEFAULT FALSE,
    promo_discount_percent DECIMAL(5,2) DEFAULT 0.00,
    promo_description TEXT,
    promo_valid_until TIMESTAMP WITH TIME ZONE,
    total_seats INTEGER NOT NULL DEFAULT 1
);

-- Create bookings table
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    passenger_name TEXT NOT NULL,
    passenger_phone TEXT NOT NULL,
    passenger_email TEXT NOT NULL,
    seat_number INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status booking_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_reference TEXT,
    booking_reference TEXT UNIQUE NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_routes_from_to ON routes(from_city, to_city);
CREATE INDEX idx_trips_departure ON trips(departure_time);
CREATE INDEX idx_trips_route ON trips(route_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_trip ON bookings(trip_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_drivers_active ON drivers(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Routes policies (public read, admin write)
CREATE POLICY "Anyone can view active routes" ON routes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage routes" ON routes FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND is_admin = true
    )
);

-- Vehicles policies (public read, admin write)
CREATE POLICY "Anyone can view active vehicles" ON vehicles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage vehicles" ON vehicles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND is_admin = true
    )
);

-- Trips policies (public read, admin write)
CREATE POLICY "Anyone can view active trips" ON trips FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage trips" ON trips FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND is_admin = true
    )
);

-- Bookings policies
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all bookings" ON bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND is_admin = true
    )
);

-- Drivers policies
CREATE POLICY "Anyone can view active drivers" ON drivers FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage drivers" ON drivers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = auth.uid() AND is_admin = true
    )
);

-- Insert sample data
INSERT INTO routes (from_city, to_city, distance_km, duration_hours, base_price, description) VALUES
('Lagos', 'Abuja', 750, 8.5, 15000, 'Lagos to Abuja express route'),
('Lagos', 'Kano', 1200, 12.0, 25000, 'Lagos to Kano long distance'),
('Abuja', 'Kano', 450, 6.0, 12000, 'Abuja to Kano northern route'),
('Lagos', 'Port Harcourt', 600, 7.0, 18000, 'Lagos to Port Harcourt southern route'),
('Abuja', 'Port Harcourt', 400, 5.5, 15000, 'Abuja to Port Harcourt route'),
('Lagos', 'Ibadan', 150, 2.5, 5000, 'Lagos to Ibadan short route'),
('Abuja', 'Kaduna', 200, 3.0, 8000, 'Abuja to Kaduna route'),
('Lagos', 'Enugu', 500, 6.5, 15000, 'Lagos to Enugu eastern route');

-- Create a function to generate booking reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ES' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create a function to update available seats
CREATE OR REPLACE FUNCTION update_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE trips 
        SET available_seats = available_seats - 1 
        WHERE id = NEW.trip_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE trips 
        SET available_seats = available_seats + 1 
        WHERE id = OLD.trip_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.trip_id != NEW.trip_id THEN
            UPDATE trips 
            SET available_seats = available_seats + 1 
            WHERE id = OLD.trip_id;
            UPDATE trips 
            SET available_seats = available_seats - 1 
            WHERE id = NEW.trip_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating available seats
CREATE TRIGGER update_seats_on_booking
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_available_seats();

-- Create function to decrement available seats (for payment verification)
CREATE OR REPLACE FUNCTION decrement_available_seats(trip_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE trips 
    SET available_seats = available_seats - 1 
    WHERE id = trip_id AND available_seats > 0;
END;
$$ LANGUAGE plpgsql;
