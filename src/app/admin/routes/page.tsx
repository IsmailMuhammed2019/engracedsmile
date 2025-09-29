'use client'

import { useState, useEffect } from 'react'
import { Plus, MapPin, Edit, Trash2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import AdminLayout from '@/components/layout/AdminLayout'

interface Route {
  id: string
  from_city: string
  to_city: string
  distance_km: number
  estimated_duration_hours: number
  is_active: boolean
  created_at: string
}

export default function RoutesPage() {
  const { requireAdmin } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [formData, setFormData] = useState({
    from_city: '',
    to_city: '',
    distance_km: '',
    estimated_duration_hours: ''
  })

  useEffect(() => {
    requireAdmin()
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRoutes(data || [])
    } catch (error) {
      console.error('Error fetching routes:', error)
      toast.error('Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const routeData = {
        from_city: formData.from_city,
        to_city: formData.to_city,
        distance_km: parseFloat(formData.distance_km),
        estimated_duration_hours: parseFloat(formData.estimated_duration_hours)
      }

      if (editingRoute) {
        const { error } = await supabase
          .from('routes')
          .update(routeData)
          .eq('id', editingRoute.id)

        if (error) throw error
        toast.success('Route updated successfully!')
      } else {
        const { error } = await supabase
          .from('routes')
          .insert(routeData)

        if (error) throw error
        toast.success('Route created successfully!')
      }

      setShowForm(false)
      setEditingRoute(null)
      setFormData({ from_city: '', to_city: '', distance_km: '', estimated_duration_hours: '' })
      fetchRoutes()
    } catch (error) {
      console.error('Error saving route:', error)
      toast.error('Failed to save route')
    }
  }

  const handleEdit = (route: Route) => {
    setEditingRoute(route)
    setFormData({
      from_city: route.from_city,
      to_city: route.to_city,
      distance_km: route.distance_km.toString(),
      estimated_duration_hours: route.estimated_duration_hours.toString()
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return

    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Route deleted successfully!')
      fetchRoutes()
    } catch (error) {
      console.error('Error deleting route:', error)
      toast.error('Failed to delete route')
    }
  }

  const toggleRouteStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Route ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
      fetchRoutes()
    } catch (error) {
      console.error('Error updating route status:', error)
      toast.error('Failed to update route status')
    }
  }

  const filteredRoutes = routes.filter(route =>
    route.from_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.to_city.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Routes Management</h1>
            <p className="text-gray-600">Manage transportation routes</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Routes List */}
        <div className="grid gap-4">
          {filteredRoutes.map((route) => (
            <Card key={route.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {route.from_city} → {route.to_city}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{route.distance_km} km</span>
                        <span>•</span>
                        <span>{route.estimated_duration_hours} hours</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={route.is_active ? 'default' : 'secondary'}>
                      {route.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(route)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRouteStatus(route.id, route.is_active)}
                    >
                      {route.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(route.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No routes found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'No routes match your search.' : 'Get started by adding your first route.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Route
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">From City</label>
                    <Input
                      value={formData.from_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, from_city: e.target.value }))}
                      placeholder="Lagos"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To City</label>
                    <Input
                      value={formData.to_city}
                      onChange={(e) => setFormData(prev => ({ ...prev, to_city: e.target.value }))}
                      placeholder="Abuja"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Distance (km)</label>
                    <Input
                      type="number"
                      value={formData.distance_km}
                      onChange={(e) => setFormData(prev => ({ ...prev, distance_km: e.target.value }))}
                      placeholder="500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Duration (hours)</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.estimated_duration_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_hours: e.target.value }))}
                      placeholder="6"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingRoute ? 'Update Route' : 'Create Route'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingRoute(null)
                      setFormData({ from_city: '', to_city: '', distance_km: '', estimated_duration_hours: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
