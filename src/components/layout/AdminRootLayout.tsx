'use client'

import { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

interface AdminRootLayoutProps {
  children: ReactNode
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/40">
      {children}
      <Toaster />
    </div>
  )
}
