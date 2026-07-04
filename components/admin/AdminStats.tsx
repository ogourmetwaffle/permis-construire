"use client"

import React from 'react'
import { STATUS_CONFIG } from '@/lib/status'

const StatCard = ({ title, value, icon, accentClass }: { title: string; value: string | number; icon?: React.ReactNode; accentClass?: string }) => (
  <div className={`w-full md:w-44 rounded-xl p-3 bg-white border border-slate-100 shadow-sm`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClass} bg-opacity-30`}>{icon}</div>
      <div>
        <div className="text-xs text-slate-500">{title}</div>
        <div className="text-lg font-bold text-slate-900 mt-1 leading-tight">{value}</div>
        <div className="text-xs text-slate-400 mt-0.5">dossiers</div>
      </div>
    </div>
  </div>
)

export default function AdminStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      <StatCard
        title="Total dossiers"
        value={124}
        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-500"><path d="M3 7h18M7 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        accentClass="bg-slate-100 text-slate-500"
      />

      <StatCard
        title={STATUS_CONFIG.NOUVEAU.label}
        value={15}
        icon={React.createElement(STATUS_CONFIG.NOUVEAU.icon, { width: 18, height: 18, className: 'text-blue-600' })}
        accentClass="bg-blue-50 text-blue-600"
      />

      <StatCard
        title={STATUS_CONFIG.EN_COURS.label}
        value={34}
        icon={React.createElement(STATUS_CONFIG.EN_COURS.icon, { width: 18, height: 18, className: 'text-indigo-600' })}
        accentClass="bg-indigo-50 text-indigo-600"
      />

      <StatCard
        title={STATUS_CONFIG.TERMINE.label}
        value={72}
        icon={React.createElement(STATUS_CONFIG.TERMINE.icon, { width: 18, height: 18, className: 'text-emerald-600' })}
        accentClass="bg-emerald-50 text-emerald-600"
      />

      <StatCard
        title={STATUS_CONFIG.REFUSE.label}
        value={3}
        icon={React.createElement(STATUS_CONFIG.REFUSE.icon, { width: 18, height: 18, className: 'text-red-600' })}
        accentClass="bg-red-50 text-red-600"
      />
    </div>
  )
}
