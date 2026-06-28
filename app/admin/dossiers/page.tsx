"use client"

import React from 'react'
import AdminStats from '@/components/admin/AdminStats'
import AdminDossierList from '@/components/admin/AdminDossierList'

export default function AdminDossiersPage() {
  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen">
      <h1 className="text-2xl font-semibold text-[#173B8C] mb-4">Permis Express — Admin</h1>
      <AdminStats />
      <div className="mt-6">
        <AdminDossierList />
      </div>
    </div>
  )
}
