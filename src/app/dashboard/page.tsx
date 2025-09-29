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
  Home,
  Bus, 
  MapPin, 
  Calendar, 
  FileText,
  Settings, 
  LogOut,
  Search,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const bookingHistory = [
  { month: 'Jan', bookings: 2 },
  { month: 'Feb', bookings: 1 },
  { month: 'Mar', bookings: 3 },
  { month: 'Apr', bookings: 2 },
  { month: 'May', bookings: 4 },
  { month: 'Jun', bookings: 1 },
]

const recentBookings = [
  { id: 'BK001', route: 'Lagos - Abuja', date: '2024-01-15', status: 'Confirmed', amount: '₦15,000', seat: 'A12' },
  { id: 'BK002', route: 'Kano - Lagos', date: '2024-01-10', status: 'Completed', amount: '₦12,000', seat: 'B05' },
  { id: 'BK003', route: 'Port Harcourt - Abuja', date: '2024-01-05', status: 'Cancelled', amount: '₦18,000', seat: 'C08' },
]

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, profile, signOut } = useAuth()
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedTrips: 0,
    upcomingTrips: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch user's bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      const totalBookings = bookings?.length || 0
      const completedTrips = bookings?.filter(b => b.status === 'completed').length || 0
      const upcomingTrips = bookings?.filter(b => b.status === 'confirmed').length || 0
      const totalSpent = bookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0

      setStats({
        totalBookings,
        completedTrips,
        upcomingTrips,
        totalSpent
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
                      <a href="/dashboard">
                        <Home className="h-4 w-4" />
                        <span>Overview</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/book">
                        <Search className="h-4 w-4" />
                        <span>Book Trip</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/bookings">
                        <FileText className="h-4 w-4" />
                        <span>My Bookings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/profile">
                        <Settings className="h-4 w-4" />
                        <span>Profile</span>
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
              <h1 className="text-2xl font-semibold">My Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || 'User'}
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
                    <FileText className="h-4 w-4 text-muted-foreground" />
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
                    <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completedTrips}</div>
                    <p className="text-xs text-muted-foreground">
                      Successful journeys
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.upcomingTrips}</div>
                    <p className="text-xs text-muted-foreground">
                      Confirmed bookings
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₦{stats.totalSpent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      All time spending
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>
                      Your booking activity over the past 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="bookings" fill="#f97316" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your latest booking requests and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{booking.id}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{booking.route}</p>
                          <p className="text-sm text-muted-foreground">Seat: {booking.seat}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{booking.amount}</p>
                          <p className="text-sm text-muted-foreground">{booking.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => router.push('/bookings')}>
                      View All Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Button 
                      className="h-20 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.push('/book')}
                    >
                      <Search className="h-6 w-6" />
                      <span>Book a Trip</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2"
                      onClick={() => router.push('/bookings')}
                    >
                      <FileText className="h-6 w-6" />
                      <span>My Bookings</span>
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
