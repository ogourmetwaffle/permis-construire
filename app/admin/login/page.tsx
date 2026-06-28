"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signError } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (signError) {
      setError(signError.message)
      return
    }

    router.push('/admin')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Admin — Connexion</h2>

        {error && <div className="text-red-600 mb-3">{error}</div>}

        <input className="w-full border p-2 mb-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border p-2 mb-3" placeholder="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="flex items-center justify-between">
          <button disabled={loading} className="bg-blue-900 text-white px-4 py-2 rounded">{loading ? 'Connexion...' : 'Se connecter'}</button>
        </div>
      </form>
    </div>
  )
}
