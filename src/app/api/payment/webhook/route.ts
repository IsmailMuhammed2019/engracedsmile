import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)

    // Handle different Paystack events
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data)
        break
      case 'charge.failed':
        await handleFailedPayment(event.data)
        break
      case 'transfer.success':
        await handleTransferSuccess(event.data)
        break
      case 'transfer.failed':
        await handleTransferFailed(event.data)
        break
      default:
        console.log('Unhandled Paystack event:', event.event)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSuccessfulPayment(data: any) {
  try {
    const { reference, amount, customer } = data

    // Find booking by payment reference
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_reference', reference)
      .single()

    if (findError || !booking) {
      console.error('Booking not found for reference:', reference)
      return
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (updateError) {
      console.error('Failed to update booking:', updateError)
      return
    }

    // Update trip available seats
    await supabase.rpc('decrement_available_seats', {
      trip_id: booking.trip_id
    })

    console.log('Payment successful for booking:', booking.id)

  } catch (error) {
    console.error('Error handling successful payment:', error)
  }
}

async function handleFailedPayment(data: any) {
  try {
    const { reference } = data

    // Find booking by payment reference
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_reference', reference)
      .single()

    if (findError || !booking) {
      console.error('Booking not found for reference:', reference)
      return
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'failed',
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id)

    if (updateError) {
      console.error('Failed to update booking:', updateError)
      return
    }

    console.log('Payment failed for booking:', booking.id)

  } catch (error) {
    console.error('Error handling failed payment:', error)
  }
}

async function handleTransferSuccess(data: any) {
  console.log('Transfer successful:', data)
  // Handle successful transfers to drivers/partners
}

async function handleTransferFailed(data: any) {
  console.log('Transfer failed:', data)
  // Handle failed transfers
}
