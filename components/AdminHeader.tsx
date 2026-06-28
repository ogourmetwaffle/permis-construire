"use client"

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="font-bold">Admin • Permis Express</div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="text-sm text-gray-300">Voir le site</button>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded text-sm">Se déconnecter</button>
        </div>
      </div>
    </header>
  )
}
