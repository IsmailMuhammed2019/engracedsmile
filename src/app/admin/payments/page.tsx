'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CreditCard, Download, Search, TrendingUp, DollarSign, Users, Receipt, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import AdminLayout from '@/components/layout/AdminLayout'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  reference: string
  customer: {
    email: string
    name: string
  }
  created_at: string
  paid_at?: string
  gateway_response: string
  channel: string
  fees: number
  metadata?: Record<string, unknown>
}

interface PaymentStats {
  totalPayments: number
  totalAmount: number
  successfulPayments: number
  failedPayments: number
  pendingPayments: number
  averageAmount: number
  monthlyRevenue: number
  dailyRevenue: number
}

interface ChartData {
  date: string
  amount: number
  count: number
}

interface StatusData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

export default function PaymentsPage() {
  const { requireAdmin } = useAuth()
  const requireAdminRef = useRef(requireAdmin)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [stats, setStats] = useState<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    averageAmount: 0,
    monthlyRevenue: 0,
    dailyRevenue: 0
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [statusData, setStatusData] = useState<StatusData[]>([])

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch payments from Supabase (bookings with payment info)
      // First get bookings without joins to avoid foreign key issues
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      // Transform bookings data to payment format with real Paystack data
      const paymentsData = bookingsData?.map(booking => {
        const isPaid = booking.payment_status === 'paid'
        const paymentReference = booking.payment_reference || `REF-${booking.id.slice(-8)}`
        
        return {
          id: booking.id,
          amount: booking.total_price || booking.total_amount || 0,
          currency: 'NGN',
          status: booking.payment_status || 'pending',
          reference: paymentReference,
          customer: {
            email: booking.passenger_email || 'customer@example.com',
            name: booking.passenger_name || `Customer ${booking.id.slice(-4)}`
          },
          created_at: booking.created_at,
          paid_at: isPaid ? booking.updated_at : null,
          gateway_response: isPaid ? 'success' : 'pending',
          channel: 'paystack',
          fees: (booking.total_price || booking.total_amount || 0) * 0.015, // 1.5% Paystack fee
          metadata: {
            trip_id: booking.trip_id,
            passengers: booking.num_passengers || 1,
            route: 'Trip Route', // Simplified since we're not joining tables
            booking_reference: booking.booking_reference,
            seat_number: booking.seat_number
          }
        }
      }) || []

      setPayments(paymentsData)
      setFilteredPayments(paymentsData)
      
      // Calculate statistics
      calculateStats(paymentsData)
      
      // Generate chart data
      generateChartData(paymentsData)
      
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update ref when requireAdmin changes
  useEffect(() => {
    requireAdminRef.current = requireAdmin
  }, [requireAdmin])

  useEffect(() => {
    requireAdminRef.current()
    fetchPayments()
  }, [fetchPayments])

  const calculateStats = (paymentsData: Payment[]) => {
    const totalPayments = paymentsData.length
    const totalAmount = paymentsData.reduce((sum, payment) => sum + payment.amount, 0)
    const successfulPayments = paymentsData.filter(p => p.status === 'paid').length
    const failedPayments = paymentsData.filter(p => p.status === 'failed').length
    const pendingPayments = paymentsData.filter(p => p.status === 'pending').length
    const averageAmount = totalPayments > 0 ? totalAmount / totalPayments : 0

    // Calculate monthly and daily revenue
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const monthlyRevenue = paymentsData
      .filter(p => new Date(p.created_at) >= startOfMonth)
      .reduce((sum, p) => sum + p.amount, 0)

    const dailyRevenue = paymentsData
      .filter(p => new Date(p.created_at) >= startOfDay)
      .reduce((sum, p) => sum + p.amount, 0)

    setStats({
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      pendingPayments,
      averageAmount,
      monthlyRevenue,
      dailyRevenue
    })

    // Generate status data for pie chart
    setStatusData([
      { name: 'Successful', value: successfulPayments, color: '#10b981' },
      { name: 'Failed', value: failedPayments, color: '#ef4444' },
      { name: 'Pending', value: pendingPayments, color: '#f59e0b' }
    ])
  }

  const generateChartData = (paymentsData: Payment[]) => {
    // Generate last 30 days data
    const chartData: ChartData[] = []
    const now = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayPayments = paymentsData.filter(p => 
        p.created_at.startsWith(dateStr)
      )
      
      chartData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        count: dayPayments.length
      })
    }
    
    setChartData(chartData)
  }

  // Filter payments
  useEffect(() => {
    let filtered = payments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(payment => new Date(payment.created_at) >= startDate)
    }

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter, dateFilter])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportPayments = () => {
    const csvContent = [
      ['Reference', 'Customer', 'Email', 'Amount', 'Status', 'Date', 'Route'].join(','),
      ...filteredPayments.map(payment => [
        payment.reference,
        payment.customer.name,
        payment.customer.email,
        payment.amount,
        payment.status,
        new Date(payment.created_at).toLocaleDateString(),
        payment.metadata?.route || 'N/A'
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600">Manage and analyze payment transactions</p>
            </div>
            <Button onClick={exportPayments} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPayments} transactions
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
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalPayments > 0 ? Math.round((stats.successfulPayments / stats.totalPayments) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.successfulPayments} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.averageAmount)}</div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
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
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.customer.name}</p>
                        <p className="text-sm text-gray-600">{payment.customer.email}</p>
                        <p className="text-xs text-gray-500">Ref: {payment.reference}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPayments.length === 0 && (
                <div className="text-center py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                        <Receipt className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                          ? 'No payments match your filters'
                          : 'No payment transactions yet'}
                      </h3>
                      <p className="text-gray-600 max-w-md">
                        {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                          ? 'Try adjusting your search criteria or filters to find payment records.'
                          : 'Payment transactions will appear here once customers start making bookings and payments through your platform.'}
                      </p>
                    </div>

                    {!(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                        <div className="flex items-start space-x-3">
                          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-blue-900">Getting Started</p>
                            <p className="text-sm text-blue-700 mt-1">
                              To see payment transactions, customers need to book trips and complete payments. 
                              Check your trips and bookings to ensure everything is set up correctly.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-3">
                      {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' ? (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm('')
                            setStatusFilter('all')
                            setDateFilter('all')
                          }}
                        >
                          Clear Filters
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => window.open('/admin/trips', '_blank')}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Check Trips
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => window.open('/admin/bookings', '_blank')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        View Bookings
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
