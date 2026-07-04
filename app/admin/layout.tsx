"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    <div className="min-h-screen bg-slate-100">
      <div className="flex">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-screen flex flex-col">
          <AdminHeader onToggleSidebar={() => setSidebarOpen((s) => !s)} />
          <div className="flex-1 p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
