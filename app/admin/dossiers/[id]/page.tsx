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
        {/* Old global back link removed — header now handled by AdminDossierDetail */}

        <AdminDossierDetail id={id ?? ''} />
      </div>
    </div>
  )
}
