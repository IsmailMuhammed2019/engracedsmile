'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, MapPin, Users, Bus, Star, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useBookingStore } from '@/lib/stores/booking'
import { supabase } from '@/lib/supabase'
import PWALayout from '@/components/layout/PWALayout'

interface Trip {
  id: string
  route: {
    from_city: string
    to_city: string
    distance_km: number
    duration_hours: number
  }
  vehicle: {
    make: string
    model: string
    capacity: number
    vehicle_type: string
    features: string[]
    images: string[]
  }
  driver: {
    full_name: string
    rating: number
    total_trips: number
  }
  departure_time: string
  arrival_time: string
  price: number
  available_seats: number
  status: string
  category: string
  is_promo: boolean
  promo_discount_percent: number
  promo_description?: string
  promo_valid_until?: string
}

export default function BookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { searchParams: bookingParams, setSelectedTrip } = useBookingStore()
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPromoOnly, setShowPromoOnly] = useState(false)

  // Get search params from URL or store
  const from = searchParams.get('from') || bookingParams.from
  const to = searchParams.get('to') || bookingParams.to
  const date = searchParams.get('date') || bookingParams.date
  const passengers = Number(searchParams.get('passengers')) || bookingParams.passengers

  const searchTrips = useCallback(async () => {
    if (!from || !to || !date) return

    setLoading(true)
    setError(null)

    try {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(*),
          vehicle:vehicles(*),
          driver:drivers(*)
        `)
        .eq('route.from_city', from)
        .eq('route.to_city', to)
        .gte('departure_time', startDate.toISOString())
        .lt('departure_time', endDate.toISOString())
        .eq('is_active', true)
        .gte('available_seats', passengers)
        .order('departure_time')

      if (error) throw error

      setTrips(data || [])
      setFilteredTrips(data || [])
    } catch (err) {
      setError('Failed to search trips. Please try again.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }, [from, to, date, passengers])

  // Filter trips based on category and promo status
  useEffect(() => {
    let filtered = trips

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(trip => trip.category === selectedCategory)
    }

    // Filter by promo status
    if (showPromoOnly) {
      filtered = filtered.filter(trip => trip.is_promo)
    }

    setFilteredTrips(filtered)
  }, [trips, selectedCategory, showPromoOnly])

  useEffect(() => {
    if (from && to && date) {
      searchTrips()
    }
  }, [from, to, date, searchTrips])

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    router.push('/book/confirm')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-100 text-green-800'
      case 'boarding': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!from || !to || !date) {
    return (
      <PWALayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Search Parameters Missing</h2>
              <p className="text-gray-600 mb-6">
                Please provide all required search parameters to find trips.
              </p>
              <Button onClick={() => router.push('/')}>
                Go Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
      </PWALayout>
    )
  }

  return (
    <PWALayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">{from}</p>
                </div>
                <div className="text-gray-400">→</div>
                <div className="text-center">
                  <MapPin className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">{to}</p>
                </div>
                <div className="text-center">
                  <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">{formatDate(date)}</p>
                </div>
                <div className="text-center">
                  <Users className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-sm font-medium">{passengers} Passenger{passengers > 1 ? 's' : ''}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
              >
                Modify Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Searching for trips...</p>
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-2">Search Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={searchTrips}>Try Again</Button>
            </CardContent>
          </Card>
        ) : filteredTrips.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No Trips Found</h3>
              <p className="text-gray-600 mb-4">
                {trips.length === 0 
                  ? "Sorry, no trips are available for your selected route and date."
                  : "No trips match your current filter criteria. Try adjusting your filters."
                }
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => router.push('/')}>
                  Try Different Search
                </Button>
                {trips.length > 0 && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all')
                      setShowPromoOnly(false)
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold">
                {filteredTrips.length} Trip{filteredTrips.length > 1 ? 's' : ''} Found
              </h2>
              
              {/* Filter Controls */}
              <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="luxury">Luxury</option>
                    <option value="express">Express</option>
                  </select>
                </div>
                
                {/* Promo Filter */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={showPromoOnly}
                      onChange={(e) => setShowPromoOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Promo Only
                  </label>
                </div>
                
                {/* Clear Filters */}
                {(selectedCategory !== 'all' || showPromoOnly) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory('all')
                      setShowPromoOnly(false)
                    }}
                    className="text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
            
            {filteredTrips.map((trip) => (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Trip Details */}
                    <div className="lg:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                          {trip.route.from_city} → {trip.route.to_city}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(trip.status)}>
                            {trip.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {trip.category.toUpperCase()}
                          </Badge>
                          {trip.is_promo && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Percent className="h-3 w-3 mr-1" />
                              PROMO
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Departure</p>
                            <p className="font-medium">{formatTime(trip.departure_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600">Arrival</p>
                            <p className="font-medium">{formatTime(trip.arrival_time)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-1">
                          <Bus className="h-4 w-4" />
                          <span>{trip.vehicle.make} {trip.vehicle.model}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{trip.available_seats} seats available</span>
                        </div>
                      </div>

                      {/* Vehicle Images */}
                      {trip.vehicle.images && trip.vehicle.images.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {trip.vehicle.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${trip.vehicle.make} ${trip.vehicle.model} ${index + 1}`}
                              className="w-20 h-16 object-cover rounded-md border"
                            />
                          ))}
                          {trip.vehicle.images.length > 3 && (
                            <div className="w-20 h-16 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-500">
                              +{trip.vehicle.images.length - 3} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* Vehicle Features */}
                      {trip.vehicle.features && trip.vehicle.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {trip.vehicle.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Driver Info */}
                    <div>
                      <h4 className="font-semibold mb-2">Driver</h4>
                      <p className="text-sm text-gray-600 mb-1">{trip.driver.full_name}</p>
                      <div className="flex items-center space-x-1 mb-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{trip.driver.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({trip.driver.total_trips} trips)</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {trip.route.distance_km}km • {trip.route.duration_hours}h
                      </div>
                    </div>

                    {/* Price and Book */}
                    <div className="text-right">
                      <div className="mb-4">
                        {trip.is_promo ? (
                          <div>
                            <p className="text-3xl font-bold text-primary">
                              ₦{trip.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              ₦{Math.round(trip.price / (1 - trip.promo_discount_percent / 100)).toLocaleString()}
                            </p>
                            <p className="text-sm text-green-600 font-medium">
                              Save {trip.promo_discount_percent}%
                            </p>
                            {trip.promo_description && (
                              <p className="text-xs text-orange-600 mt-1">
                                {trip.promo_description}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-3xl font-bold text-primary">
                              ₦{trip.price.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">per passenger</p>
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => handleSelectTrip(trip)}
                        className="w-full"
                        disabled={trip.available_seats < passengers}
                      >
                        {trip.available_seats < passengers ? 'Not Available' : 'Select Trip'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PWALayout>
  )
}
