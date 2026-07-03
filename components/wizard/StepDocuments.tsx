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
const MAX_SIZE = 50 * 1024 * 1024 // 50 Mo

function getFileIcon(file: File): string {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.includes('zip')) return 'zip'
  if (file.name.toLowerCase().endsWith('.skp')) return 'skp'
  return 'other'
}

function renderIcon(kind: string) {
  // Simple SVG icons to keep bundle small and consistent with the design
  if (kind === 'pdf') return (
    <svg className="w-6 h-6 text-[#7b2020]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M7 2h6l4 4v14a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M9 9h6M9 13h6" />
    </svg>
  )
  if (kind === 'image') return (
    <svg className="w-6 h-6 text-[#1e3a5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      <path d="M8 14l2.5-3 2 2L16 9l3 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  if (kind === 'zip') return (
    <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
      <path d="M8 7h8M8 11h8M8 15h8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  if (kind === 'skp') return (
    <svg className="w-6 h-6 text-[#1e3a5f]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg className="w-6 h-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 5v14M5 12h14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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
  const [info, setInfo] = useState<string | null>(null)

  const addFiles = (newFiles: FileList | File[]) => {
    const accepted: File[] = []
    const rejected: string[] = []
    const duplicates: string[] = []
    Array.from(newFiles).forEach(f => {
      // check accepted type/extension
      if (!isAccepted(f)) {
        rejected.push(f.name)
        return
      }
      // check size
      if (f.size > MAX_SIZE) {
        rejected.push(`${f.name}::size`)
        return
      }
      // check duplicate by name+size
      const exists = data.files.some(d => d.name === f.name && d.size === f.size)
      if (exists) {
        duplicates.push(f.name)
        return
      }
      accepted.push(f)
    })

    // Build messages
    if (rejected.length) {
      const sizeRejected = rejected.filter(r => r.includes('::size')).map(r => r.replace('::size', ''))
      const typeRejected = rejected.filter(r => !r.includes('::size'))
      const parts: string[] = []
      if (typeRejected.length) parts.push(`Fichier(s) non accepté(s) : ${typeRejected.join(', ')}.`)
      if (sizeRejected.length) parts.push(`Le(s) fichier(s) ${sizeRejected.join(', ')} dépasse(nt) la taille maximale autorisée (50 Mo).`)
      setError(parts.join(' '))
    } else {
      setError(null)
    }
    if (duplicates.length) {
      setInfo(duplicates.length === 1 ? `Le fichier ${duplicates[0]} existe déjà.` : `Plusieurs fichiers existent déjà et ont été ignorés.`)
      setTimeout(() => setInfo(null), 4000)
    }
    if (accepted.length) {
      onChange({ files: [...data.files, ...accepted] })
    }
  }

  const removeFile = (index: number) => {
    const updated = data.files.filter((_, i) => i !== index)
    onChange({ files: updated })
  }

  const clearAll = () => {
    const confirmed = window.confirm('Supprimer tous les fichiers sélectionnés ?')
    if (confirmed) onChange({ files: [] })
  }

  const totalSize = data.files.reduce((s, f) => s + f.size, 0)

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
        <p className="text-xs text-gray-400">PDF, PNG, JPG, WEBP, ZIP, SKP — vous pouvez ajouter plusieurs fichiers</p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {(error || info) && (
        <div className="mb-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {info && <p className="text-sm text-amber-700">{info}</p>}
        </div>
      )}

      {/* File cards */}
      {data.files.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700">
              {data.files.length} fichier{data.files.length > 1 ? 's' : ''} • {formatSize(totalSize)}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Supprimer tous les fichiers
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.files.map((file, i) => (
              <div
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in"
              >
                <div className="w-12 h-12 rounded-lg bg-[#f5f6f8] flex items-center justify-center text-xl shrink-0">
                  {renderIcon(getFileIcon(file))}
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
