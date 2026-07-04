"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Skip session check for the login page so it can render unauthenticated
    if (pathname === '/admin/login') {
      setChecking(false)
      return
    }

    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/admin/login')
        return
      }
      setChecking(false)
    }
    check()
  }, [router, pathname])

  if (checking) return <div className="min-h-screen flex items-center justify-center">Vérification...</div>

  // If we're on the login page, render children directly (no sidebar)
  if (pathname === '/admin/login') return <>{children}</>

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
