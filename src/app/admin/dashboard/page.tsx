'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider, 
  SidebarTrigger 
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Bus, 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Settings, 
  LogOut,
  Home,
  FileText,
  DollarSign,
  UserCheck
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const data = [
  { name: 'Jan', bookings: 65, revenue: 12000 },
  { name: 'Feb', bookings: 59, revenue: 15000 },
  { name: 'Mar', bookings: 80, revenue: 18000 },
  { name: 'Apr', bookings: 81, revenue: 20000 },
  { name: 'May', bookings: 56, revenue: 16000 },
  { name: 'Jun', bookings: 55, revenue: 14000 },
  { name: 'Jul', bookings: 40, revenue: 12000 },
]

const pieData = [
  { name: 'Completed', value: 400, color: '#10b981' },
  { name: 'Pending', value: 300, color: '#f59e0b' },
  { name: 'Cancelled', value: 200, color: '#ef4444' },
]

const recentBookings = [
  { id: 'BK001', customer: 'John Doe', route: 'Lagos - Abuja', date: '2024-01-15', status: 'Confirmed', amount: '₦15,000' },
  { id: 'BK002', customer: 'Jane Smith', route: 'Kano - Lagos', date: '2024-01-14', status: 'Pending', amount: '₦12,000' },
  { id: 'BK003', customer: 'Mike Johnson', route: 'Port Harcourt - Abuja', date: '2024-01-13', status: 'Confirmed', amount: '₦18,000' },
  { id: 'BK004', customer: 'Sarah Wilson', route: 'Lagos - Kano', date: '2024-01-12', status: 'Cancelled', amount: '₦14,000' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeRoutes: 0,
    totalVehicles: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (profile && !profile.is_admin) {
      router.push('/')
      return
    }

    fetchDashboardData()
  }, [user, profile, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch bookings count
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })

      // Fetch total revenue
      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('status', 'confirmed')

      const totalRevenue = revenueData?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

      // Fetch routes count
      const { count: routesCount } = await supabase
        .from('routes')
        .select('*', { count: 'exact', head: true })

      // Fetch vehicles count
      const { count: vehiclesCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalBookings: bookingsCount || 0,
        totalRevenue,
        activeRoutes: routesCount || 0,
        totalVehicles: vehiclesCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Bus className="h-6 w-6 text-orange-600" />
              <span className="font-bold text-lg">EngracedSmile</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin">
                        <Home className="h-4 w-4" />
                        <span>Overview</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/vehicles">
                        <Bus className="h-4 w-4" />
                        <span>Vehicles</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/routes">
                        <MapPin className="h-4 w-4" />
                        <span>Routes</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/bookings">
                        <FileText className="h-4 w-4" />
                        <span>Bookings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/drivers">
                        <UserCheck className="h-4 w-4" />
                        <span>Drivers</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/reports">
                        <BarChart3 className="h-4 w-4" />
                        <span>Analytics</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/admin/revenue">
                        <DollarSign className="h-4 w-4" />
                        <span>Revenue</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || 'Admin'}
              </span>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      +15.3% from last month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeRoutes}</div>
                    <p className="text-xs text-muted-foreground">
                      +2 new routes this month
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
                    <Bus className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalVehicles}</div>
                    <p className="text-xs text-muted-foreground">
                      +1 new vehicle this month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                      Monthly bookings and revenue trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="bookings" stroke="#f97316" strokeWidth={2} />
                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Booking Status</CardTitle>
                    <CardDescription>
                      Distribution of booking statuses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Bookings Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Latest booking requests and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{booking.id}</span>
                            <Badge variant={booking.status === 'Confirmed' ? 'default' : booking.status === 'Pending' ? 'secondary' : 'destructive'}>
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.customer}</p>
                          <p className="text-sm">{booking.route}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{booking.amount}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View All Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
