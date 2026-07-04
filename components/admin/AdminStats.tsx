"use client"

import React from 'react'
import { STATUS_CONFIG } from '@/lib/status'

const StatCard = ({ title, value, icon, accentClass }: { title: string; value: string | number; icon?: React.ReactNode; accentClass?: string }) => (
  <div className={`rounded-xl p-4 bg-white border border-slate-100 shadow-sm h-24 flex items-center gap-3`}>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accentClass} bg-opacity-30`}>{icon}</div>
    <div className="flex-1">
      <div className="text-[11px] text-slate-500">{title}</div>
      <div className="text-2xl font-extrabold text-slate-900 mt-1 leading-tight">{value}</div>
    </div>
  </div>
)

export default function AdminStats({
  counts,
}: {
  counts?: { total?: number; nouveaux?: number; enAttente?: number; enCours?: number; termines?: number }
}) {
  const c = counts || { total: 0, nouveaux: 0, enAttente: 0, enCours: 0, termines: 0 }

  return (
    <>
      <StatCard
        title={STATUS_CONFIG.EN_ATTENTE_PAIEMENT.label}
        value={c.enAttente ?? 0}
        icon={React.createElement(STATUS_CONFIG.EN_ATTENTE_PAIEMENT.icon, { width: 18, height: 18, className: 'text-amber-600' })}
        accentClass="bg-amber-50 text-amber-600"
      />

      <StatCard
        title={STATUS_CONFIG.NOUVEAU.label}
        value={c.nouveaux ?? 0}
        icon={React.createElement(STATUS_CONFIG.NOUVEAU.icon, { width: 18, height: 18, className: 'text-blue-600' })}
        accentClass="bg-blue-50 text-blue-600"
      />

      <StatCard
        title={STATUS_CONFIG.EN_COURS.label}
        value={c.enCours ?? 0}
        icon={React.createElement(STATUS_CONFIG.EN_COURS.icon, { width: 18, height: 18, className: 'text-indigo-600' })}
        accentClass="bg-indigo-50 text-indigo-600"
      />

      <StatCard
        title={STATUS_CONFIG.TERMINE.label}
        value={c.termines ?? 0}
        icon={React.createElement(STATUS_CONFIG.TERMINE.icon, { width: 18, height: 18, className: 'text-emerald-600' })}
        accentClass="bg-emerald-50 text-emerald-600"
      />
    </>
  )
}
