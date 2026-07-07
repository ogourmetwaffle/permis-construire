"use client"

import React, { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  initial: { iban?: string; bic?: string; titulaire?: string; updated_at?: string }
  onSave: (values: { iban?: string; bic?: string; titulaire?: string }) => Promise<boolean>
}

export default function BankDetailsDialog({ open, onClose, initial, onSave }: Props) {
  const [form, setForm] = useState({ iban: '', bic: '', titulaire: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm({ iban: initial?.iban || '', bic: initial?.bic || '', titulaire: initial?.titulaire || '' })
    setError(null)
    setSaving(false)
  }, [initial, open])

  if (!open) return null

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    // fire-and-forget save: start saving in background so we can close dialog immediately
    onSave(form)
      .catch((err) => {
        console.error('bank save background error', err)
      })
    // close immediately so the UI does not feel frozen; parent shows spinner via its `saving` state
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto p-4 sm:p-6 z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold">Modifier coordonnées bancaires</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-md"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Titulaire</label>
            <input value={form.titulaire} onChange={(e) => handleChange('titulaire', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500">IBAN</label>
            <input value={form.iban} onChange={(e) => handleChange('iban', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>
          <div>
            <label className="text-xs text-gray-500">BIC</label>
            <input value={form.bic} onChange={(e) => handleChange('bic', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>
          {initial?.updated_at && (
            <div className="flex items-center justify-between py-2.5">
              <span className="text-xs text-gray-500">Dernière modification</span>
              <span className="text-xs font-medium text-gray-800">{new Date(initial.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
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
