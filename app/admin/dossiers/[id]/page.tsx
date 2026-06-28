"use client"

import React from 'react'
import AdminDossierDetail from '@/components/admin/AdminDossierDetail'

type Props = { params: { id: string } }

export default function AdminDossierPage({ params }: Props) {
  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      <AdminDossierDetail id={params.id} />
    </div>
  )
}
