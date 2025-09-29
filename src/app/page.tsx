'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useBookingStore } from '@/lib/stores/booking'
import CustomerLayout from '@/components/layout/CustomerLayout'

const nigerianCities = [
  'Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan', 'Kaduna', 
  'Enugu', 'Benin City', 'Jos', 'Ilorin', 'Abeokuta', 'Owerri'
]

export default function HomePage() {
  const router = useRouter()
  const { searchParams, setSearchParams } = useBookingStore()
  const [fromCity, setFromCity] = useState(searchParams.from)
  const [toCity, setToCity] = useState(searchParams.to)
  const [date, setDate] = useState(searchParams.date)
  const [passengers, setPassengers] = useState(searchParams.passengers)

  const handleSearch = () => {
    setSearchParams({
      from: fromCity,
      to: toCity,
      date,
      passengers
    })
    router.push('/book')
  }

  const popularRoutes = [
    { from: 'Lagos', to: 'Abuja', price: '₦15,000' },
    { from: 'Lagos', to: 'Kano', price: '₦25,000' },
    { from: 'Abuja', to: 'Kano', price: '₦12,000' },
    { from: 'Lagos', to: 'Port Harcourt', price: '₦18,000' },
  ]

  const features = [
    {
      icon: '🚌',
      title: 'Comfortable Buses',
      description: 'Modern, air-conditioned buses with comfortable seating'
    },
    {
      icon: '🛡️',
      title: 'Safe Travel',
      description: 'Experienced drivers and well-maintained vehicles'
    },
    {
      icon: '📱',
      title: 'Easy Booking',
      description: 'Book your trip in minutes with our user-friendly platform'
    },
    {
      icon: '💰',
      title: 'Affordable Prices',
      description: 'Competitive rates for all routes across Nigeria'
    }
  ]

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Travel Across Nigeria
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Safe, comfortable, and reliable interstate transportation
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={fromCity}
                    onChange={(e) => setFromCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">From</option>
                    {nigerianCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={toCity}
                    onChange={(e) => setToCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">To</option>
                    {nigerianCities.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>{num} Passenger{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <Button 
                  onClick={handleSearch}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700"
                  disabled={!fromCity || !toCity}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Routes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRoutes.map((route, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      {route.from} → {route.to}
                    </h3>
                    <p className="text-2xl font-bold text-blue-600 mb-2">
                      {route.price}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setSearchParams({
                          from: route.from,
                          to: route.to,
                          date: new Date().toISOString().split('T')[0],
                          passengers: 1
                        })
                        router.push('/book')
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Travel?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Book your next trip with us and experience comfortable travel across Nigeria
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => router.push('/book')}
          >
            Start Booking
          </Button>
    </div>
      </section>
    </CustomerLayout>
  )
}