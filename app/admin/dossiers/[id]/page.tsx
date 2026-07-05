"use client"

import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AdminDossierDetail from '@/components/admin/AdminDossierDetail'

export default function AdminDossierPage() {
  const params = useParams()
  const rawId = params?.id
  const id = Array.isArray(rawId) ? rawId[0] : (rawId ?? '')

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
            <ArrowLeft size={16} />
            <span>Retour aux dossiers</span>
          </Link>
        </div>

        <AdminDossierDetail id={id ?? ''} />
      </div>
    </div>
  )
}
