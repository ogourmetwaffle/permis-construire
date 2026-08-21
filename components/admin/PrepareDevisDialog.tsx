"use client"

import React, { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  dossierId: number | string
  initial: { montant?: number | null; iban?: string | null; bic?: string | null; titulaire?: string | null; reference?: string | null; commentaire?: string | null }
  onSaved?: (updated: any) => void
}

export default function PrepareDevisDialog({ open, onClose, dossierId, initial, onSaved }: Props) {
  const [montant, setMontant] = useState<number | null>(initial?.montant ?? null)
  const [iban, setIban] = useState(initial?.iban ?? '')
  const [bic, setBic] = useState(initial?.bic ?? '')
  const [titulaire, setTitulaire] = useState(initial?.titulaire ?? '')
  const [reference, setReference] = useState(initial?.reference ?? '')
  const [commentaire, setCommentaire] = useState(initial?.commentaire ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMontant(initial?.montant ?? null)
    setIban(initial?.iban ?? '')
    setBic(initial?.bic ?? '')
    setTitulaire(initial?.titulaire ?? '')
    setReference(initial?.reference ?? (initial?.reference ?? ''))
    setCommentaire(initial?.commentaire ?? '')
    setSaving(false)
  }, [initial, open])

  useEffect(() => {
    // if fields are empty, try to fetch default params
    const needs = !iban && !bic && !titulaire
    if (!open || !needs) return
    let mounted = true
    ;(async () => {
      try {
        const resp = await fetch('/api/parametres')
        if (!resp.ok) return
        const j = await resp.json()
        const items = j?.items || {}
        if (!mounted) return
        setIban(prev => prev || items['iban'] || '')
        setBic(prev => prev || items['bic'] || '')
        setTitulaire(prev => prev || items['titulaire'] || '')
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [open])

  if (!open) return null

  const saveDevis = async (send = false) => {
    if (montant == null || Number.isNaN(Number(montant))) { toast.error('Montant invalide'); return }
    setSaving(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) { toast.error('Session expirée — reconnectez-vous'); setSaving(false); return }

      const body = { montant, iban: iban || null, bic: bic || null, titulaire: titulaire || null, reference: reference || undefined, commentaire: commentaire || undefined, send: send }

      const resp = await fetch(`/api/admin/dossiers/${encodeURIComponent(String(dossierId))}/devis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const j = await resp.json()
      if (!resp.ok) { toast.error(j?.error || 'Erreur'); setSaving(false); return }
      toast.success(send ? 'Devis envoyé' : 'Devis enregistré')
      if (onSaved) onSaved(j.data || j)
      onClose()
    } catch (err) {
      console.error('save devis error', err)
      toast.error('Erreur réseau')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-4 sm:p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold">Préparer le devis</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-md"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs text-gray-500">Montant (€) <span className="text-red-600">*</span></label>
            <input type="number" value={montant ?? ''} onChange={(e) => setMontant(e.target.value ? Number(e.target.value) : null)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" required />
          </div>

          <div>
            <label className="text-xs text-gray-500">Titulaire</label>
            <input value={titulaire} onChange={(e) => setTitulaire(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">IBAN</label>
              <input value={iban} onChange={(e) => setIban(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
            </div>
            <div>
              <label className="text-xs text-gray-500">BIC</label>
              <input value={bic} onChange={(e) => setBic(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Référence virement (optionnel)</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
          </div>

          <div>
            <label className="text-xs text-gray-500">Commentaire (optionnel)</label>
            <textarea value={commentaire ?? ''} onChange={e => setCommentaire(e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" rows={3} />
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold mb-1">Aperçu du devis</h4>
            <div className="text-sm">Numéro: <strong>{initial?.reference ?? dossierId}</strong></div>
            <div className="text-sm">Montant: <strong>{montant ?? 0} €</strong></div>
            <div className="text-sm">Titulaire: <strong>{titulaire || '-'}</strong></div>
            <div className="text-sm">IBAN: <strong>{iban || '-'}</strong></div>
            <div className="text-sm">BIC: <strong>{bic || '-'}</strong></div>
            <div className="mt-2 text-sm text-gray-600">Le client recevra un email contenant le montant du devis et les coordonnées bancaires pour effectuer le virement.</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="px-3 py-1.5 rounded border bg-white text-sm text-gray-700 hover:bg-gray-50">Annuler</button>
          <button type="button" onClick={() => saveDevis(false)} disabled={saving} className="px-3 py-1.5 rounded bg-gray-800 text-white hover:bg-black text-sm">Enregistrer le devis</button>
          <button type="button" onClick={() => saveDevis(true)} disabled={saving} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#7b2020] text-white hover:bg-[#5f1919] text-sm">{saving ? 'Envoi…' : (<><Check size={14} /> Envoyer le devis</>)}</button>
        </div>
      </form>
    </div>
  )
}
