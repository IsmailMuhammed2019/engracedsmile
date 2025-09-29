'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Bus, Star, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBookingStore } from '@/lib/stores/booking'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import PWALayout from '@/components/layout/PWALayout'
import PaystackPayment from '@/components/payment/PaystackPayment'
import { toast } from 'sonner'

export default function ConfirmBookingPage() {
  const router = useRouter()
  const { user, requireAuth } = useAuth()
  const { selectedTrip, bookingData, setBookingData, resetBooking } = useBookingStore()
  const [loading, setLoading] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)

  // Redirect if not authenticated or no trip selected
  if (!user) {
    requireAuth()
    return null
  }

  if (!selectedTrip) {
    router.push('/book')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setBookingData({ [field]: value })
  }

  const generateBookingReference = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ES${dateStr}${randomNum}`
  }

  const handleBooking = async () => {
    if (!bookingData.passengerName || !bookingData.passengerPhone || !bookingData.passengerEmail) {
      toast.error('Please fill in all passenger details')
      return
    }

    setLoading(true)

    try {
      const bookingReference = generateBookingReference()
      const totalAmount = selectedTrip.price * 1 // Assuming 1 passenger for now

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          trip_id: selectedTrip.id,
          passenger_name: bookingData.passengerName,
          passenger_phone: bookingData.passengerPhone,
          passenger_email: bookingData.passengerEmail,
          seat_number: bookingData.seatNumber || 1,
          total_amount: totalAmount,
          booking_reference: bookingReference,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      setBookingId(data.id)
      setShowPayment(true)
      toast.success('Booking created! Please complete payment.')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async (reference: string) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          bookingId
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Payment successful! Your booking is confirmed.')
        resetBooking()
        router.push(`/bookings/${bookingId}`)
      } else {
        toast.error('Payment verification failed. Please contact support.')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Payment verification failed. Please contact support.')
    }
  }

  const handlePaymentClose = () => {
    setShowPayment(false)
    toast.info('Payment cancelled. You can complete payment later from your bookings.')
    router.push('/bookings')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <PWALayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{selectedTrip.route.from_city}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{selectedTrip.route.to_city}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{formatDate(selectedTrip.departure_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {formatTime(selectedTrip.departure_time)} - {formatTime(selectedTrip.arrival_time)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bus className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedTrip.vehicle.make} {selectedTrip.vehicle.model}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm">{selectedTrip.driver.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({selectedTrip.driver.total_trips} trips)</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₦{selectedTrip.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="passengerName">Full Name</Label>
                    <Input
                      id="passengerName"
                      value={bookingData.passengerName}
                      onChange={(e) => handleInputChange('passengerName', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="passengerPhone">Phone Number</Label>
                    <Input
                      id="passengerPhone"
                      value={bookingData.passengerPhone}
                      onChange={(e) => handleInputChange('passengerPhone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="passengerEmail">Email Address</Label>
                  <Input
                    id="passengerEmail"
                    type="email"
                    value={bookingData.passengerEmail}
                    onChange={(e) => handleInputChange('passengerEmail', e.target.value)}
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <Label htmlFor="seatNumber">Seat Number</Label>
                  <Input
                    id="seatNumber"
                    type="number"
                    min="1"
                    max={selectedTrip.vehicle.capacity}
                    value={bookingData.seatNumber || ''}
                    onChange={(e) => handleInputChange('seatNumber', e.target.value)}
                    placeholder="Select seat number"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Available seats: {selectedTrip.available_seats}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Online Payment (Recommended)</p>
                        <p className="text-sm text-blue-700">Secure payment with Paystack - Card, Bank Transfer, USSD</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Pay on Board</p>
                        <p className="text-sm text-gray-500">Pay when you board the vehicle</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleBooking}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && bookingId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <PaystackPayment
                amount={selectedTrip.price}
                email={bookingData.passengerEmail}
                bookingReference={generateBookingReference()}
                onSuccess={handlePaymentSuccess}
                onClose={handlePaymentClose}
              />
            </div>
          </div>
        )}
      </div>
    </PWALayout>
  )
}
