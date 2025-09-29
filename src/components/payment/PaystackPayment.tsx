'use client'

import { useState } from 'react'
import { usePaystackPayment } from 'react-paystack'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface PaystackPaymentProps {
  amount: number
  email: string
  onSuccess: (reference: string) => void
  onClose: () => void
  bookingReference: string
}

export default function PaystackPayment({ 
  amount, 
  email, 
  onSuccess, 
  onClose, 
  bookingReference 
}: PaystackPaymentProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const config = {
    reference: bookingReference,
    email: email,
    amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    currency: 'NGN',
    metadata: {
      booking_reference: bookingReference,
      custom_fields: [
        {
          display_name: "Booking Reference",
          variable_name: "booking_reference",
          value: bookingReference
        }
      ]
    }
  }

  const initializePayment = usePaystackPayment(config)

  const onSuccessCallback = (reference: { reference: string }) => {
    setIsProcessing(false)
    toast.success('Payment successful!')
    onSuccess(reference.reference)
  }

  const onCloseCallback = () => {
    setIsProcessing(false)
    toast.error('Payment cancelled')
    onClose()
  }

  const handlePayment = () => {
    setIsProcessing(true)
    initializePayment(onSuccessCallback, onCloseCallback)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5 text-blue-600" />
          <span>Complete Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Booking Reference:</span>
            <span className="font-medium">{bookingReference}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="text-lg font-bold text-blue-600">
              ₦{amount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payment Method Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Secured by Paystack</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>SSL Encrypted</span>
          </div>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? 'Processing Payment...' : `Pay ₦${amount.toLocaleString()}`}
        </Button>

        {/* Payment Methods */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">Payment Methods:</p>
          <div className="flex justify-center space-x-4 text-xs text-gray-500">
            <span>💳 Card</span>
            <span>🏦 Bank Transfer</span>
            <span>📱 USSD</span>
            <span>💰 Wallet</span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Secure Payment:</strong> Your payment information is encrypted and 
            processed securely by Paystack. We do not store your card details.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
