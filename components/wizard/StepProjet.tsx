'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { WizardData, TypeProjet } from './types'

interface StepProjetProps {
  data: WizardData
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

interface TarifRow {
  type_projet: TypeProjet
  prix: number
}

const PROJET_META: Record<TypeProjet, { label: string; sublabel: string; icon: string; features: string[] }> = {
  DP: {
    label: 'Déclaration Préalable',
    sublabel: 'DP',
    icon: '📄',
    features: [
      'Extension < 20 m²',
      'Modification de façade',
      'Changement de destination',
      'Construction < 5 m de hauteur',
    ],
  },
  PCMI: {
    label: 'Permis de Construire',
    sublabel: 'Maison Individuelle (PCMI)',
    icon: '🏡',
    features: [
      'Construction neuve',
      'Extension > 20 m²',
      'Surélévation',
      'Aménagement de combles',
    ],
  },
}

export default function StepProjet({ data, onChange, onNext, onPrev }: StepProjetProps) {
  const [tarifs, setTarifs] = useState<TarifRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!data.typeClient) return
    setLoading(true)
    supabase
      .from('tarifs')
      .select('type_projet, prix')
      .eq('type_client', data.typeClient)
      .eq('actif', true)
      .then(({ data: rows }) => {
        setTarifs((rows as TarifRow[]) ?? [])
        setLoading(false)
      })
  }, [data.typeClient])

  const getPrice = (type: TypeProjet): number | null => {
    const row = tarifs.find(t => t.type_projet === type)
    return row ? row.prix : null
  }

  const handleSelect = (value: TypeProjet) => {
    onChange({ typeProjet: value })
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">
          Quel est votre projet ?
        </h2>
        <p className="text-gray-500 text-base">
          Sélectionnez le type de démarche administrative pour votre projet.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[0, 1].map(i => (
            <div key={i} className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {(['DP', 'PCMI'] as TypeProjet[]).map((type) => {
            const meta = PROJET_META[type]
            const price = getPrice(type)
            const isSelected = data.typeProjet === type

            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSelect(type)}
                className={`
                  group relative text-left p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                  ${isSelected
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 shadow-md'
                    : 'border-gray-100 bg-white hover:border-[#1e3a5f]/30 hover:shadow-sm'
                  }
                `}
              >
                {/* Selected checkmark */}
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${isSelected ? 'border-[#1e3a5f] bg-[#1e3a5f]' : 'border-gray-200'}`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                <div className="text-3xl mb-3">{meta.icon}</div>
                <h3 className={`text-base font-bold mb-0.5 transition-colors ${isSelected ? 'text-[#1e3a5f]' : 'text-gray-800'}`}>
                  {meta.label}
                </h3>
                <p className="text-xs text-gray-400 mb-4">{meta.sublabel}</p>

                <ul className="space-y-1.5 mb-5">
                  {meta.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7b2020] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {price !== null ? (
                  <div className={`inline-flex items-baseline gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${isSelected ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-700'}`}>
                    <span className="text-lg">{price} €</span>
                    <span className="text-xs font-normal opacity-75">TTC</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 text-xs">
                    Tarif indisponible
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!data.typeProjet}
          className={`
            inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-base transition-all duration-200
            ${data.typeProjet
              ? 'bg-[#7b2020] hover:bg-[#6a1a1a] text-white shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Continuer
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
