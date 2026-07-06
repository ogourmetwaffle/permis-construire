"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

type Param = { id?: number; cle: string; valeur: string }
type Tarif = { id?: number; type_client: string; type_projet: string; prix: number; actif?: boolean }

export default function AdminParametresPage() {
  const [params, setParams] = useState<Record<string, Param>>({})
  const [tarifs, setTarifs] = useState<Tarif[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData?.session?.access_token

      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      try {
        const [pRes, tRes] = await Promise.all([
          fetch('/api/admin/parametres', { headers }),
          fetch('/api/admin/tarifs', { headers }),
        ])

        const pJson = await pRes.json()
        const tJson = await tRes.json()

        const map: Record<string, Param> = {}
        if (pJson?.ok && Array.isArray(pJson.items)) {
          for (const it of pJson.items) map[it.cle] = it
        }
        setParams(map)

        if (tJson?.ok && Array.isArray(tJson.items)) setTarifs(tJson.items)
      } catch (err) {
        console.error(err)
        toast.error('Erreur lors du chargement')
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

  const saveParams = async () => {
    setSaving(true)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData?.session?.access_token

    try {
      const payload = Object.values(params).map((p) => ({ cle: p.cle, valeur: p.valeur }))
      const res = await fetch('/api/admin/parametres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify(payload),
      })
      const j = await res.json()
      if (!j?.ok) throw new Error(j?.error || 'Erreur')
      toast.success('Paramètres sauvegardés')
    } catch (err) {
      console.error(err)
      toast.error('Erreur lors de la sauvegarde des paramètres')
    }
    setSaving(false)
  }

  const saveTarifs = async () => {
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

  if (loading) return <div>Chargement...</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Bank card - prominent */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-linear-to-r from-[#0f2b66] to-[#173B8C] opacity-95" />
          <div className="relative p-8 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Coordonnées bancaires</h2>
                <p className="mt-1 text-sm text-white/80">Modifier IBAN et titulaire utilisés pour les virements.</p>
              </div>
              <div className="text-sm text-white/80">Sécurisé</div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/6 p-4 rounded-xl">
                <div className="text-xs text-white/70">IBAN</div>
                <div className="mt-2 text-lg font-medium tracking-wider">{params['iban']?.valeur || <span className="text-white/60">Non renseigné</span>}</div>
                <input aria-label="IBAN" type="text" value={params['iban']?.valeur || ''} onChange={(e) => handleParamChange('iban', e.target.value)} className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="bg-white/6 p-4 rounded-xl">
                <div className="text-xs text-white/70">BIC</div>
                <div className="mt-2 text-lg font-medium">{params['bic']?.valeur || <span className="text-white/60">—</span>}</div>
                <input aria-label="BIC" type="text" value={params['bic']?.valeur || ''} onChange={(e) => handleParamChange('bic', e.target.value)} className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>

              <div className="bg-white/6 p-4 rounded-xl">
                <div className="text-xs text-white/70">Titulaire</div>
                <div className="mt-2 text-lg font-medium">{params['titulaire']?.valeur || <span className="text-white/60">—</span>}</div>
                <input aria-label="Titulaire" type="text" value={params['titulaire']?.valeur || ''} onChange={(e) => handleParamChange('titulaire', e.target.value)} className="mt-3 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white" />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button disabled={saving} onClick={saveParams} className="inline-flex items-center gap-2 bg-white text-[#0f2b66] font-semibold px-6 py-2 rounded-full shadow-md disabled:opacity-60">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>

        {/* Tarifs cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Tarifs</h2>
              <p className="text-sm text-slate-500">Modifiez les prix affichés publiquement.</p>
            </div>
            <div>
              <button disabled={saving} onClick={saveTarifs} className="inline-flex items-center gap-2 bg-linear-to-r from-[#173B8C] to-[#2E5FC1] text-white font-medium px-4 py-2 rounded-full shadow-lg disabled:opacity-60">
                {saving ? 'Sauvegarde...' : 'Sauvegarder les tarifs'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tarifs.map((t, i) => (
              <div key={t.id || `${t.type_client}-${t.type_projet}`} className="transform hover:-translate-y-1 transition rounded-2xl shadow-lg p-5 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">{t.type_client}</div>
                    <div className="text-base font-semibold mt-1">{t.type_projet}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">Prix</div>
                    <div className="text-2xl font-bold mt-1">€
                      <input aria-label={`Prix ${t.type_client} ${t.type_projet}`} type="number" value={t.prix ?? 0} onChange={(e) => handleTarifChange(i, Number(e.target.value))} className="ml-2 w-24 text-right text-2xl font-bold border-none outline-none" />
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-500">Visible pour {t.type_client.toLowerCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
