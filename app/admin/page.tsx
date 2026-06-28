"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AdminPanel from '@/components/admin/AdminPanel'

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push('/admin/login')
        return
      }
      setChecking(false)
    }
    check()
  }, [router])

  if (checking) return <div className="min-h-screen flex items-center justify-center">Vérification...</div>

  return (
    <div className="min-h-screen">
      <AdminPanel />
    </div>
  )
}
