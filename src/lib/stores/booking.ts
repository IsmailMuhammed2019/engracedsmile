import { create } from 'zustand'

interface BookingState {
  searchParams: {
    from: string
    to: string
    date: string
    passengers: number
  }
  selectedTrip: {
    id: string
    price: number
    route: {
      from_city: string
      to_city: string
    }
    vehicle: {
      make: string
      model: string
      capacity: number
    }
    driver: {
      full_name: string
      rating: number
    }
    departure_time: string
    arrival_time: string
    available_seats: number
  } | null
  bookingData: {
    passengerName: string
    passengerPhone: string
    passengerEmail: string
    seatNumber: number
  }
  setSearchParams: (params: Partial<BookingState['searchParams']>) => void
  setSelectedTrip: (trip: BookingState['selectedTrip']) => void
  setBookingData: (data: Partial<BookingState['bookingData']>) => void
  resetBooking: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  searchParams: {
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    passengers: 1
  },
  selectedTrip: null,
  bookingData: {
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    seatNumber: 0
  },
  setSearchParams: (params) => 
    set((state) => ({ 
      searchParams: { ...state.searchParams, ...params } 
    })),
  setSelectedTrip: (trip) => set({ selectedTrip: trip }),
  setBookingData: (data) => 
    set((state) => ({ 
      bookingData: { ...state.bookingData, ...data } 
    })),
  resetBooking: () => set({
    selectedTrip: null,
    bookingData: {
      passengerName: '',
      passengerPhone: '',
      passengerEmail: '',
      seatNumber: 0
    }
  })
}))
