"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  email: string
  telephone?: string
  pays_permis?: string
  statut?: string
  created_at?: string
}

export default function AdminDossierList() {
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchDossiers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('dossiers').select('*').order('created_at', { ascending: false })
    setLoading(false)
    if (error) {
      console.error(error)
      return
    }
    setDossiers(data || [])
  }

  useEffect(() => {
    const run = async () => {
      await fetchDossiers()
    }
    run()
  }, [])

  const updateStatus = async (id: string, statut: string) => {
    const { error } = await supabase.from('dossiers').update({ statut }).eq('id', id)
    if (error) {
      alert('Erreur: ' + error.message)
      return
    }
    fetchDossiers()
  }

  const filtered = dossiers.filter((d) => {
    const q = filter.toLowerCase()
    const matchQ = !q || d.nom.toLowerCase().includes(q) || d.prenom.toLowerCase().includes(q) || d.numero_dossier.toLowerCase().includes(q)
    const matchStatus = !statusFilter || d.statut === statusFilter
    return matchQ && matchStatus
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input placeholder="Rechercher par nom, prenom, numéro" className="border p-2 flex-1" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <select className="border p-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous statuts</option>
          <option value="NOUVEAU">NOUVEAU</option>
          <option value="PAYE">PAYE</option>
          <option value="CONTACTE">CONTACTE</option>
          <option value="EN_COURS">EN_COURS</option>
          <option value="COMPLET">COMPLET</option>
          <option value="TERMINE">TERMINE</option>
          <option value="REFUSE">REFUSE</option>
        </select>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-2">#</th>
                <th className="p-2">Nom</th>
                <th className="p-2">Email</th>
                <th className="p-2">Pays permis</th>
                <th className="p-2">Statut</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-2">{d.numero_dossier}</td>
                  <td className="p-2">{d.nom} {d.prenom}</td>
                  <td className="p-2">{d.email}</td>
                  <td className="p-2">{d.pays_permis}</td>
                  <td className="p-2">{d.statut || 'NOUVEAU'}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 bg-blue-600 text-white rounded text-sm" onClick={() => updateStatus(d.id, 'EN_COURS')}>EN_COURS</button>
                      <button className="px-2 py-1 bg-green-600 text-white rounded text-sm" onClick={() => updateStatus(d.id, 'COMPLET')}>COMPLET</button>
                      <button className="px-2 py-1 bg-red-600 text-white rounded text-sm" onClick={() => updateStatus(d.id, 'REFUSE')}>REFUSE</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
