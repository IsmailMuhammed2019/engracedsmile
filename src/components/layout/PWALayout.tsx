'use client'

import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import { Toaster } from '@/components/ui/sonner'

interface PWALayoutProps {
  children: ReactNode
}

export default function PWALayout({ children }: PWALayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
