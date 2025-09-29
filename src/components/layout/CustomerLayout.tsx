'use client'

import { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Search, Calendar, User, LogOut, Bus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface CustomerLayoutProps {
  children: ReactNode
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const customerNavigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search Trips', href: '/book', icon: Search },
    { name: 'My Bookings', href: '/bookings', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50/40">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            {/* Logo/Brand */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image 
                    src="/logo.png" 
                    alt="EngracedSmile Transport" 
                    fill
                    className="object-contain"
                    priority
                    onError={(e) => {
                      console.log('Logo failed to load, using fallback');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">EngracedSmile</h1>
                  <p className="text-xs text-gray-500">Transport</p>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {customerNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-9 px-3",
                      isActive 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                )
              })}
            </nav>
            
            {/* User Profile */}
            {user && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {profile?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500">Customer</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {customerNavigation.find(item => item.href === pathname)?.name || 'EngracedSmile Transport'}
                  </h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  {!user && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/auth/login')}
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      <Toaster />
    </div>
  )
}
