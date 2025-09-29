'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Edit, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import CustomerLayout from '@/components/layout/CustomerLayout'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile, requireAuth } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: ''
  })

  useEffect(() => {
    if (!user) {
      requireAuth()
      return
    }
    
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        email: user.email || ''
      })
    }
  }, [user, profile, requireAuth])

  const handleSave = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        email: user?.email || ''
      })
    }
    setIsEditing(false)
  }

  if (!user) {
    return (
      <CustomerLayout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    {isEditing ? (
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={loading}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.full_name || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                        disabled={loading}
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{profile?.phone_number || 'Not provided'}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{user?.email || 'Not available'}</span>
                    <span className="text-xs text-gray-500">(Cannot be changed)</span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} disabled={loading}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Account Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <h3 className="font-semibold">{profile?.full_name || 'Customer'}</h3>
                  <p className="text-sm text-gray-500">{user?.email || 'Not available'}</p>
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Member since:</span>
                    <span>{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account type:</span>
                    <span className="text-primary font-medium">Customer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
