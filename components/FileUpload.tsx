"use client"

import { useState, useRef } from 'react'
import { Cloud as CloudIcon, File as FileIcon, Image as ImageIcon, Trash2 as Trash2Icon } from 'lucide-react'

type Props = {
  onFilesChange?: (files: File[]) => void
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export default function FileUpload({ onFilesChange }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const shortName = (name: string, max = 60) => {
    if (name.length <= max) return name
    const prefix = name.slice(0, Math.max(8, max - 12))
    const suffix = name.slice(-8)
    return `${prefix}....${suffix}`
  }

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || ''
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon size={16} className="text-indigo-600" />
    if (ext === 'pdf') return <FileIcon size={16} className="text-indigo-600" />
    return <FileIcon size={16} className="text-indigo-600" />
  }

  const validateAndSet = (arr: File[]) => {
    const newFiles: File[] = []
    const newErrors: string[] = []
    for (const f of arr) {
      const okType = ['application/pdf', 'image/pdf', 'image/jpeg', 'image/png'].includes(f.type) || /\.(pdf|jpe?g|png)$/i.test(f.name)
      const okSize = f.size <= MAX_SIZE
      if (!okType) newErrors.push(`${f.name}: type de fichier non supporté`)
      else if (!okSize) newErrors.push(`${f.name}: fichier trop volumineux (>50MB)`)
      else newFiles.push(f)
    }
    const updated = [...files, ...newFiles]
    setFiles(updated)
    setErrors(newErrors)
    onFilesChange?.(updated)
  }

  const handleFiles = (fList: FileList | null) => {
    if (!fList) return
    validateAndSet(Array.from(fList))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeFile = (name: string) => {
    const updated = files.filter((f) => f.name !== name)
    setFiles(updated)
    onFilesChange?.(updated)
  }

  return (
    <div className="bg-white rounded-lg border p-4 h-95 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="text-gray-600 rounded p-1">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M16 16v-6"/><path d="M12 12l4-4-4-4-4 4 4 4z" transform="rotate(180 12 8)"/><path d="M20 16a4 4 0 00-3.46-3.97A5 5 0 0012 6a5 5 0 00-4.54 6.03A4 4 0 004 16"/></svg>
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">Documents</div>
          <div className="text-xs text-gray-500">Formats : PDF, JPG, PNG — max 50 MB</div>
        </div>
      </div>

      {/* Dropzone (compact 120-160px) */}
      <div className="mb-3">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full rounded-lg transition cursor-pointer ${dragOver ? 'border-2 border-blue-200 bg-white shadow-sm' : 'border-2 border-dashed border-gray-200 bg-gray-50'}`}
        >
          <div className="flex flex-col items-center justify-center h-35 px-3">
            <div className="text-3xl mb-1"><CloudIcon size={40} className="text-gray-400" /></div>
            <div className="mb-1 text-sm text-gray-700">Déposer vos documents</div>
            <div className="text-sm text-blue-600"><button type="button" onClick={() => inputRef.current?.click()} className="underline cursor-pointer">ou cliquez pour sélectionner</button></div>
            <input ref={inputRef} type="file" accept=".pdf,image/jpeg,image/png" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-2 text-sm text-red-600" role="status" aria-live="polite">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      {/* Selected files (inside card) */}
      <div className="mt-2">
        <div className="text-sm font-medium text-gray-900 mb-2">Fichiers sélectionnés ({files.length})</div>
        <div className="border border-gray-100 rounded-md bg-white shadow-sm overflow-auto" style={{ maxHeight: '168px' }}>
          <div className="p-2">
            {files.length === 0 && (
              <div className="text-sm text-gray-500 py-3">Ajoutez vos documents pour continuer.</div>
            )}
          </div>

          <div className="divide-y divide-gray-100">
            {files.map((f, idx) => (
              <div key={`${f.name}-${idx}`} className="flex items-center justify-between px-3" style={{ height: '52px' }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center text-sm">{fileIcon(f.name)}</div>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-800 truncate max-w-[60%] sm:max-w-70">{shortName(f.name, 40)}</div>
                  </div>
                  <div className="text-xs text-gray-500 ml-3">{(f.size/1024/1024).toFixed(2)} MB</div>
                </div>
                <button type="button" onClick={() => removeFile(f.name)} className="ml-3 text-red-600 rounded-full p-2 cursor-pointer" aria-label={`Supprimer ${f.name}`}>
                  <Trash2Icon size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
