'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import CustomerLayout from '@/components/layout/CustomerLayout'

interface Booking {
  id: string
  passenger_name: string
  passenger_phone: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  trip: {
    id: string
    departure_time: string
    arrival_time: string
    price: number
    route: {
      from_city: string
      to_city: string
    }
    vehicle: {
      make: string
      model: string
      plate_number: string
    }
    driver: {
      name: string
      phone: string
    }
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const { user, requireAuth } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            id,
            departure_time,
            arrival_time,
            price,
            route:routes(from_city, to_city),
            vehicle:vehicles(make, model, plate_number),
            driver:drivers(name, phone)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      requireAuth()
      return
    }
    fetchBookings()
  }, [user, requireAuth, fetchBookings])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'pending': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <Button onClick={() => router.push('/book')}>
            Book New Trip
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
              <p className="text-gray-600 mb-6">
                You haven&apos;t made any bookings yet. Start by searching for trips.
              </p>
              <Button onClick={() => router.push('/book')}>
                Search for Trips
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{booking.trip.route.from_city} → {booking.trip.route.to_city}</span>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status.toUpperCase()}</span>
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        Booking ID: {booking.id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(booking.total_amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Trip Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Departure: {formatDate(booking.trip.departure_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>Arrival: {formatDate(booking.trip.arrival_time)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>Vehicle: {booking.trip.vehicle.make} {booking.trip.vehicle.model}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Passenger Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{booking.passenger_name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">📞</span>
                            <span>{booking.passenger_phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Driver Contact</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span>{booking.trip.driver.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">📞</span>
                            <span>{booking.trip.driver.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Booked on: {formatDate(booking.created_at)}</span>
                      <span>Vehicle Plate: {booking.trip.vehicle.plate_number}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}