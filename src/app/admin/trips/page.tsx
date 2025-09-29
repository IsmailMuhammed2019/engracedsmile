'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Bus, 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Edit,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import AdminLayout from '@/components/layout/AdminLayout'
import Image from 'next/image'

interface Route {
  id: string
  from_city: string
  to_city: string
  distance_km: number
  duration_hours: number
  base_price?: number
}

interface Vehicle {
  id: string
  plate_number: string
  make: string
  model: string
  year: number
  capacity: number
  vehicle_type: string
  images: string[]
}

interface Driver {
  id: string
  license_number: string
  phone_number: string
}

interface Trip {
  id: string
  route_id: string
  vehicle_id: string
  driver_id: string
  departure_time: string
  arrival_time: string
  price: number
  available_seats: number
  is_active: boolean
  category: string
  is_promo: boolean
  promo_discount_percent: number
  promo_description?: string
  promo_valid_until?: string
  route?: Route
  vehicle?: Vehicle
  driver?: Driver
}

export default function AdminTripsPage() {
  const { user, profile, isLoading, requireAdmin } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const requireAdminRef = useRef(requireAdmin)

  const [formData, setFormData] = useState({
    route_id: '',
    vehicle_id: '',
    driver_id: '',
    departure_time: '',
    price: '',
    available_seats: ''
  })

  // Update ref when requireAdmin changes
  useEffect(() => {
    requireAdminRef.current = requireAdmin
  }, [requireAdmin])

  // Check authentication and fetch data
  useEffect(() => {
    if (isLoading) return
    if (!user || !profile?.is_admin) {
      requireAdminRef.current()
      return
    }
    fetchData()
  }, [isLoading, user, profile])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch trips with related data
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(*),
          vehicle:vehicles(*),
          driver:drivers(*)
        `)
        .order('departure_time', { ascending: true })

      if (tripsError) throw tripsError

      // Fetch routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select('*')
        .order('from_city')

      if (routesError) throw routesError

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('is_active', true)
        .order('plate_number')

      if (vehiclesError) throw vehiclesError

      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .order('license_number')

      if (driversError) throw driversError

      setTrips(tripsData || [])
      setRoutes(routesData || [])
      setVehicles(vehiclesData || [])
      setDrivers(driversData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate required selections
      if (!formData.route_id || !formData.vehicle_id || !formData.driver_id || !formData.departure_time) {
        toast.error('Please select route, vehicle, driver and departure time')
        return
      }

      const selectedRoute = routes.find(r => r.id === formData.route_id)
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id)

      // Compute arrival_time using route duration
      const departureLocal = new Date(formData.departure_time)
      const durationMinutes = Math.round((selectedRoute?.duration_hours || 0) * 60)
      const arrivalDate = new Date(departureLocal.getTime() + durationMinutes * 60 * 1000)
      const arrival_time = arrivalDate.toISOString()

      // Price: use entered price or fallback to route base_price
      const enteredPrice = parseFloat(formData.price)
      const price = Number.isFinite(enteredPrice) && enteredPrice > 0
        ? enteredPrice
        : (selectedRoute?.base_price || 0)

      // Available seats: use entered or vehicle capacity
      const enteredSeats = parseInt(formData.available_seats)
      const available_seats = Number.isFinite(enteredSeats) && enteredSeats > 0
        ? enteredSeats
        : (selectedVehicle?.capacity || 0)
      
      if (!Number.isFinite(price) || price <= 0) {
        toast.error('Please enter a valid price or set route base price')
        return
      }
      if (!Number.isFinite(available_seats) || available_seats <= 0) {
        toast.error('Please enter available seats or ensure vehicle capacity is set')
        return
      }

      const tripData = {
        route_id: formData.route_id,
        vehicle_id: formData.vehicle_id,
        driver_id: formData.driver_id,
        departure_time: new Date(formData.departure_time).toISOString(),
        arrival_time,
        price,
        available_seats,
        is_active: true
      }

      if (editingTrip) {
        const { error } = await supabase
          .from('trips')
          .update(tripData)
          .eq('id', editingTrip.id)
          .select()

        if (error) throw error
        toast.success('Trip updated successfully')
      } else {
        const { error } = await supabase
          .from('trips')
          .insert(tripData)
          .select()

        if (error) throw error
        toast.success('Trip created successfully')
      }

      setShowForm(false)
      setEditingTrip(null)
      setFormData({
        route_id: '',
        vehicle_id: '',
        driver_id: '',
        departure_time: '',
        price: '',
        available_seats: ''
      })
      fetchData()
    } catch (error: unknown) {
      console.error('Error saving trip:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save trip'
      toast.error(errorMessage)
    }
  }

  const handleEdit = (trip: Trip) => {
    setEditingTrip(trip)
    setFormData({
      route_id: trip.route_id,
      vehicle_id: trip.vehicle_id,
      driver_id: trip.driver_id,
      departure_time: trip.departure_time,
      price: trip.price.toString(),
      available_seats: trip.available_seats.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId)

      if (error) throw error
      toast.success('Trip deleted successfully')
      fetchData()
    } catch (error: unknown) {
      console.error('Error deleting trip:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete trip'
      toast.error(errorMessage)
    }
  }

  const toggleTripStatus = async (trip: Trip) => {
    try {
      const { error } = await supabase
        .from('trips')
        .update({ is_active: !trip.is_active })
        .eq('id', trip.id)

      if (error) throw error
      toast.success(`Trip ${trip.is_active ? 'deactivated' : 'activated'} successfully`)
      fetchData()
    } catch (error: unknown) {
      console.error('Error updating trip status:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trip status'
      toast.error(errorMessage)
    }
  }

  // Show loading while auth resolving or fetching
  if (isLoading || loading || !user || !profile?.is_admin) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Trips</h1>
            <p className="text-gray-600">Create and manage trip schedules</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Trip
          </Button>
        </div>
            {showForm && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{editingTrip ? 'Edit Trip' : 'Add New Trip'}</CardTitle>
                  <CardDescription>
                    {editingTrip ? 'Update trip details' : 'Create a new trip schedule'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="route_id">Route</Label>
                        <Select value={formData.route_id} onValueChange={(value) => setFormData({...formData, route_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select route" />
                          </SelectTrigger>
                          <SelectContent>
                            {routes.map((route) => (
                              <SelectItem key={route.id} value={route.id}>
                                {route.from_city} → {route.to_city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicle_id">Vehicle</Label>
                        <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({...formData, vehicle_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.make} {vehicle.model} ({vehicle.plate_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="driver_id">Driver</Label>
                        <Select value={formData.driver_id} onValueChange={(value) => setFormData({...formData, driver_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                Driver {driver.license_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="departure_time">Departure Time</Label>
                        <Input
                          id="departure_time"
                          type="datetime-local"
                          value={formData.departure_time}
                          onChange={(e) => setFormData({...formData, departure_time: e.target.value})}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₦)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          placeholder="Enter price"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="available_seats">Available Seats</Label>
                        <Input
                          id="available_seats"
                          type="number"
                          value={formData.available_seats}
                          onChange={(e) => setFormData({...formData, available_seats: e.target.value})}
                          placeholder="Enter available seats"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-primary hover:bg-primary/90">
                        {editingTrip ? 'Update Trip' : 'Create Trip'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowForm(false)
                        setEditingTrip(null)
                        setFormData({
                          route_id: '',
                          vehicle_id: '',
                          driver_id: '',
                          departure_time: '',
                          price: '',
                          available_seats: ''
                        })
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {trips.map((trip) => (
                <Card key={trip.id} className="h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {trip.route?.from_city} → {trip.route?.to_city}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(trip.departure_time).toLocaleDateString()} at {new Date(trip.departure_time).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge variant={trip.is_active ? 'default' : 'secondary'}>
                            {trip.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{trip.vehicle?.make} {trip.vehicle?.model}</p>
                              <p className="text-xs text-muted-foreground">{trip.vehicle?.plate_number}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">Driver {trip.driver?.license_number}</p>
                              <p className="text-xs text-muted-foreground">{trip.driver?.phone_number}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">₦{trip.price.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">{trip.available_seats} seats available</p>
                            </div>
                          </div>
                        </div>

                        {trip.vehicle?.images && trip.vehicle.images.length > 0 && (
                          <div className="flex gap-2 mb-4">
                            {trip.vehicle.images.slice(0, 3).map((image, index) => (
                              <Image
                                key={index}
                                src={image}
                                alt={`Vehicle ${index + 1}`}
                                width={64}
                                height={64}
                                className="w-16 h-16 object-cover rounded-md border"
                              />
                            ))}
                          </div>
                        )}
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trip)}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleTripStatus(trip)}
                      >
                        {trip.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(trip.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {trips.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No trips found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first trip to get started
                    </p>
                    <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trip
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </AdminLayout>
      )
    }
