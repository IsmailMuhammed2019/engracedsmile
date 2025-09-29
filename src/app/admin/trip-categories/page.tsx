'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PlusCircle, Edit, Trash2, Tag, Percent, Calendar, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/AdminLayout'
import { toast } from 'sonner'

interface Trip {
  id: string
  route_id: string
  vehicle_id: string
  driver_id: string
  departure_time: string
  arrival_time: string
  price: number
  available_seats: number
  total_seats: number
  status: string
  is_active: boolean
  category: string
  is_promo: boolean
  promo_discount_percent: number
  promo_description?: string
  promo_valid_until?: string
  route?: {
    from_city: string
    to_city: string
  }
  vehicle?: {
    make: string
    model: string
    vehicle_type: string
  }
  driver?: {
    license_number: string
    phone_number: string
  }
}

interface RouteOption {
  id: string
  from_city: string
  to_city: string
  duration_hours?: number
  base_price?: number
}

interface VehicleOption {
  id: string
  make: string
  model: string
  vehicle_type: string
  capacity?: number
}

interface DriverOption {
  id: string
  license_number: string
  phone_number: string
}

const TRIP_CATEGORIES = [
  { value: 'regular', label: 'Regular', color: 'bg-gray-100 text-gray-800' },
  { value: 'premium', label: 'Premium', color: 'bg-blue-100 text-blue-800' },
  { value: 'luxury', label: 'Luxury', color: 'bg-purple-100 text-purple-800' },
  { value: 'express', label: 'Express', color: 'bg-green-100 text-green-800' },
  { value: 'overnight', label: 'Overnight', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'weekend', label: 'Weekend', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'holiday', label: 'Holiday', color: 'bg-red-100 text-red-800' },
]

export default function TripCategoriesPage() {
  const router = useRouter()
  const { user, profile, requireAdmin } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip> | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPromo, setFilterPromo] = useState<string>('all')
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [vehicles, setVehicles] = useState<VehicleOption[]>([])
  const [drivers, setDrivers] = useState<DriverOption[]>([])

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(from_city, to_city),
          vehicle:vehicles(make, model, vehicle_type),
          driver:drivers(license_number, phone_number)
        `)
        .order('departure_time', { ascending: false })

      if (error) throw error
      setTrips(data || [])

      // Fetch supporting data for creating trips
      const [routesRes, vehiclesRes, driversRes] = await Promise.all([
        supabase.from('routes').select('id, from_city, to_city, duration_hours, base_price').order('from_city'),
        supabase.from('vehicles').select('id, make, model, vehicle_type, capacity').eq('is_active', true).order('plate_number'),
        supabase.from('drivers').select('id, license_number, phone_number').eq('is_active', true).order('license_number'),
      ])
      if (routesRes.error) throw routesRes.error
      if (vehiclesRes.error) throw vehiclesRes.error
      if (driversRes.error) throw driversRes.error
      setRoutes(routesRes.data || [])
      setVehicles(vehiclesRes.data || [])
      setDrivers(driversRes.data || [])
    } catch (error) {
      console.error('Error fetching trips:', error)
      toast.error('Failed to load trips.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    requireAdmin()
    fetchTrips()
  }, [])

  const handleCreateNew = () => {
    setCurrentTrip({
      route_id: '',
      vehicle_id: '',
      driver_id: '',
      departure_time: new Date().toISOString().slice(0, 16),
      arrival_time: new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 16),
      price: 0,
      available_seats: 1,
      total_seats: 1,
      is_active: true,
      category: 'regular',
      is_promo: false,
      promo_discount_percent: 0,
    })
    setIsModalOpen(true)
  }

  const handleEdit = (trip: Trip) => {
    setCurrentTrip({
      ...trip,
      departure_time: trip.departure_time.slice(0, 16),
      arrival_time: trip.arrival_time.slice(0, 16),
      promo_valid_until: trip.promo_valid_until ? trip.promo_valid_until.slice(0, 16) : undefined,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    try {
      const { error } = await supabase.from('trips').delete().eq('id', id)
      if (error) throw error
      toast.success('Trip deleted successfully!')
      fetchTrips()
    } catch (error) {
      console.error('Error deleting trip:', error)
      toast.error('Failed to delete trip.')
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentTrip?.route_id || !currentTrip?.vehicle_id || !currentTrip?.driver_id || !currentTrip?.departure_time || !currentTrip?.arrival_time || currentTrip?.price === undefined || currentTrip?.total_seats === undefined) {
      toast.error('Please fill all required fields.')
      return
    }

    setFormLoading(true)
    try {
      const payload = {
        route_id: currentTrip.route_id,
        vehicle_id: currentTrip.vehicle_id,
        driver_id: currentTrip.driver_id,
        departure_time: new Date(currentTrip.departure_time as string).toISOString(),
        arrival_time: new Date(currentTrip.arrival_time as string).toISOString(),
        price: currentTrip.price,
        total_seats: currentTrip.total_seats,
        available_seats: currentTrip.available_seats !== undefined ? currentTrip.available_seats : currentTrip.total_seats,
        is_active: currentTrip.is_active ?? true,
        category: currentTrip.category || 'regular',
        is_promo: currentTrip.is_promo || false,
        promo_discount_percent: currentTrip.promo_discount_percent || 0,
        promo_description: currentTrip.promo_description,
        promo_valid_until: currentTrip.promo_valid_until,
      }

      if (currentTrip.id) {
        // Update existing trip
        const { error } = await supabase
          .from('trips')
          .update(payload)
          .eq('id', currentTrip.id)
          .select()
        if (error) throw error
        toast.success('Trip updated successfully!')
      } else {
        // Create new trip
        const { error } = await supabase.from('trips').insert(payload).select()
        if (error) throw error
        toast.success('Trip created successfully!')
      }
      setIsModalOpen(false)
      fetchTrips()
    } catch (error) {
      const message = (error && typeof error === 'object' && 'message' in (error as any))
        ? String((error as any).message)
        : JSON.stringify(error || {})
      console.error('Error saving trip:', message)
      toast.error(message || 'Failed to save trip.')
    } finally {
      setFormLoading(false)
    }
  }

  const getCategoryInfo = (category: string) => {
    return TRIP_CATEGORIES.find(cat => cat.value === category) || TRIP_CATEGORIES[0]
  }

  const filteredTrips = trips.filter(trip => {
    const categoryMatch = filterCategory === 'all' || trip.category === filterCategory
    const promoMatch = filterPromo === 'all' || 
      (filterPromo === 'promo' && trip.is_promo) || 
      (filterPromo === 'regular' && !trip.is_promo)
    return categoryMatch && promoMatch
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading trips...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trip Categories & Promos</h1>
            <p className="text-gray-600 mt-2">Manage trip categories and promotional offers</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Trip
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="category-filter">Filter by Category</Label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TRIP_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="promo-filter">Filter by Type</Label>
            <Select value={filterPromo} onValueChange={setFilterPromo}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="promo">Promo Trips</SelectItem>
                <SelectItem value="regular">Regular Trips</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const categoryInfo = getCategoryInfo(trip.category)
            const originalPrice = trip.is_promo ? trip.price / (1 - trip.promo_discount_percent / 100) : trip.price
            const discountAmount = originalPrice - trip.price

            return (
              <Card key={trip.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {trip.route?.from_city} → {trip.route?.to_city}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {trip.vehicle?.make} {trip.vehicle?.model} ({trip.vehicle?.vehicle_type})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={categoryInfo.color}>
                        {categoryInfo.label}
                      </Badge>
                      {trip.is_promo && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Percent className="h-3 w-3 mr-1" />
                          Promo
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Departure</span>
                    <span className="font-medium">
                      {new Date(trip.departure_time).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price</span>
                    <div className="text-right">
                      {trip.is_promo ? (
                        <div>
                          <span className="text-lg font-bold text-primary">
                            ₦{trip.price.toLocaleString()}
                          </span>
                          <div className="text-xs text-gray-500 line-through">
                            ₦{originalPrice.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600">
                            Save ₦{discountAmount.toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-lg font-bold">
                          ₦{trip.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Seats</span>
                    <span className="font-medium">
                      {trip.available_seats}/{trip.total_seats} available
                    </span>
                  </div>

                  {trip.is_promo && trip.promo_description && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <Star className="h-4 w-4 inline mr-1" />
                        {trip.promo_description}
                      </p>
                      {trip.promo_valid_until && (
                        <p className="text-xs text-orange-600 mt-1">
                          Valid until: {new Date(trip.promo_valid_until).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(trip)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(trip.id)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredTrips.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Trips Found</h3>
              <p className="text-gray-600 mb-4">
                {filterCategory !== 'all' || filterPromo !== 'all' 
                  ? 'No trips match your current filters.'
                  : 'No trips have been created yet.'
                }
              </p>
              <Button onClick={handleCreateNew}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Trip
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Trip Form Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentTrip?.id ? 'Edit Trip' : 'Create New Trip'}
              </DialogTitle>
              <p className="text-sm text-gray-500">Set route, vehicle, driver, time, seats, and optional promo.</p>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {/* Core selections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="route">Route</Label>
                  <Select
                    value={currentTrip?.route_id || ''}
                    onValueChange={(value) => setCurrentTrip({ ...currentTrip, route_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.from_city} → {r.to_city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Select
                    value={currentTrip?.vehicle_id || ''}
                    onValueChange={(value) => setCurrentTrip({ ...currentTrip, vehicle_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.make} {v.model} ({v.vehicle_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="driver">Driver</Label>
                  <Select
                    value={currentTrip?.driver_id || ''}
                    onValueChange={(value) => setCurrentTrip({ ...currentTrip, driver_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          Driver {d.license_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Trip Category</Label>
                  <Select
                    value={currentTrip?.category || 'regular'}
                    onValueChange={(value) => setCurrentTrip({ ...currentTrip, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIP_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={currentTrip?.price || ''}
                    onChange={(e) => setCurrentTrip({ ...currentTrip, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departure_time">Departure Time</Label>
                  <Input
                    id="departure_time"
                    type="datetime-local"
                    value={currentTrip?.departure_time || ''}
                    onChange={(e) => setCurrentTrip({ ...currentTrip, departure_time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="arrival_time">Arrival Time</Label>
                  <Input
                    id="arrival_time"
                    type="datetime-local"
                    value={currentTrip?.arrival_time || ''}
                    onChange={(e) => setCurrentTrip({ ...currentTrip, arrival_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_seats">Total Seats</Label>
                  <Input
                    id="total_seats"
                    type="number"
                    value={currentTrip?.total_seats || ''}
                    onChange={(e) => setCurrentTrip({ ...currentTrip, total_seats: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="available_seats">Available Seats</Label>
                  <Input
                    id="available_seats"
                    type="number"
                    value={currentTrip?.available_seats || ''}
                    onChange={(e) => setCurrentTrip({ ...currentTrip, available_seats: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              {/* Promo Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Promotional Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_promo"
                      checked={currentTrip?.is_promo || false}
                      onCheckedChange={(checked) => setCurrentTrip({ ...currentTrip, is_promo: !!checked })}
                    />
                    <Label htmlFor="is_promo">This is a promotional trip</Label>
                  </div>

                  {currentTrip?.is_promo && (
                    <>
                      <div>
                        <Label htmlFor="promo_discount_percent">Discount Percentage</Label>
                        <Input
                          id="promo_discount_percent"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={currentTrip?.promo_discount_percent || ''}
                          onChange={(e) => setCurrentTrip({ ...currentTrip, promo_discount_percent: parseFloat(e.target.value) || 0 })}
                          placeholder="e.g., 20 for 20% off"
                        />
                      </div>

                      <div>
                        <Label htmlFor="promo_description">Promo Description</Label>
                        <Textarea
                          id="promo_description"
                          value={currentTrip?.promo_description || ''}
                          onChange={(e) => setCurrentTrip({ ...currentTrip, promo_description: e.target.value })}
                          placeholder="e.g., Early bird special! Book now and save 20%"
                        />
                      </div>

                      <div>
                        <Label htmlFor="promo_valid_until">Valid Until</Label>
                        <Input
                          id="promo_valid_until"
                          type="datetime-local"
                          value={currentTrip?.promo_valid_until || ''}
                          onChange={(e) => setCurrentTrip({ ...currentTrip, promo_valid_until: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={currentTrip?.is_active ?? true}
                  onCheckedChange={(checked) => setCurrentTrip({ ...currentTrip, is_active: !!checked })}
                />
                <Label htmlFor="is_active">Active trip</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : currentTrip?.id ? 'Update Trip' : 'Create Trip'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}
