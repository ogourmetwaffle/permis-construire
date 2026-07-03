'use client'

import { useRef, useState, DragEvent } from 'react'
import { WizardData } from './types'

interface StepDocumentsProps {
  data: WizardData
  onChange: (updates: Partial<WizardData>) => void
  onNext: () => void
  onPrev: () => void
}

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'application/zip', 'application/x-zip-compressed']
const ACCEPTED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.zip', '.skp']

function getFileIcon(file: File): string {
  if (file.type === 'application/pdf') return '📄'
  if (file.type.startsWith('image/')) return '🖼️'
  if (file.type.includes('zip')) return '🗜️'
  if (file.name.toLowerCase().endsWith('.skp')) return '📐'
  return '📎'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function isAccepted(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.includes(ext)
}

export default function StepDocuments({ data, onChange, onNext, onPrev }: StepDocumentsProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addFiles = (newFiles: FileList | File[]) => {
    const accepted: File[] = []
    const rejected: string[] = []
    Array.from(newFiles).forEach(f => {
      if (isAccepted(f)) {
        accepted.push(f)
      } else {
        rejected.push(f.name)
      }
    })
    if (rejected.length) {
      setError(`Fichier(s) non accepté(s) : ${rejected.join(', ')}. Formats autorisés : PDF, PNG, JPG, ZIP, SKP.`)
    } else {
      setError(null)
    }
    if (accepted.length) {
      onChange({ files: [...data.files, ...accepted] })
    }
  }

  const removeFile = (index: number) => {
    const updated = data.files.filter((_, i) => i !== index)
    onChange({ files: updated })
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleNext = () => {
    if (data.files.length === 0) {
      setError('Veuillez ajouter au moins un document.')
      return
    }
    setError(null)
    onNext()
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">
          Vos documents
        </h2>
        <p className="text-gray-500 text-base">
          Ajoutez tous les fichiers relatifs à votre projet. Vous pourrez en ajouter d&apos;autres ultérieurement.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 mb-6
          ${dragging
            ? 'border-[#1e3a5f] bg-[#1e3a5f]/5 scale-[1.01]'
            : 'border-gray-200 hover:border-[#1e3a5f]/40 hover:bg-[#f5f6f8]'
          }
        `}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-[#1e3a5f]/10' : 'bg-gray-100'}`}>
          <svg className={`w-7 h-7 transition-colors ${dragging ? 'text-[#1e3a5f]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#1e3a5f]">
            Glissez vos fichiers ici
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            ou <span className="text-[#7b2020] underline underline-offset-2">cliquez pour parcourir</span>
          </p>
        </div>
        <p className="text-xs text-gray-400">PDF, PNG, JPG, ZIP, SKP — jusqu&apos;à plusieurs fichiers</p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-4">{error}</p>
      )}

      {/* File cards */}
      {data.files.length > 0 && (
        <div className="space-y-3 mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {data.files.length} fichier{data.files.length > 1 ? 's' : ''} ajouté{data.files.length > 1 ? 's' : ''}
          </p>
          {data.files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-150"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f5f6f8] flex items-center justify-center text-xl shrink-0">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                aria-label="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
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
