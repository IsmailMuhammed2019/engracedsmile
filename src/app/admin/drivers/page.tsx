'use client'

import { useState, useEffect } from 'react'
import { Plus, UserCheck, Edit, Trash2, Search, Phone, IdCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import AdminLayout from '@/components/layout/AdminLayout'

interface Driver {
  id: string
  full_name: string
  age: number
  phone_number: string
  license_number: string
  license_expiry: string
  address: string
  emergency_contact: string
  emergency_phone: string
  image_url?: string
  is_active: boolean
  created_at: string
}

export default function DriversPage() {
  const { requireAdmin } = useAuth()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    phone_number: '',
    license_number: '',
    license_expiry: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const DRIVER_BUCKET = (process.env.NEXT_PUBLIC_DRIVER_IMAGES_BUCKET || 'driver-images').trim()

  useEffect(() => {
    requireAdmin()
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to load drivers.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name || !formData.age || !formData.phone_number || !formData.license_number || !formData.license_expiry || !formData.address || !formData.emergency_contact || !formData.emergency_phone) {
      toast.error('Please fill all required fields.')
      return
    }

    try {
      let imageUrl = formData.image_url

      // Handle image upload if a new file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `drivers/${fileName}`

        // Ensure authenticated for upload
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData?.session?.user) {
          toast.error('You must be signed in to upload images')
          return
        }

        const { error: uploadError } = await supabase.storage
          .from(DRIVER_BUCKET)
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: true,
            contentType: imageFile.type,
          })

        if (uploadError) {
          const msg = (uploadError as unknown as { message?: string })?.message || 'Upload failed'
          if (msg.toLowerCase().includes('bucket not found')) {
            toast.error(`Storage bucket "${DRIVER_BUCKET}" not found`)
          } else {
            toast.error(msg)
          }
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from(DRIVER_BUCKET)
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Attach current user id when available (helps with schemas requiring user_id)
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id || null

      const driverData = {
        full_name: formData.full_name,
        age: parseInt(formData.age),
        phone_number: formData.phone_number,
        license_number: formData.license_number,
        license_expiry: formData.license_expiry,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone,
        image_url: imageUrl,
        is_active: true,
        ...(userId ? { user_id: userId } : {})
      }

      if (editingDriver) {
        // Update existing driver
        const { error } = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editingDriver.id)
          .select()

        if (error) throw error
        toast.success('Driver updated successfully.')
      } else {
        // Create new driver
        const { error } = await supabase
          .from('drivers')
          .insert(driverData)
          .select()

        if (error) throw error
        toast.success('Driver added successfully.')
      }

      setShowForm(false)
      setEditingDriver(null)
      setFormData({ 
        full_name: '', 
        age: '', 
        phone_number: '', 
        license_number: '', 
        license_expiry: '', 
        address: '', 
        emergency_contact: '', 
        emergency_phone: '', 
        image_url: '' 
      })
      setImageFile(null)
      fetchDrivers()
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error || {})
      console.error('Error saving driver:', message)
      toast.error(message || 'Failed to save driver.')
    }
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setFormData({
      full_name: driver.full_name,
      age: driver.age.toString(),
      phone_number: driver.phone_number,
      license_number: driver.license_number,
      license_expiry: driver.license_expiry,
      address: driver.address,
      emergency_contact: driver.emergency_contact,
      emergency_phone: driver.emergency_phone,
      image_url: driver.image_url || ''
    })
    setImageFile(null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this driver?')) return

    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Driver deleted successfully.')
      fetchDrivers()
    } catch (error) {
      console.error('Error deleting driver:', error)
      toast.error('Failed to delete driver.')
    }
  }

  const toggleActive = async (driver: Driver) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active: !driver.is_active })
        .eq('id', driver.id)

      if (error) throw error
      toast.success(`Driver ${driver.is_active ? 'deactivated' : 'activated'} successfully.`)
      fetchDrivers()
    } catch (error) {
      console.error('Error updating driver:', error)
      toast.error('Failed to update driver status.')
    }
  }

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone_number.includes(searchTerm) ||
    driver.emergency_contact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading drivers...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
            <p className="text-gray-600">Manage your drivers and their information</p>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer" onClick={() => {
                setEditingDriver(null)
                setFormData({
                  full_name: '', age: '', phone_number: '', license_number: '', license_expiry: '', address: '', emergency_contact: '', emergency_phone: '', image_url: ''
                })
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Driver
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                </DialogTitle>
              <DialogDescription>
                {editingDriver ? 'Update driver details and photo' : 'Enter driver details and optional photo'}
              </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      placeholder="Enter age"
                      min="18"
                      max="70"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone_number">Phone Number *</Label>
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="license_number">License Number *</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="license_expiry">License Expiry Date *</Label>
                  <Input
                    id="license_expiry"
                    type="date"
                    value={formData.license_expiry}
                    onChange={(e) => setFormData({...formData, license_expiry: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Enter full address"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact">Emergency Contact Name *</Label>
                    <Input
                      id="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                      placeholder="Enter emergency contact name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_phone">Emergency Contact Phone *</Label>
                    <Input
                      id="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={(e) => setFormData({...formData, emergency_phone: e.target.value})}
                      placeholder="Enter emergency contact phone"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Driver Photo</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        // Preview the image
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setFormData({...formData, image_url: e.target?.result as string})
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img 
                        src={formData.image_url} 
                        alt="Driver preview" 
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="cursor-pointer">
                    Cancel
                  </Button>
                  <Button type="submit" className="cursor-pointer">
                    {editingDriver ? 'Update Driver' : 'Add Driver'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search drivers by name, license number, phone, or emergency contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Drivers List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {driver.image_url ? (
                      <img 
                        src={driver.image_url} 
                        alt={driver.full_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{driver.full_name}</CardTitle>
                      <Badge variant={driver.is_active ? "default" : "secondary"}>
                        {driver.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(driver)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(driver.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <IdCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">License: {driver.license_number}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{driver.phone_number}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Age:</strong> {driver.age} years</p>
                    <p><strong>License Expiry:</strong> {new Date(driver.license_expiry).toLocaleDateString()}</p>
                    <p><strong>Emergency Contact:</strong> {driver.emergency_contact}</p>
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(driver)}
                      className="w-full"
                    >
                      {driver.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No drivers match your search criteria.' : 'Get started by adding your first driver.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} className="cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add First Driver
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
