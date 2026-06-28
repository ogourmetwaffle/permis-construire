"use client"

import React from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, Circle, Clock } from 'lucide-react'

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
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ring-1 ring-inset'

    if (statut === 'NOUVEAU') return (
      <span role="status" aria-label="Nouveau" title="Nouveau" className={`${base} bg-orange-50 text-orange-700 ring-orange-100 hover:scale-105 transition-transform`}> 
        <Circle size={12} className="mr-2" />Nouveau
      </span>
    )

    if (statut === 'EN_COURS') return (
      <span role="status" aria-label="En cours" title="En cours" className={`${base} bg-blue-50 text-blue-800 ring-blue-100 hover:scale-105 transition-transform`}> 
        <Clock size={12} className="mr-2" />En cours
      </span>
    )

    if (statut === 'COMPLET') return (
      <span role="status" aria-label="Terminé" title="Terminé" className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-100 hover:scale-105 transition-transform`}> 
        <CheckCircle size={12} className="mr-2" />Terminé
      </span>
    )

    return (
      <span role="status" aria-label="Refusé" title="Refusé" className={`${base} bg-red-50 text-red-700 ring-red-100 hover:scale-105 transition-transform`}> 
        <XCircle size={12} className="mr-2" />Refusé
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
