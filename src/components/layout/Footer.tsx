import { Bus, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bus className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold font-poppins">EngracedSmile Transport</span>
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted partner for interstate transportation across Nigeria. 
              Safe, comfortable, and reliable travel solutions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+234 800 123 4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">info@engracedsmile.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-gray-300 hover:text-white transition-colors">
                  Book Trip
                </Link>
              </li>
              <li>
                <Link href="/bookings" className="text-gray-300 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Routes */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-poppins">Popular Routes</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/book?from=Lagos&to=Abuja" className="text-gray-300 hover:text-white transition-colors">
                  Lagos → Abuja
                </Link>
              </li>
              <li>
                <Link href="/book?from=Lagos&to=Kano" className="text-gray-300 hover:text-white transition-colors">
                  Lagos → Kano
                </Link>
              </li>
              <li>
                <Link href="/book?from=Abuja&to=Kano" className="text-gray-300 hover:text-white transition-colors">
                  Abuja → Kano
                </Link>
              </li>
              <li>
                <Link href="/book?from=Lagos&to=Port Harcourt" className="text-gray-300 hover:text-white transition-colors">
                  Lagos → Port Harcourt
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2024 EngracedSmile Transport. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
