'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CreditCard, TestTube, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/layout/AdminLayout'
import PaystackPayment from '@/components/payment/PaystackPayment'

export default function TestPaymentPage() {
  const [testData, setTestData] = useState({
    amount: 5000,
    email: 'test@example.com',
    name: 'Test Customer'
  })
  const [showPayment, setShowPayment] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])

  const testCards = [
    {
      number: '4084084084084085',
      cvv: '408',
      expiry: '12/25',
      pin: '1234',
      otp: '123456',
      description: 'Successful Payment',
      status: 'success'
    },
    {
      number: '4000000000000002',
      cvv: '000',
      expiry: '12/25',
      pin: '0000',
      otp: '000000',
      description: 'Insufficient Funds',
      status: 'failed'
    },
    {
      number: '4000000000000119',
      cvv: '119',
      expiry: '12/25',
      pin: '1190',
      otp: '119000',
      description: 'Processing Error',
      status: 'failed'
    }
  ]

  const handleTestPayment = (cardData: any) => {
    setTestData(prev => ({
      ...prev,
      email: `test+${Date.now()}@example.com`
    }))
    setShowPayment(true)
    
    // Add test result
    setTestResults(prev => [...prev, {
      id: Date.now(),
      card: cardData.number,
      description: cardData.description,
      timestamp: new Date().toLocaleTimeString(),
      status: 'testing'
    }])
  }

  const handlePaymentSuccess = (reference: string) => {
    toast.success(`Payment successful! Reference: ${reference}`)
    setShowPayment(false)
    
    // Update test result
    setTestResults(prev => prev.map(result => 
      result.id === Math.max(...prev.map(r => r.id)) 
        ? { ...result, status: 'success', reference }
        : result
    ))
  }

  const handlePaymentClose = () => {
    setShowPayment(false)
    toast.info('Payment cancelled')
    
    // Update test result
    setTestResults(prev => prev.map(result => 
      result.id === Math.max(...prev.map(r => r.id)) 
        ? { ...result, status: 'cancelled' }
        : result
    ))
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Paystack Payment Testing</h1>
              <p className="text-gray-600">Test your Paystack integration with various scenarios</p>
            </div>
            <Button onClick={clearResults} variant="outline">
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5" />
                  <span>Test Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={testData.amount}
                    onChange={(e) => setTestData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Customer Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={testData.email}
                    onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Customer Name</Label>
                  <Input
                    id="name"
                    value={testData.name}
                    onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Test Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Test Cards</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testCards.map((card, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{card.description}</span>
                      <Badge variant={card.status === 'success' ? 'default' : 'destructive'}>
                        {card.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Card:</strong> {card.number}</p>
                      <p><strong>CVV:</strong> {card.cvv} | <strong>Expiry:</strong> {card.expiry}</p>
                      <p><strong>PIN:</strong> {card.pin} | <strong>OTP:</strong> {card.otp}</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleTestPayment(card)}
                    >
                      Test Payment
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No test results yet</p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {result.status === 'cancelled' && <XCircle className="h-5 w-5 text-red-600" />}
                        {result.status === 'testing' && <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                        <div>
                          <p className="font-medium">{result.description}</p>
                          <p className="text-sm text-gray-600">Card: {result.card}</p>
                          <p className="text-sm text-gray-500">{result.timestamp}</p>
                          {result.reference && (
                            <p className="text-sm text-blue-600">Ref: {result.reference}</p>
                          )}
                        </div>
                      </div>
                      <Badge variant={
                        result.status === 'success' ? 'default' : 
                        result.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {result.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Check</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Paystack Public Key:</span>
                  <Badge variant={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? 'default' : 'destructive'}>
                    {process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Paystack Secret Key:</span>
                  <Badge variant={process.env.PAYSTACK_SECRET_KEY ? 'default' : 'destructive'}>
                    {process.env.PAYSTACK_SECRET_KEY ? 'Configured' : 'Missing'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mt-4">
                  <p><strong>Note:</strong> Make sure your environment variables are set in your .env.local file</p>
                  <p>Check the PAYSTACK_SETUP.md file for detailed setup instructions.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md">
              <PaystackPayment
                amount={testData.amount}
                email={testData.email}
                bookingReference={`TEST-${Date.now()}`}
                onSuccess={handlePaymentSuccess}
                onClose={handlePaymentClose}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
