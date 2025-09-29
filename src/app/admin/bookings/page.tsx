'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import AdminLayout from '@/components/layout/AdminLayout'

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
  const { requireAdmin } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')

  useEffect(() => {
    requireAdmin()
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
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
            driver:drivers(license_number, phone_number)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      toast.success('Booking status updated successfully!')
      fetchBookings()
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update booking status')
    }
  }

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
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.passenger_phone.includes(searchTerm) ||
      booking.trip.route.from_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.trip.route.to_city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const matchesPayment = paymentFilter === 'all' || booking.payment_status === paymentFilter
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Bookings Management</h1>
            <p className="text-gray-600">View and manage all customer bookings</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending Payment</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{booking.passenger_name}</h3>
                      <p className="text-sm text-gray-600">
                        {booking.trip.route.from_city} → {booking.trip.route.to_city}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.created_at)} • {booking.passenger_phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-semibold">{formatCurrency(booking.total_amount)}</p>
                      <p className="text-sm text-gray-600">
                        {booking.payment_status === 'paid' ? 'Paid' : 'Pending Payment'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status.toUpperCase()}</span>
                      </Badge>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Trip Details */}
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Trip Details</p>
                      <p className="text-gray-600">
                        Departure: {formatDate(booking.trip.departure_time)}
                      </p>
                      <p className="text-gray-600">
                        Arrival: {formatDate(booking.trip.arrival_time)}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Vehicle</p>
                      <p className="text-gray-600">
                        {booking.trip.vehicle.make} {booking.trip.vehicle.model}
                      </p>
                      <p className="text-gray-600">
                        Plate: {booking.trip.vehicle.plate_number}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Driver</p>
                      <p className="text-gray-600">Driver {booking.trip.driver.license_number}</p>
                      <p className="text-gray-600">{booking.trip.driver.phone_number}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                  ? 'No bookings match your current filters.' 
                  : 'No bookings have been made yet.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
