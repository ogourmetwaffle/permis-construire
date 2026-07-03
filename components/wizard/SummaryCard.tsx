'use client'

import { WizardData, TypeProjet } from './types'

interface SummaryCardProps {
  data: WizardData
  tarif: number | null
}

const PROJET_LABELS: Record<TypeProjet, string> = {
  DP: 'Déclaration Préalable',
  PCMI: 'Permis de Construire (PCMI)',
}

export default function SummaryCard({ data, tarif }: SummaryCardProps) {
  return (
    <div className="bg-[#f5f6f8] rounded-2xl p-5 border border-gray-100 mb-8">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Récapitulatif</h3>
      <div className="space-y-2.5">
        <SummaryRow
          icon="👤"
          label="Profil"
          value={data.typeClient === 'PARTICULIER' ? 'Particulier' : 'Professionnel'}
        />
        {data.typeProjet && (
          <SummaryRow
            icon="📋"
            label="Démarche"
            value={PROJET_LABELS[data.typeProjet as TypeProjet]}
          />
        )}
        {data.nom && (
          <SummaryRow
            icon="✉️"
            label="Identité"
            value={`${data.prenom} ${data.nom}`}
          />
        )}
        {data.adresseProjet && (
          <SummaryRow
            icon="📍"
            label="Projet"
            value={data.adresseProjet}
          />
        )}
        {data.surface && (
          <SummaryRow
            icon="📐"
            label="Surface"
            value={`${data.surface} m²`}
          />
        )}
        {data.files.length > 0 && (
          <SummaryRow
            icon="📎"
            label="Documents"
            value={`${data.files.length} fichier${data.files.length > 1 ? 's' : ''}`}
          />
        )}
      </div>
      {tarif !== null && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total</span>
          <span className="text-xl font-bold text-[#1e3a5f]">{tarif} €</span>
        </div>
      )}
    </div>
  )
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-sm shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <span className="text-xs text-gray-400">{label} · </span>
        <span className="text-xs font-medium text-gray-700 wrap-break-word">{value}</span>
      </div>
    </div>
  )
}
