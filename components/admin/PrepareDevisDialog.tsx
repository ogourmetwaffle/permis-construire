"use client"

import React, { useEffect, useState } from 'react'
import { X, Check } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  dossierId: number | string
  initial: { montant?: number | null; iban?: string | null; bic?: string | null; titulaire?: string | null; reference?: string | null; commentaire?: string | null; mode_paiement?: string | null; montant_acompte?: number | null }
  onSaved?: (updated: any) => void
}

export default function PrepareDevisDialog({ open, onClose, dossierId, initial, onSaved }: Props) {
  const [montant, setMontant] = useState<number | null>(initial?.montant ?? null)
  const [iban, setIban] = useState(initial?.iban ?? '')
  const [bic, setBic] = useState(initial?.bic ?? '')
  const [titulaire, setTitulaire] = useState(initial?.titulaire ?? '')
  const [bankAccounts, setBankAccounts] = useState<Array<{ label: string; iban?: string; bic?: string; titulaire?: string }>>([])
  const [selectedBankIndex, setSelectedBankIndex] = useState<number | null>(null)
  const [reference, setReference] = useState(initial?.reference ?? '')
  const [commentaire, setCommentaire] = useState(initial?.commentaire ?? '')
  const [modePaiement, setModePaiement] = useState<'INTEGRAL' | 'ACOMPTE'>((initial?.mode_paiement === 'ACOMPTE' || (initial?.montant_acompte && Number(initial.montant_acompte) > 0)) ? 'ACOMPTE' : 'INTEGRAL')
  const [montantAcompte, setMontantAcompte] = useState<number | null>(initial?.montant_acompte ?? null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setMontant(initial?.montant ?? null)
    setIban(initial?.iban ?? '')
    setBic(initial?.bic ?? '')
    setTitulaire(initial?.titulaire ?? '')
    setReference(initial?.reference ?? (initial?.reference ?? ''))
    setCommentaire(initial?.commentaire ?? '')
    setModePaiement((initial?.mode_paiement === 'ACOMPTE' || (initial?.montant_acompte && Number(initial.montant_acompte) > 0)) ? 'ACOMPTE' : 'INTEGRAL')
    setMontantAcompte(initial?.montant_acompte ?? null)
    setSaving(false)
  }, [initial, open])

  useEffect(() => {
    const needs = !iban && !bic && !titulaire
    if (!open || !needs) return
    let mounted = true
    ;(async () => {
      try {
        const session = await supabase.auth.getSession()
        const token = session.data?.session?.access_token
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        const resp = await fetch('/api/admin/parametres', { headers })
        if (!resp.ok) return
        const j = await resp.json()
        const itemsArr = Array.isArray(j?.items) ? j.items : []
        const items: Record<string, any> = {}
        for (const it of itemsArr) {
          if (it && it.cle) items[it.cle] = it
        }
        if (!mounted) return
        setIban(prev => prev || items['iban'] || '')
        setBic(prev => prev || items['bic'] || '')
        setTitulaire(prev => prev || items['titulaire'] || '')
        const raw = items['bank_accounts']?.valeur
        if (raw) {
          try {
            const arr = JSON.parse(raw)
            if (Array.isArray(arr)) {
              setBankAccounts(arr)
              if ((!iban || !bic || !titulaire) && arr.length > 0) {
                setSelectedBankIndex(0)
                const a = arr[0]
                setIban(a.iban || '')
                setBic(a.bic || '')
                setTitulaire(a.titulaire || '')
              }
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => { mounted = false }
  }, [open])

  if (!open) return null

  const total = Number(montant) || 0
  const acompte = Number(montantAcompte) || 0
  const solde = total - acompte

  const validate = (): string | null => {
    if (montant == null || Number.isNaN(Number(montant)) || total <= 0) {
      return 'Le montant total doit être supérieur à 0.'
    }
    if (modePaiement === 'ACOMPTE') {
      if (montantAcompte == null || Number.isNaN(Number(montantAcompte))) {
        return 'L\'acompte est obligatoire.'
      }
      if (acompte <= 0) {
        return 'L\'acompte doit être supérieur à 0.'
      }
      if (acompte >= total) {
        return 'L\'acompte doit être strictement inférieur au montant total.'
      }
    }
    return null
  }

  const saveDevis = async (send = false) => {
    const error = validate()
    if (error) { toast.error(error); return }
    setSaving(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) { toast.error('Session expirée — reconnectez-vous'); setSaving(false); return }

      const body: any = {
        montant: Number(montant),
        iban: iban || null,
        bic: bic || null,
        titulaire: titulaire || null,
        reference: reference || undefined,
        commentaire: commentaire || undefined,
        send: send,
      }
      if (modePaiement === 'ACOMPTE') {
        body.mode_paiement = 'ACOMPTE'
        body.montant_acompte = Number(montantAcompte)
      } else {
        body.mode_paiement = 'INTEGRAL'
        body.montant_acompte = 0
      }

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
            <label className="text-xs text-gray-500">RIB prédéfinis</label>
            <div className="mt-1 flex gap-2 items-center">
              <select value={selectedBankIndex ?? ''} onChange={(e) => {
                const idx = e.target.value === '' ? null : Number(e.target.value)
                setSelectedBankIndex(idx)
                if (idx == null) return
                const a = bankAccounts[idx]
                setIban(a?.iban || '')
                setBic(a?.bic || '')
                setTitulaire(a?.titulaire || '')
              }} className="rounded border-gray-200 px-2 py-1">
                <option value="">— Choisir un RIB —</option>
                {bankAccounts.map((b, i) => <option key={i} value={i}>{b.label}</option>)}
              </select>
              <button type="button" onClick={() => { setSelectedBankIndex(null); setIban(''); setBic(''); setTitulaire('') }} className="text-sm text-slate-600 px-2 py-1 rounded hover:bg-slate-100">Effacer</button>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Montant (€) <span className="text-red-600">*</span></label>
            <input type="number" value={montant ?? ''} onChange={(e) => { setMontant(e.target.value ? Number(e.target.value) : null); if (modePaiement === 'ACOMPTE') { const v = e.target.value ? Number(e.target.value) : 0; if (montantAcompte != null && Number(montantAcompte) >= v) setMontantAcompte(null) } }} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" required />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Mode de paiement</label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${modePaiement === 'INTEGRAL' ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="modePaiement" value="INTEGRAL" checked={modePaiement === 'INTEGRAL'} onChange={() => { setModePaiement('INTEGRAL'); setMontantAcompte(null); }} className="accent-[#1e3a5f]" />
                <span className="text-sm font-medium text-gray-800">Paiement intégral</span>
              </label>
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${modePaiement === 'ACOMPTE' ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="modePaiement" value="ACOMPTE" checked={modePaiement === 'ACOMPTE'} onChange={() => setModePaiement('ACOMPTE')} className="accent-[#1e3a5f]" />
                <span className="text-sm font-medium text-gray-800">Paiement avec acompte</span>
              </label>
            </div>
          </div>

          {modePaiement === 'ACOMPTE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Montant de l'acompte (€) <span className="text-red-600">*</span></label>
                <input type="number" value={montantAcompte ?? ''} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : null; setMontantAcompte(v); if (v != null && v >= total) { toast.error('L\'acompte doit être strictement inférieur au montant total.'); } }} className={`mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5 ${montantAcompte != null && (montantAcompte <= 0 || montantAcompte >= total) ? 'border-red-300' : ''}`} required />
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-[#f5f6f8] rounded-lg border border-gray-100 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Total</span>
                    <span className="font-semibold text-gray-800">{total.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Acompte</span>
                    <span className="font-semibold text-gray-800">{acompte.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200">
                    <span className="text-gray-700 font-semibold">Solde restant</span>
                    <span className="font-bold text-[#1e3a5f]">{solde.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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
            {modePaiement === 'ACOMPTE' && (
              <>
                <div className="text-sm">Acompte: <strong>{acompte.toLocaleString('fr-FR')} €</strong></div>
                <div className="text-sm">Solde restant: <strong>{solde.toLocaleString('fr-FR')} €</strong></div>
              </>
            )}
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
