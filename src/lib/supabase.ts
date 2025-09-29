import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client with your credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      routes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          from_city: string
          to_city: string
          distance_km: number
          duration_hours: number
          base_price: number
          is_active: boolean
          description?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          from_city: string
          to_city: string
          distance_km: number
          duration_hours: number
          base_price: number
          is_active?: boolean
          description?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          from_city?: string
          to_city?: string
          distance_km?: number
          duration_hours?: number
          base_price?: number
          is_active?: boolean
          description?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          plate_number: string
          make: string
          model: string
          year: number
          capacity: number
          vehicle_type: 'bus' | 'minibus' | 'car'
          is_active: boolean
          features: string[]
          driver_id?: string
          images: string[]
          description?: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          plate_number: string
          make: string
          model: string
          year: number
          capacity: number
          vehicle_type: 'bus' | 'minibus' | 'car'
          is_active?: boolean
          features?: string[]
          driver_id?: string
          images?: string[]
          description?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          plate_number?: string
          make?: string
          model?: string
          year?: number
          capacity?: number
          vehicle_type?: 'bus' | 'minibus' | 'car'
          is_active?: boolean
          features?: string[]
          driver_id?: string
          images?: string[]
          description?: string
        }
      }
      drivers: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          license_number: string
          license_expiry: string
          phone_number: string
          is_active: boolean
          rating: number
          total_trips: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          license_number: string
          license_expiry: string
          phone_number: string
          is_active?: boolean
          rating?: number
          total_trips?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          license_number?: string
          license_expiry?: string
          phone_number?: string
          is_active?: boolean
          rating?: number
          total_trips?: number
        }
      }
      trips: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          route_id: string
          vehicle_id: string
          driver_id: string
          departure_time: string
          arrival_time: string
          price: number
          available_seats: number
          status: 'scheduled' | 'boarding' | 'in_progress' | 'completed' | 'cancelled'
          is_active: boolean
          category: 'regular' | 'premium' | 'luxury' | 'express' | 'overnight' | 'weekend' | 'holiday'
          is_promo: boolean
          promo_discount_percent: number
          promo_description?: string
          promo_valid_until?: string
          total_seats: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          route_id: string
          vehicle_id: string
          driver_id: string
          departure_time: string
          arrival_time: string
          price: number
          available_seats: number
          status?: 'scheduled' | 'boarding' | 'in_progress' | 'completed' | 'cancelled'
          is_active?: boolean
          category?: 'regular' | 'premium' | 'luxury' | 'express' | 'overnight' | 'weekend' | 'holiday'
          is_promo?: boolean
          promo_discount_percent?: number
          promo_description?: string
          promo_valid_until?: string
          total_seats?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          route_id?: string
          vehicle_id?: string
          driver_id?: string
          departure_time?: string
          arrival_time?: string
          price?: number
          available_seats?: number
          status?: 'scheduled' | 'boarding' | 'in_progress' | 'completed' | 'cancelled'
          is_active?: boolean
          category?: 'regular' | 'premium' | 'luxury' | 'express' | 'overnight' | 'weekend' | 'holiday'
          is_promo?: boolean
          promo_discount_percent?: number
          promo_description?: string
          promo_valid_until?: string
          total_seats?: number
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          trip_id: string
          passenger_name: string
          passenger_phone: string
          passenger_email: string
          seat_number: number
          total_amount: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_reference?: string
          booking_reference: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          trip_id: string
          passenger_name: string
          passenger_phone: string
          passenger_email: string
          seat_number: number
          total_amount: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_reference?: string
          booking_reference: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          trip_id?: string
          passenger_name?: string
          passenger_phone?: string
          passenger_email?: string
          seat_number?: number
          total_amount?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_reference?: string
          booking_reference?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          full_name: string
          phone_number: string
          date_of_birth?: string
          address?: string
          is_admin: boolean
          is_driver: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          full_name: string
          phone_number: string
          date_of_birth?: string
          address?: string
          is_admin?: boolean
          is_driver?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          full_name?: string
          phone_number?: string
          date_of_birth?: string
          address?: string
          is_admin?: boolean
          is_driver?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
