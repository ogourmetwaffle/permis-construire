'use client'

import { useState } from 'react'
import { WizardData } from './types'

interface StepInformationsProps {
  data: WizardData
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

type FieldErrors = Partial<Record<keyof WizardData, string>>

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

export default function StepInformations({ data, onChange, onNext, onPrev }: StepInformationsProps) {
  const [errors, setErrors] = useState<FieldErrors>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [e.target.name]: e.target.value })
    if (errors[e.target.name as keyof WizardData]) {
      setErrors(prev => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FieldErrors = {}
    if (!data.nom.trim()) newErrors.nom = 'Le nom est requis'
    if (!data.prenom.trim()) newErrors.prenom = 'Le prénom est requis'
    if (!data.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = 'Email invalide'
    }
    if (!data.telephone.trim()) newErrors.telephone = 'Le téléphone est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const fields: { name: keyof WizardData; label: string; type: string; placeholder: string; required: boolean }[] = [
    { name: 'nom', label: 'Nom', type: 'text', placeholder: 'Dupont', required: true },
    { name: 'prenom', label: 'Prénom', type: 'text', placeholder: 'Jean', required: true },
    { name: 'email', label: 'Adresse email', type: 'email', placeholder: 'jean.dupont@exemple.fr', required: true },
    { name: 'telephone', label: 'Téléphone', type: 'tel', placeholder: '06 12 34 56 78', required: true },
    { name: 'dateNaissance', label: 'Date de naissance', type: 'date', placeholder: '', required: false },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">
          Vos informations
        </h2>
        <p className="text-gray-500 text-base">
          Ces informations permettront d&apos;identifier votre dossier et de vous contacter.
        </p>
      </div>

      <div className="space-y-5 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.slice(0, 2).map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-[#7b2020] ml-1">*</span>}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={data[field.name] as string}
                onChange={handleChange}
                placeholder={field.placeholder}
                className={errors[field.name] ? errorInputClass : inputClass}
              />
              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {fields.slice(2).map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {field.label}
              {field.required && <span className="text-[#7b2020] ml-1">*</span>}
            </label>
            <input
              name={field.name}
              type={field.type}
              value={data[field.name] as string}
              onChange={handleChange}
              placeholder={field.placeholder}
              className={errors[field.name] ? errorInputClass : inputClass}
            />
            {errors[field.name] && (
              <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3 bg-[#f5f6f8] rounded-xl text-xs text-gray-500 mb-8">
        <svg className="w-4 h-4 text-[#7b2020] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Vos informations sont protégées et ne seront jamais partagées avec des tiers.
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
