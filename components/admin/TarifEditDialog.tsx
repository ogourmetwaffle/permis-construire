"use client"

import React, { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  initial: { prix?: number }
  onSave: (values: { prix: number }) => Promise<boolean>
}

export default function TarifEditDialog({ open, onClose, initial, onSave }: Props) {
  const [prix, setPrix] = useState<number>(initial?.prix ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setPrix(initial?.prix ?? 0)
    setSaving(false)
    setError(null)
  }, [initial, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    // run save in background so dialog can close immediately and parent shows spinner
    onSave({ prix })
      .catch((err) => console.error('tarif save background error', err))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-4 sm:p-6 z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold">Modifier le prix</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-md"><X size={16} /></button>
        </div>

        <div>
          <label className="text-xs text-gray-500">Prix (€)</label>
          <input type="number" value={prix ?? 0} onChange={(e) => setPrix(Number(e.target.value))} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
        </div>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="px-3 py-1.5 rounded border bg-white text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
            {saving ? 'Enregistrement…' : (
              <>
                <Check size={14} /> Enregistrer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
