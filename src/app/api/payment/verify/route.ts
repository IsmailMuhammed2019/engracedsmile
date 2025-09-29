import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { reference, bookingId } = await request.json()

    if (!reference || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Update booking status in database
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'paid',
        payment_reference: reference,
        status: 'confirmed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      )
    }

    // Update trip available seats
    const { data: booking } = await supabase
      .from('bookings')
      .select('trip_id')
      .eq('id', bookingId)
      .single()

    if (booking) {
      await supabase.rpc('decrement_available_seats', {
        trip_id: booking.trip_id
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      reference: reference
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
