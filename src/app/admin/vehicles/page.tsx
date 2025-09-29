'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/AdminLayout'
import VehicleImageUpload from '@/components/admin/VehicleImageUpload'
import { toast } from 'sonner'

interface Vehicle {
  id: string
  plate_number: string
  make: string
  model: string
  year: number
  capacity: number
  vehicle_type: 'bus' | 'minibus' | 'car'
  is_active: boolean
  features: string[]
  images: string[]
  description?: string
  driver?: {
    full_name: string
    phone_number: string
  }
}

export default function VehiclesPage() {
  const { isLoading, requireAdmin } = useAuth()
  const requireAdminRef = useRef(requireAdmin)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: 0,
    vehicle_type: 'bus' as 'bus' | 'minibus' | 'car',
    features: [] as string[],
    images: [] as string[],
    description: '',
    is_active: true
  })

  // Update ref when requireAdmin changes
  useEffect(() => {
    requireAdminRef.current = requireAdmin
  }, [requireAdmin])

  useEffect(() => {
    if (isLoading) return
    if (!requireAdminRef.current()) return
    fetchVehicles()
  }, [isLoading])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Build payload explicitly to avoid sending columns that may not exist in DB
      const basePayload: {
        plate_number: string
        make: string
        model: string
        year: number
        capacity: number
        vehicle_type: 'bus' | 'minibus' | 'car'
        is_active: boolean
        features: string[]
        images: string[]
        description?: string
      } = {
        plate_number: formData.plate_number,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        capacity: formData.capacity,
        vehicle_type: formData.vehicle_type,
        is_active: formData.is_active,
        features: formData.features || [],
        images: formData.images || [],
      }

      if (formData.description && formData.description.trim().length > 0) {
        basePayload.description = formData.description.trim()
      }

      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            ...basePayload,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingVehicle.id)
          .select()

        if (error) throw error
        toast.success('Vehicle updated successfully')
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert([basePayload])
          .select()

        if (error) throw error
        toast.success('Vehicle created successfully')
      }

      setIsDialogOpen(false)
      setEditingVehicle(null)
      resetForm()
      fetchVehicles()
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error || {})
      console.error('Error saving vehicle:', message)
      toast.error(message || 'Failed to save vehicle')
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setFormData({
      plate_number: vehicle.plate_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      capacity: vehicle.capacity,
      vehicle_type: vehicle.vehicle_type,
      features: vehicle.features,
      images: vehicle.images,
      description: vehicle.description || '',
      is_active: vehicle.is_active
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (vehicleId: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error
      toast.success('Vehicle deleted successfully')
      fetchVehicles()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      toast.error('Failed to delete vehicle')
    }
  }

  const resetForm = () => {
    setFormData({
      plate_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: 0,
      vehicle_type: 'bus',
      features: [],
      images: [],
      description: '',
      is_active: true
    })
  }

  const handleNewVehicle = () => {
    setEditingVehicle(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const getVehicleTypeColor = (type: string) => {
    switch (type) {
      case 'bus': return 'bg-blue-100 text-blue-800'
      case 'minibus': return 'bg-green-100 text-green-800'
      case 'car': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicles...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewVehicle}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </DialogTitle>
                <DialogDescription>
                  {editingVehicle ? 'Update vehicle details and images' : 'Enter vehicle details and upload images'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="plate_number">Plate Number</Label>
                    <Input
                      id="plate_number"
                      value={formData.plate_number}
                      onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicle_type">Vehicle Type</Label>
                    <Select
                      value={formData.vehicle_type}
                      onValueChange={(value: 'bus' | 'minibus' | 'car') => 
                        setFormData({ ...formData, vehicle_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="minibus">Minibus</SelectItem>
                        <SelectItem value="car">Car</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      value={Number.isNaN(formData.year) ? 0 : formData.year}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({ 
                          ...formData, 
                          year: value === '' ? 0 : parseInt(value, 10) 
                        })
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={Number.isNaN(formData.capacity) ? 0 : formData.capacity}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({ 
                          ...formData, 
                          capacity: value === '' ? 0 : parseInt(value, 10) 
                        })
                      }}
                      required
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                {/* Vehicle Features */}
                <div>
                  <Label>Vehicle Features</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {[
                      'Air Conditioning',
                      'WiFi',
                      'USB Charging',
                      'Reclining Seats',
                      'Reading Light',
                      'Entertainment System',
                      'Refreshments',
                      'Toilet',
                      'Luggage Storage',
                      'Priority Boarding'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`feature-${feature}`}
                          checked={formData.features.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                features: [...formData.features, feature]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                features: formData.features.filter(f => f !== feature)
                              })
                            }
                          }}
                          className="h-4 w-4"
                        />
                        <Label htmlFor={`feature-${feature}`} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <VehicleImageUpload
                  vehicleId={editingVehicle?.id || 'new'}
                  currentImages={formData.images}
                  onImagesUpdate={(images) => setFormData({ ...formData, images })}
                />

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingVehicle ? 'Update Vehicle' : 'Create Vehicle'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{vehicle.plate_number}</CardTitle>
                    <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model}</p>
                  </div>
                  <Badge className={getVehicleTypeColor(vehicle.vehicle_type)}>
                    {vehicle.vehicle_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Year:</span>
                    <span>{vehicle.year}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{vehicle.capacity} seats</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge variant={vehicle.is_active ? 'default' : 'secondary'}>
                      {vehicle.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {vehicle.driver && (
                    <div className="flex justify-between text-sm">
                      <span>Driver:</span>
                      <span>{vehicle.driver.full_name}</span>
                    </div>
                  )}
                </div>

                {/* Vehicle Features */}
                {vehicle.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {vehicle.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Images */}
                {vehicle.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {vehicle.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Vehicle ${index + 1}`}
                          className="w-16 h-12 object-cover rounded border"
                        />
                      ))}
                      {vehicle.images.length > 3 && (
                        <div className="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs">
                          +{vehicle.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {vehicles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No Vehicles Found</h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first vehicle to the fleet.
              </p>
              <Button onClick={handleNewVehicle}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Vehicle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
