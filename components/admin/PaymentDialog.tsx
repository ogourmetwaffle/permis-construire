"use client"

import React, { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

type Props = {
  open: boolean
  onClose: () => void
  dossierId: string | number
  onSaved?: (updated: any) => void
}

export default function PaymentDialog({ open, onClose, dossierId, onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({ date: today, reference: '', commentaire: '' })
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setForm({ date: today, reference: '', commentaire: '' })
    setSaving(false)
  }, [open])

  if (!open) return null

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.reference || !form.reference.trim()) {
      toast.error('La référence bancaire est obligatoire')
      return
    }

    // show inline confirmation UI
    setConfirming(true)
    return
  }

  const handleConfirm = async () => {
    setSaving(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) {
        toast.error('Session expirée — reconnectez-vous')
        setSaving(false)
        setConfirming(false)
        return
      }

      const resp = await fetch(`/api/admin/dossiers/${dossierId}/paiement`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: form.date, reference: form.reference.trim(), commentaire: form.commentaire || null }),
      })
      const json = await resp.json()
      if (!resp.ok) {
        toast.error(json?.error || 'Erreur lors de la confirmation du paiement')
        setSaving(false)
        setConfirming(false)
        return
      }

      if (onSaved) onSaved(json.data ?? null)
    } catch (err) {
      console.error('payment save error', err)
      toast.error('Erreur réseau')
    } finally {
      setSaving(false)
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto p-4 sm:p-6 z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold">Enregistrer réception du paiement</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-md"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500">Date du paiement</label>
            <input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>

          <div>
            <label className="text-xs text-gray-500">Référence bancaire</label>
            <input value={form.reference} onChange={(e) => handleChange('reference', e.target.value)} required className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>

          <div>
            <label className="text-xs text-gray-500">Commentaire (optionnel)</label>
            <textarea value={form.commentaire} onChange={(e) => handleChange('commentaire', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" rows={3} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="px-3 py-1.5 rounded border bg-white text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
          {confirming ? (
            <div className="inline-flex items-center gap-2">
              <button type="button" onClick={() => setConfirming(false)} disabled={saving} className="px-3 py-1.5 rounded border bg-white text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
              <button type="button" onClick={handleConfirm} disabled={saving} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-600 text-white hover:bg-red-700 text-sm">
                {saving ? 'Enregistrement…' : (
                  <>
                    <Check size={14} /> Confirmer la réception
                  </>
                )}
              </button>
            </div>
          ) : (
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
              {saving ? 'Enregistrement…' : (
                <>
                  <Check size={14} /> Confirmer le paiement
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
