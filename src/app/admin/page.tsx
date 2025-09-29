'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Bus, MapPin, Calendar, DollarSign, Tag, TrendingUp, UserCheck, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/components/layout/AdminLayout'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface DashboardStats {
  totalBookings: number
  totalRevenue: number
  activeTrips: number
  totalRoutes: number
  totalDrivers: number
  totalVehicles: number
  monthlyRevenue: number
  dailyRevenue: number
  recentBookings: Array<{
    id: string
    passenger_name: string
    total_amount: number
    status: string
    created_at: string
    trip?: {
      route?: {
        from_city: string
        to_city: string
      }
    }
  }>
  revenueData: Array<{
    date: string
    revenue: number
    bookings: number
  }>
  routeData: Array<{
    route: string
    bookings: number
    revenue: number
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, requireAdmin } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeTrips: 0,
    totalRoutes: 0,
    totalDrivers: 0,
    totalVehicles: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0,
    recentBookings: [],
    revenueData: [],
    routeData: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not admin
    if (!user || !profile?.is_admin) {
      requireAdmin()
      return
    }
    
    fetchDashboardData()
  }, [user, profile, requireAdmin])

  const fetchDashboardData = async () => {
    try {
      // Fetch all bookings with detailed info
      const { data: allBookings } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips(
            id, departure_time, arrival_time, price,
            route:routes(from_city, to_city)
          ),
          user_profile:user_profiles(full_name)
        `)
        .order('created_at', { ascending: false })

      // Fetch counts
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

      const { count: activeTrips } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const { count: totalRoutes } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const { count: totalDrivers } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Calculate revenue
      const totalRevenue = allBookings?.reduce((sum, booking) => sum + booking.total_price, 0) || 0

      // Calculate monthly and daily revenue
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const monthlyRevenue = allBookings
        ?.filter(booking => new Date(booking.created_at) >= startOfMonth)
        .reduce((sum, booking) => sum + booking.total_price, 0) || 0

      const dailyRevenue = allBookings
        ?.filter(booking => new Date(booking.created_at) >= startOfDay)
        .reduce((sum, booking) => sum + booking.total_price, 0) || 0

      // Generate revenue chart data (last 30 days)
      const revenueData = []
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayBookings = allBookings?.filter(booking => 
          booking.created_at.startsWith(dateStr)
        ) || []
        
        revenueData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: dayBookings.reduce((sum, booking) => sum + booking.total_price, 0),
          bookings: dayBookings.length
        })
      }

      // Generate route analytics
      const routeMap = new Map()
      allBookings?.forEach(booking => {
        if (booking.trip?.route) {
          const routeKey = `${booking.trip.route.from_city} - ${booking.trip.route.to_city}`
          if (routeMap.has(routeKey)) {
            const existing = routeMap.get(routeKey)
            existing.bookings += 1
            existing.revenue += booking.total_price
          } else {
            routeMap.set(routeKey, {
              route: routeKey,
              bookings: 1,
              revenue: booking.total_price
            })
          }
        }
      })

      const routeData = Array.from(routeMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

      setStats({
        totalBookings: totalBookings || 0,
        totalRevenue,
        activeTrips: activeTrips || 0,
        totalRoutes: totalRoutes || 0,
        totalDrivers: totalDrivers || 0,
        totalVehicles: totalVehicles || 0,
        monthlyRevenue,
        dailyRevenue,
        recentBookings: allBookings?.slice(0, 10).map(booking => ({
          id: booking.id,
          passenger_name: booking.user_profile?.full_name || 'Unknown',
          total_amount: booking.total_price,
          status: booking.status,
          created_at: booking.created_at,
          trip: booking.trip
        })) || [],
        revenueData,
        routeData
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Overview of your transportation business</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push('/admin/payments')} variant="outline">
                <CreditCard className="h-4 w-4 mr-2" />
                View Payments
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  From all bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.dailyRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeTrips}</div>
                <p className="text-xs text-muted-foreground">
                  Currently scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRoutes}</div>
                <p className="text-xs text-muted-foreground">
                  Available routes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDrivers}</div>
                <p className="text-xs text-muted-foreground">
                  Available drivers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fleet Size</CardTitle>
                <Bus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVehicles}</div>
                <p className="text-xs text-muted-foreground">
                  Total vehicles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stats.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Routes by Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.routeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="route" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent bookings</p>
                ) : (
                  stats.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{booking.passenger_name}</p>
                        <p className="text-sm text-gray-600">
                          {booking.trip?.route?.from_city} → {booking.trip?.route?.to_city}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(booking.total_amount)}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {booking.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="h-auto p-4 flex flex-col items-center space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/admin/routes')}
                >
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm">Routes</span>
                </Button>
                <Button 
                  className="h-auto p-4 flex flex-col items-center space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/admin/vehicles')}
                >
                  <Bus className="h-5 w-5" />
                  <span className="text-sm">Vehicles</span>
                </Button>
                <Button 
                  className="h-auto p-4 flex flex-col items-center space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/admin/trips')}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="text-sm">Trips</span>
                </Button>
                <Button 
                  className="h-auto p-4 flex flex-col items-center space-y-2" 
                  variant="outline"
                  onClick={() => router.push('/admin/trip-categories')}
                >
                  <Tag className="h-5 w-5" />
                  <span className="text-sm">Promos</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

