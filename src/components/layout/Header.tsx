'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut, Settings, Bus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/hooks/useAuth'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Book Trip', href: '/book' },
    { name: 'My Bookings', href: '/bookings' },
  ]

  const adminNavigation = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Routes', href: '/admin/routes' },
    { name: 'Vehicles', href: '/admin/vehicles' },
    { name: 'Bookings', href: '/admin/bookings' },
  ]

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <div className="relative h-8 w-24 md:h-10 md:w-32 flex-shrink-0">
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
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
              >
                {item.name}
              </Link>
            ))}
            {profile?.is_admin && (
              <>
                <div className="border-l border-gray-300 h-6"></div>
                {adminNavigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={profile?.full_name} />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/bookings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => router.push('/auth/login')}
                  className="hover:bg-primary/10 hover:text-primary transition-all duration-200"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => router.push('/auth/register')}
                  className="bg-primary hover:bg-primary/90 text-white transition-all duration-200 hover:shadow-md"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden hover:bg-primary/10 hover:text-primary transition-all duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {profile?.is_admin && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  {adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="text-gray-700 hover:text-primary hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
