"use client"

import React from 'react'

const StatCard = ({ title, value, className }: { title: string; value: string | number; className?: string }) => (
  <div className={`rounded-md p-4 w-full md:w-40 ${className}`}>
    <div className="text-xs text-gray-500">{title}</div>
    <div className="text-xl font-bold mt-1">{value}</div>
  </div>
)

export default function AdminStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      <StatCard title="Total dossiers" value={124} className="bg-white border" />
      <StatCard title="Nouveaux" value={15} className="bg-white border text-yellow-700" />
      <StatCard title="En cours" value={34} className="bg-white border text-blue-700" />
      <StatCard title="Terminés" value={72} className="bg-white border text-green-600" />
      <StatCard title="Refusés" value={3} className="bg-white border text-red-600" />
    </div>
  )
}
