"use client"

import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div role="dialog" aria-modal="true" className="relative w-[90vw] max-w-[1500px] mx-auto">
        <div className="transform transition-all duration-200 scale-100 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
            <div>
              <div className="text-sm text-gray-500">{title}</div>
            </div>
            <button aria-label="Fermer" onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
