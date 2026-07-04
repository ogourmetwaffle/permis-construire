"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import AdminLoginCard from '@/components/admin/AdminLoginCard'
import AdminLoginIllustration from '@/components/admin/AdminLoginIllustration'

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
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="hidden md:flex md:w-1/2 items-center justify-center"
        style={{ background: 'linear-gradient(135deg, var(--eh-primary) 0%, rgba(30,58,95,0.9) 60%)' }}
      >
        <div className="w-full h-full flex items-center justify-center p-12">
          <div className="text-white max-w-lg">
            <AdminLoginIllustration />
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center p-6 bg-[var(--eh-light)]">
        <div className="w-full max-w-lg">
          <AdminLoginCard
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
          />
        </div>
      </main>
    </div>
  )
}
