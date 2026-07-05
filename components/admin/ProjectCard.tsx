"use client"

import React from 'react'
import { FileText, MapPin, Layers, Hash } from 'lucide-react'

export default function ProjectCard({ dossier }: { dossier: any }) {
  if (!dossier) return null

  const rows: Array<{ label: string; value?: React.ReactNode }> = [
    { label: 'Type de projet', value: dossier.type_projet || '—' },
    { label: 'Surface', value: dossier.surface ? `${dossier.surface} m²` : '—' },
    { label: 'N° parcelle', value: dossier.numero_parcelle || '—' },
    { label: 'Adresse', value: dossier.adresse_projet || '—' },
  ]

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Projet de construction</h2>
            <div className="text-xs text-gray-500 mt-0.5">Fiche projet principale</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{r.label}</div>
            <div className="text-sm font-medium text-gray-800">{r.value}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</div>
        <div className="text-sm text-gray-700 leading-relaxed">{dossier.description || '—'}</div>
      </div>
    </div>
  )
}
