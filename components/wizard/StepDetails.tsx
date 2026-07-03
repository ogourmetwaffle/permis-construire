'use client'

import { useState } from 'react'
import { WizardData } from './types'

interface StepDetailsProps {
  data: WizardData
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

type FieldErrors = Partial<Record<string, string>>

const inputClass = `
  w-full px-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/60
  transition-all duration-150 bg-white
`
const errorInputClass = `
  w-full px-4 py-3 border border-red-300 rounded-xl text-sm placeholder-gray-400
  focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
  transition-all duration-150 bg-white
`

export default function StepDetails({ data, onChange, onNext, onPrev }: StepDetailsProps) {
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FieldErrors = {}
    if (!data.adresseProjet.trim()) newErrors.adresseProjet = 'L\'adresse du projet est requise'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const surfaceNum = parseFloat(data.surface)
  const showDevisWarning = !isNaN(surfaceNum) && surfaceNum > 150

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">
          Votre projet
        </h2>
        <p className="text-gray-500 text-base">
          Renseignez les informations relatives à votre terrain et à votre construction.
        </p>
      </div>

      <div className="space-y-5 mb-10">
        {/* Adresse projet */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Adresse du projet <span className="text-[#7b2020]">*</span>
          </label>
          <input
            name="adresseProjet"
            type="text"
            value={data.adresseProjet}
            onChange={handleChange}
            placeholder="12 rue des Lilas, 75001 Paris"
            className={errors.adresseProjet ? errorInputClass : inputClass}
          />
          {errors.adresseProjet && (
            <p className="mt-1 text-xs text-red-500">{errors.adresseProjet}</p>
          )}
        </div>

        {/* Adresse client */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Votre adresse personnelle
            <span className="ml-2 text-xs font-normal text-gray-400">(si différente de l&apos;adresse du projet)</span>
          </label>
          <input
            name="adresseClient"
            type="text"
            value={data.adresseClient}
            onChange={handleChange}
            placeholder="8 avenue de la Paix, 69001 Lyon"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Numéro de parcelle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Numéro de parcelle
            </label>
            <input
              name="numeroParcelle"
              type="text"
              value={data.numeroParcelle}
              onChange={handleChange}
              placeholder="AB 0012"
              className={inputClass}
            />
          </div>

          {/* Surface */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Surface du projet (m²)
            </label>
            <div className="relative">
              <input
                name="surface"
                type="number"
                min="0"
                step="0.01"
                value={data.surface}
                onChange={handleChange}
                placeholder="120"
                className={`${inputClass} pr-12`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">m²</span>
            </div>
          </div>
        </div>

        {/* Devis warning */}
        {showDevisWarning && (
          <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <span className="text-xl shrink-0">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Devis personnalisé requis</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Pour une surface supérieure à 150 m², votre projet nécessite un devis personnalisé. Notre équipe vous recontactera rapidement après réception de votre dossier.
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Description du projet
          </label>
          <textarea
            name="description"
            value={data.description}
            onChange={handleChange}
            placeholder="Décrivez brièvement votre projet (type de construction, matériaux, spécificités…)"
            rows={4}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

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
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
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
