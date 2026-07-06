"use client"

import React, { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = {
  open: boolean
  onClose: () => void
  dossier: any
  section: 'client' | 'project'
  onSaved: (updated: any) => void
}

export default function EditDossierDialog({ open, onClose, dossier, section, onSaved }: Props) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // form state
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (!dossier) return
    setError(null)
    setSaving(false)
    // initialize form with permitted fields depending on section
    if (section === 'client') {
      setForm({ nom: dossier.nom || '', prenom: dossier.prenom || '', email: dossier.email || '', telephone: dossier.telephone || '', adresse_client: dossier.adresse_client || '' })
    } else {
      setForm({ type_projet: dossier.type_projet || '', adresse_projet: dossier.adresse_projet || '', surface: dossier.surface ?? '', numero_parcelle: dossier.numero_parcelle || '', description: dossier.description || '' })
    }
  }, [dossier, section])

  if (!open) return null

  const handleChange = (key: string, value: any) => setForm((s: any) => ({ ...s, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) throw new Error('No session')

      // call PATCH API
      const resp = await fetch(`/api/admin/dossiers/${encodeURIComponent(String(dossier.id ?? dossier.numero_dossier))}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, values: form }),
      })
      const json = await resp.json()
      if (!resp.ok) {
        setError(json?.error || 'Erreur lors de la mise à jour')
        setSaving(false)
        return
      }
      // success
      onSaved(json.data)
      onClose()
    } catch (err: any) {
      console.error('save dossier', err)
      setError(err?.message || 'Erreur réseau')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={handleSubmit} role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto p-4 sm:p-6 z-10">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base font-semibold">Modifier {section === 'client' ? 'Informations client' : 'Projet'}</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-md"><X size={16} /></button>
        </div>

        <div className="space-y-3">
          {section === 'client' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Nom</label>
                <input value={form.nom} onChange={e => handleChange('nom', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Prénom</label>
                <input value={form.prenom} onChange={e => handleChange('prenom', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Email</label>
                <input value={form.email} onChange={e => handleChange('email', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Téléphone</label>
                <input value={form.telephone} onChange={e => handleChange('telephone', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500">Adresse client</label>
                <input value={form.adresse_client} onChange={e => handleChange('adresse_client', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-gray-500">Type de projet</label>
                <input value={form.type_projet} onChange={e => handleChange('type_projet', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Adresse du projet</label>
                <input value={form.adresse_projet} onChange={e => handleChange('adresse_projet', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Surface (m²)</label>
                  <input type="number" value={form.surface} onChange={e => handleChange('surface', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">N° parcelle</label>
                  <input value={form.numero_parcelle} onChange={e => handleChange('numero_parcelle', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Description</label>
                <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="mt-1 block w-full rounded border-gray-200 shadow-sm px-2 py-1.5" rows={4} />
              </div>
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
