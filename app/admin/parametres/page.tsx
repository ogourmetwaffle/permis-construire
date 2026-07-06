"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

type Param = { id?: number; cle: string; valeur: string }
type Tarif = { id?: number; type_client: string; type_projet: string; prix: number; actif?: boolean }

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl shadow-xl p-6">{children}</div>
}

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Coordonnées bancaires</h2>
              <p className="text-sm text-slate-500">IBAN, BIC et titulaire du compte utilisé pour les virements.</p>
            </div>
            <div className="text-sm text-slate-400">Sécurisé</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-600">IBAN</label>
              <input type="text" value={params['iban']?.valeur || ''} onChange={(e) => handleParamChange('iban', e.target.value)} className="mt-1 border rounded-lg px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">BIC</label>
              <input type="text" value={params['bic']?.valeur || ''} onChange={(e) => handleParamChange('bic', e.target.value)} className="mt-1 border rounded-lg px-3 py-2 w-full" />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Titulaire</label>
              <input type="text" value={params['titulaire']?.valeur || ''} onChange={(e) => handleParamChange('titulaire', e.target.value)} className="mt-1 border rounded-lg px-3 py-2 w-full" />
            </div>
          </div>

            <div className="mt-6 flex justify-end">
            <button disabled={saving} onClick={saveParams} className="inline-flex items-center gap-2 bg-linear-to-r from-[#173B8C] to-[#2E5FC1] text-white font-medium px-6 py-2 rounded-full shadow-lg disabled:opacity-60">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Tarifs</h2>
              <p className="text-sm text-slate-500">Prix affichés pour les particuliers et professionnels.</p>
            </div>
            <div className="text-sm text-slate-400">Modifiable</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 text-sm text-slate-600">Client</th>
                  <th className="py-2 text-sm text-slate-600">Projet</th>
                  <th className="py-2 text-sm text-slate-600">Prix (€)</th>
                </tr>
              </thead>
              <tbody>
                {tarifs.map((t, i) => (
                  <tr key={t.id || `${t.type_client}-${t.type_projet}`} className="border-t">
                    <td className="py-3">{t.type_client}</td>
                    <td className="py-3">{t.type_projet}</td>
                    <td className="py-3">
                      <input type="number" value={t.prix ?? 0} onChange={(e) => handleTarifChange(i, Number(e.target.value))} className="border rounded-lg px-3 py-2 w-32" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button disabled={saving} onClick={saveTarifs} className="inline-flex items-center gap-2 bg-linear-to-r from-[#173B8C] to-[#2E5FC1] text-white font-medium px-6 py-2 rounded-full shadow-lg disabled:opacity-60">
              {saving ? 'Sauvegarde...' : 'Sauvegarder les tarifs'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
