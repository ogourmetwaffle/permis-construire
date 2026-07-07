"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import PremiumCard from '@/components/admin/PremiumCard'
import BankDetailsDialog from '@/components/admin/BankDetailsDialog'
import TarifEditDialog from '@/components/admin/TarifEditDialog'
import { Edit2 } from 'lucide-react'

type Param = { id?: number; cle: string; valeur: string }
type Tarif = { id?: number; type_client: string; type_projet: string; prix: number; actif?: boolean }

export default function AdminParametresPage() {
  const [params, setParams] = useState<Record<string, Param>>({})
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [editingTarifIndex, setEditingTarifIndex] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      // helper: fetch with 2 retries for transient Supabase/network errors
      const fetchWithRetry = async (url: string, options: RequestInit = {}, attempts = 2) => {
        let lastErr: any = null
        for (let i = 0; i <= attempts; i++) {
          try {
            const res = await fetch(url, options)
            // if server returned HTML (Cloudflare 5xx page), surface a clear error
            const ct = res.headers.get('content-type') || ''
            if (ct.includes('text/html')) {
              const text = await res.text()
              throw new Error('Supabase unreachable: HTML response')
            }
            return res
          } catch (e) {
            lastErr = e
            // small delay before retry
            if (i < attempts) await new Promise((r) => setTimeout(r, 600 * (i + 1)))
          }
        }
        throw lastErr
      }

      try {
        const [pRes, tRes] = await Promise.all([
          fetchWithRetry('/api/admin/parametres', { headers }),
          fetchWithRetry('/api/admin/tarifs', { headers }),
        ])

        const pJson = await pRes.json()
        const tJson = await tRes.json()

        const map: Record<string, Param> = {}
        if (pJson?.ok && Array.isArray(pJson.items)) {
          for (const it of pJson.items) map[it.cle] = it
        }
        setParams(map)

        if (tJson?.ok && Array.isArray(tJson.items)) setTarifs(tJson.items)
      } catch (err: any) {
        console.error('chargement parametres error', err)
        if (String(err?.message || '').toLowerCase().includes('supabase') || String(err || '').toLowerCase().includes('cloudflare') || String(err || '').includes('HTML')) {
          toast.error("Impossible de joindre Supabase — réessayez dans quelques instants.")
        } else {
          toast.error('Erreur lors du chargement')
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  const handleParamChange = (cle: string, value: string) => {
    setParams((s) => ({ ...s, [cle]: { ...(s[cle] || { cle }), valeur: value } }))
  }

  const handleTarifChange = (idx: number, prix: number) => {
    setTarifs((t) => t.map((row, i) => (i === idx ? { ...row, prix } : row)))
  }
  const saveParams = async (payload?: { cle: string; valeur: string }[]) => {
    setSaving(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    try {
      const body = payload ?? Object.values(params).map((p) => ({ cle: p.cle, valeur: p.valeur }))
      const res = await fetch('/api/admin/parametres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!j?.ok) throw new Error(j?.error || 'Erreur')
      toast.success('Paramètres sauvegardés')
      setSaving(false)
      return true
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la sauvegarde des paramètres')
      setSaving(false)
      return false
    }
  }

  const saveTarifs = async () => {
    // kept for compatibility but not used in UI: batch save
    setSaving(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    try {
      const payload = tarifs.map((t) => ({ id: t.id, prix: Number(t.prix), actif: t.actif ?? true }))
      const res = await fetch('/api/admin/tarifs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!j?.ok) throw new Error(j?.error || 'Erreur')
      toast.success('Tarifs sauvegardés')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la sauvegarde des tarifs')
    }
    setSaving(false)
  }

  // save a single tarif independently
  const saveSingleTarif = async (tarif: { id?: number; prix?: number }) => {
    setSaving(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token
    try {
      const payload = [{ id: tarif.id, prix: Number(tarif.prix) }]
      const res = await fetch('/api/admin/tarifs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!j?.ok) throw new Error(j?.error || 'Erreur')
      toast.success('Tarif mis à jour')
      setSaving(false)
      return true
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la sauvegarde du tarif')
      setSaving(false)
      return false
    }
  }


  if (loading) return <div>Chargement...</div>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Bank card - prominent */}
        <PremiumCard
          title="Coordonnées bancaires"
          subtitle="Modifier IBAN et titulaire utilisés pour les virements."
          accent={
            <button
              onClick={() => setShowBankDialog(true)}
              disabled={saving}
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:bg-slate-100 px-2 py-1 rounded"
            >
              {saving ? (
                <svg className="w-4 h-4 animate-spin text-slate-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : null}
              {saving ? 'Enregistrement…' : 'Modifier'}
            </button>
          }
          className="rounded-3xl shadow-2xl"
        >
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50">
              <div className="text-xs text-slate-500">Titulaire</div>
              <div className="mt-2 text-lg font-medium text-slate-800">{params['titulaire']?.valeur || <span className="text-slate-400">—</span>}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50">
              <div className="text-xs text-slate-500">IBAN</div>
              <div className="mt-2 text-lg font-medium tracking-wider text-slate-800">{params['iban']?.valeur || <span className="text-slate-400">Non renseigné</span>}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50">
              <div className="text-xs text-slate-500">BIC</div>
              <div className="mt-2 text-lg font-medium text-slate-800">{params['bic']?.valeur || <span className="text-slate-400">—</span>}</div>
            </div>
          </div>
        </PremiumCard>
        <BankDetailsDialog
          open={Boolean(showBankDialog)}
          onClose={() => setShowBankDialog(false)}
          initial={{ iban: params['iban']?.valeur, bic: params['bic']?.valeur, titulaire: params['titulaire']?.valeur }}
          onSave={async (values) => {
            // call API first, update local state only on success to avoid flicker
            const payload = [
              { cle: 'iban', valeur: values.iban || '' },
              { cle: 'bic', valeur: values.bic || '' },
              { cle: 'titulaire', valeur: values.titulaire || '' },
            ]
            const ok = await saveParams(payload)
            if (ok) {
              handleParamChange('iban', values.iban || '')
              handleParamChange('bic', values.bic || '')
              handleParamChange('titulaire', values.titulaire || '')
            }
            return ok
          }}
        />

        {/* Tarifs cards */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Tarifs</h2>
            <p className="text-sm text-slate-500">Modifiez les prix affichés publiquement.</p>
          </div>

          {/* Desktop/table view */}
          <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-sm text-slate-500 border-b">
                  <th className="px-4 py-3 text-left">Type de projet</th>
                  <th className="px-4 py-3 text-left">Type de client</th>
                  <th className="px-4 py-3 text-left">Prix</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {tarifs.map((t, i) => (
                  <tr key={t.id || `${t.type_client}-${t.type_projet}`} className="text-sm border-b last:border-b-0">
                    <td className="px-4 py-3">{t.type_projet}</td>
                    <td className="px-4 py-3">{t.type_client}</td>
                    <td className="px-4 py-3">€ {t.prix ?? 0}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setEditingTarifIndex(i)} className="inline-flex items-center gap-2 px-2 py-1 rounded text-sm text-slate-600 hover:bg-slate-100">
                        <Edit2 size={16} /> Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list view */}
          <div className="sm:hidden space-y-3">
            {tarifs.map((t, i) => (
              <div key={t.id || `${t.type_client}-${t.type_projet}`} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                <div>
                  <div className="text-sm font-medium">{t.type_projet}</div>
                  <div className="text-xs text-slate-500">{t.type_client}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">€ {t.prix ?? 0}</div>
                  <button onClick={() => setEditingTarifIndex(i)} className="mt-1 inline-flex items-center gap-2 px-2 py-1 rounded text-sm text-slate-600 hover:bg-slate-100">
                    <Edit2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <TarifEditDialog
            open={editingTarifIndex !== null}
            onClose={() => setEditingTarifIndex(null)}
            initial={{ prix: editingTarifIndex !== null ? tarifs[editingTarifIndex]?.prix : 0 }}
            onSave={async (values) => {
              if (editingTarifIndex === null) return false
              const idx = editingTarifIndex
              const t = tarifs[idx]
              const ok = await saveSingleTarif({ id: t.id, prix: values.prix })
              if (ok) {
                // update local state
                setTarifs((s) => s.map((row, i) => (i === idx ? { ...row, prix: values.prix } : row)))
              }
              return ok
            }}
          />
        </div>
      </div>
    </div>
  )
}
