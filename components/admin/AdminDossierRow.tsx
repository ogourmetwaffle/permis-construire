"use client"

import React from 'react'
import Link from 'next/link'
import { getStatusConfig, normalizeStatus } from '@/lib/status'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  paiement_effectue?: boolean
  type_client?: string
  statut?: string
  created_at?: string
}

export default function AdminDossierRow({ dossier, onOpen }: { dossier: Dossier; onOpen?: (id: string) => void }) {
  const { id, numero_dossier, nom, prenom, paiement_effectue, type_client, statut, created_at } = dossier
  const gridStyle = { gridTemplateColumns: '200px 1fr 130px 110px 170px 130px 96px' }
  const isPro = (type_client || '').toLowerCase().includes('pro')

  const badge = () => {
    const base = 'inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap'
    const s = normalizeStatus(statut)
    const cfg = s ? getStatusConfig(s) : null
    if (!cfg) return <span className={`${base} bg-gray-50 text-gray-700`}>{statut || '-'}</span>
    const Icon = cfg.icon
    return (
      <span role="status" aria-label={cfg.label} title={cfg.label} className={`${base} ${cfg.badgeClass}`}>
        <Icon width={16} height={16} className="mr-1 shrink-0" />{cfg.label}
      </span>
    )
  }

  return (
    <div className={`grid items-center px-4 py-2 hover:bg-slate-50 transition-colors duration-150`} style={gridStyle}>
      <div className="text-sm text-gray-700">{numero_dossier}</div>
      <div className="text-sm text-gray-800 truncate">{nom} {prenom}</div>
      <div className="flex items-center justify-center">
        <span className={`inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap ${isPro ? 'bg-blue-50 text-blue-700 ring-blue-100' : 'bg-green-50 text-green-700 ring-green-100'}`}>
          {isPro ? 'Professionnel' : 'Particulier'}
        </span>
      </div>
      <div className="flex items-center justify-center text-sm">{paiement_effectue ? <span className="text-[#16A34A]"><CheckCircle size={16} className="inline-block mr-1"/>Payé</span> : <span className="text-gray-500"><XCircle size={16} className="inline-block mr-1"/>Non</span>}</div>
      <div className="flex items-center justify-center">{badge()}</div>
      <div className="text-sm text-gray-600">{created_at ? new Date(created_at).toLocaleDateString() : ''}</div>
      <div className="flex items-center justify-center">
        {onOpen ? (
          <button type="button" onClick={() => onOpen(id)} className="inline-flex items-center gap-3 px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition">Ouvrir <ArrowRight size={16} /></button>
        ) : (
          <Link href={`/admin/dossiers/${encodeURIComponent(numero_dossier)}`} className="inline-flex items-center gap-3 px-3 py-1.5 text-sm rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm transition">Ouvrir <ArrowRight size={16} /></Link>
        )}
      </div>
    </div>
  )
}
