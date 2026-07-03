'use client'

import { STEP_LABELS, TOTAL_STEPS } from './types'

interface ProgressBarProps {
  currentStep: number
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
  const progress = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="w-full">
      {/* Step labels — desktop */}
      <div className="hidden sm:flex items-center justify-between mb-3">
        {STEP_LABELS.map(({ step, label }) => {
          const isDone = step < currentStep
          const isActive = step === currentStep
          return (
            <div key={step} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                  ${isDone ? 'bg-[#7b2020] text-white' : isActive ? 'bg-[#1e3a5f] text-white ring-4 ring-[#1e3a5f]/20' : 'bg-gray-100 text-gray-400'}
                `}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? 'text-[#1e3a5f]' : isDone ? 'text-[#7b2020]' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-linear-to-r from-[#1e3a5f] to-[#7b2020] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mobile: step indicator */}
      <div className="flex sm:hidden justify-between items-center mt-2">
        <span className="text-xs text-gray-500">Étape {currentStep} sur {TOTAL_STEPS}</span>
        <span className="text-xs font-semibold text-[#1e3a5f]">
          {STEP_LABELS.find(s => s.step === currentStep)?.label}
        </span>
      </div>
    </div>
  )
}
