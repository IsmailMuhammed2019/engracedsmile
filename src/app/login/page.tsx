'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bus, Shield, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<'customer' | 'admin' | null>(null)

  const handleCustomerLogin = () => {
    router.push('/auth/login')
  }

  const handleAdminLogin = () => {
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <Bus className="h-9 w-9 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">EngracedSmile Transport</h1>
              <p className="text-lg text-gray-600">Interstate Travel Across Nigeria</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose Your Login Type</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the appropriate login option based on your role to access the right portal
          </p>
        </div>

        {/* Login Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Customer Login */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Customer Portal</CardTitle>
              <p className="text-gray-600">Access your bookings and manage your travel</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Search and book trips</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Manage your bookings</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Update your profile</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Track your trips</span>
                </div>
              </div>
              
              <Button 
                onClick={handleCustomerLogin}
                className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium"
              >
                <span>Customer Login</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Admin Portal</CardTitle>
              <p className="text-gray-600">Manage routes, vehicles, and bookings</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Manage routes and vehicles</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Create and schedule trips</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>View booking analytics</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Manage promotional offers</span>
                </div>
              </div>
              
              <Button 
                onClick={handleAdminLogin}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <span>Admin Login</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@engracedsmile.com" className="text-primary hover:underline">
              support@engracedsmile.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
