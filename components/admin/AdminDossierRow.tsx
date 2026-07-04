"use client"

import React from 'react'
import Link from 'next/link'
import { getStatusConfig, normalizeStatus } from '@/lib/status'
import { CheckCircle, XCircle } from 'lucide-react'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  paiement_effectue?: boolean
  pays_permis?: string
  statut?: string
  created_at?: string
}

export default function AdminDossierRow({ dossier, onOpen, selectedId }: { dossier: Dossier; onOpen?: (id: string) => void; selectedId?: string }) {
  const { id, numero_dossier, nom, prenom, pays_permis, paiement_effectue, statut, created_at } = dossier
  const gridStyle = { gridTemplateColumns: '220px 1fr 120px 110px 120px 120px 80px' }

  const badge = () => {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ring-1 ring-inset hover:scale-105 transition-transform'
    const s = normalizeStatus(statut)
    const cfg = s ? getStatusConfig(s) : null
    if (!cfg) return <span className={`${base} bg-gray-50 text-gray-700`}>{statut || '-'}</span>
    const Icon = cfg.icon
    return (
      <span role="status" aria-label={cfg.label} title={cfg.label} className={`${base} ${cfg.badgeClass}`}>
        <Icon width={12} height={12} className="mr-2" />{cfg.label}
      </span>
    )
  }

  return (
    <div className={`grid items-center px-3 py-3 hover:bg-gray-50`} style={gridStyle}>
      <div className="text-sm text-gray-700">{numero_dossier}</div>
      <div className="text-sm text-gray-800 truncate">{nom} {prenom}</div>
      <div className="text-sm text-gray-700">{pays_permis}</div>
      <div className="text-sm">{paiement_effectue ? <span className="text-[#16A34A]"><CheckCircle size={14} className="inline-block mr-1"/>Payé</span> : <span className="text-gray-500"><XCircle size={14} className="inline-block mr-1"/>Non</span>}</div>
      <div>{badge()}</div>
      <div className="text-sm text-gray-600">{created_at ? new Date(created_at).toLocaleDateString() : ''}</div>
      <div>
        {onOpen ? (
          <button type="button" onClick={() => onOpen(id)} className="text-sm text-blue-600 underline cursor-pointer">Voir</button>
        ) : (
          <Link href={`/admin/dossiers/${encodeURIComponent(numero_dossier)}`} className="text-sm text-blue-600 underline cursor-pointer">Voir</Link>
        )}
      </div>
    </div>
  )
}
