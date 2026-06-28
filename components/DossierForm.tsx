"use client"

import React, { useState } from 'react'
import FileUpload from './FileUpload'
import Button from '@/components/Button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DossierForm() {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', pays_permis: '' })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const inputClass = 'border border-gray-200 rounded-md px-3 py-2 w-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const newErrors: Record<string,string> = {}
      if (!form.nom) newErrors.nom = 'Nom requis'
      if (!form.prenom) newErrors.prenom = 'Prénom requis'
      if (!form.email) newErrors.email = 'Email requis'
      if (!form.telephone) newErrors.telephone = 'Téléphone requis'
      if (!form.pays_permis) newErrors.pays_permis = 'Pays requis'
      if (uploadedFiles.length === 0) newErrors.files = 'Ajoutez au moins un document'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        setLoading(false)
        return
      }

      const numeroDossier = 'PE-' + Date.now()

      const { data: dossierData, error: insertError } = await supabase
        .from('dossiers')
        .insert({
          numero_dossier: numeroDossier,
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          telephone: form.telephone,
          pays_permis: form.pays_permis,
          statut: 'NOUVEAU',
          montant: 49,
          paiement_effectue: false
        })
        .select()
        .single()

      if (insertError || !dossierData) {
        console.error(insertError)
        setErrors({ form: 'Erreur lors de la création du dossier' })
        setLoading(false)
        return
      }

      const dossierId = (dossierData as { id: number }).id

      for (const f of uploadedFiles) {
        try {
          const baseName = f.name.replace(/[^a-z0-9.\-_.]/gi, '_')
          const path = `${numeroDossier}/${Date.now()}_${baseName}`
          // Supabase expects a File or Blob in browser
          await supabase.storage.from('documents').upload(path, f, { contentType: f.type, upsert: false })
        } catch (err) {
          console.error('upload', err)
        }
      }

      const resp = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: numeroDossier, dossierId })
      })
      const json = await resp.json()
      if (json?.url) window.location.href = json.url
      else router.push(`/merci?numero=${encodeURIComponent(numeroDossier)}`)
    } catch (err) {
      console.error(err)
      setErrors({ form: 'Erreur lors de la création du dossier' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="min-h-[calc(100vh-120px)] flex items-center justify-center">
      <div className="w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <h3 className="text-base font-semibold text-[#173B8C] mb-2">Informations personnelles</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs">Nom <span className="text-red-600">*</span></label>
                <input name="nom" value={form.nom} onChange={handleChange} className={inputClass} placeholder="Nom" />
                {errors.nom && <div className="text-xs text-red-600">{errors.nom}</div>}
              </div>
              <div>
                <label className="text-xs">Prénom <span className="text-red-600">*</span></label>
                <input name="prenom" value={form.prenom} onChange={handleChange} className={inputClass} placeholder="Prénom" />
                {errors.prenom && <div className="text-xs text-red-600">{errors.prenom}</div>}
              </div>
              <div>
                <label className="text-xs">Email <span className="text-red-600">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} placeholder="exemple@email.com" />
                {errors.email && <div className="text-xs text-red-600">{errors.email}</div>}
              </div>
              <div>
                <label className="text-xs">Téléphone <span className="text-red-600">*</span></label>
                <input name="telephone" value={form.telephone} onChange={handleChange} className={inputClass} placeholder="06 12 34 56 78" />
                {errors.telephone && <div className="text-xs text-red-600">{errors.telephone}</div>}
              </div>
              <div>
                <label className="text-xs">Pays du permis <span className="text-red-600">*</span></label>
                <select name="pays_permis" value={form.pays_permis} onChange={handleChange} className={inputClass}>
                  <option value="">Sélectionnez le pays</option>
                  <option>Maroc</option>
                  <option>Algérie</option>
                  <option>Tunisie</option>
                  <option>Autre</option>
                </select>
                {errors.pays_permis && <div className="text-xs text-red-600">{errors.pays_permis}</div>}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">🔒 Vos informations restent confidentielles.</div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
            <h3 className="text-base font-semibold text-[#173B8C] mb-2">Documents</h3>
            <FileUpload onFilesChange={(f: File[]) => setUploadedFiles(f)} />
            {errors.files && <div className="text-xs text-red-600 mt-2">{errors.files}</div>}
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#173B8C] mb-2">Votre dossier</h3>
              <div className="text-2xl font-extrabold text-[#173B8C] mb-2">49€</div>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                <li>✓ Vérification du dossier</li>
                <li>✓ Assistance personnalisée</li>
                <li>✓ Réponse rapide</li>
                <li>✓ Traitement sécurisé</li>
              </ul>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-2">🔒 Paiement sécurisé Stripe</div>
              <Button type="submit" loading={loading} className="w-full bg-[#E30613] hover:bg-red-700 text-white text-sm py-3">Payer et déposer mon dossier</Button>
              <div className="mt-2 text-center text-xs text-gray-500">Visa • Mastercard • Stripe</div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
