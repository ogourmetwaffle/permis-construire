'use client'

import { WizardData, TypeClient } from './types'

interface StepClientProps {
  data: WizardData
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
}

const options: { value: TypeClient; label: string; description: string; icon: string }[] = [
  {
    value: 'PARTICULIER',
    label: 'Particulier',
    description: 'Je dépose un dossier pour mon usage personnel ou familial.',
    icon: '🏠',
  },
  {
    value: 'PROFESSIONNEL',
    label: 'Professionnel',
    description: 'Je dépose un dossier dans le cadre d\'une activité professionnelle.',
    icon: '🏢',
  },
]

export default function StepClient({ data, onChange, onNext }: StepClientProps) {
  const handleSelect = (value: TypeClient) => {
    onChange({ typeClient: value })
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">
          Qui êtes-vous ?
        </h2>
        <p className="text-gray-500 text-base">
          Sélectionnez votre profil pour adapter votre dossier.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {options.map((opt) => {
          const isSelected = data.typeClient === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
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

              <div className="text-4xl mb-4">{opt.icon}</div>
              <h3 className={`text-lg font-bold mb-1.5 transition-colors ${isSelected ? 'text-[#1e3a5f]' : 'text-gray-800'}`}>
                {opt.label}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {opt.description}
              </p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!data.typeClient}
          className={`
            inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all duration-200
            ${data.typeClient
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
