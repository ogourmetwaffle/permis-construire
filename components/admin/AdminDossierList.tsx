"use client"

import React, { useEffect, useState } from 'react'
import AdminDossierRow from './AdminDossierRow'
import AdminDossierDetail from './AdminDossierDetail'
import Modal from './Modal'
import { supabase } from '@/lib/supabase'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  email?: string
  statut?: string
}

export default function AdminDossierList({ dossiers: propDossiers, selectedId, onSelect }: { dossiers?: Dossier[]; selectedId?: string; onSelect?: (id: string) => void }) {
  const [localDossiers, setLocalDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Tous')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchDossiers = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('dossiers').select('*').order('created_at', { ascending: false })
    if (error) console.error('supabase fetch dossiers', error)
    setLocalDossiers(((data) as unknown) as Dossier[] || [])
    setLoading(false)
  }

  useEffect(() => {
    // If parent passed dossiers, initialize local state from it so we can refresh locally
    if (propDossiers) {
      setLocalDossiers(propDossiers)
      return
    }
    fetchDossiers()
  }, [propDossiers])

  // Always render from localDossiers so fetchDossiers updates are visible
  const sourceDossiers = localDossiers

  const filtered = sourceDossiers.filter((d) => {
    if (filter !== 'Tous') {
      if (filter === 'Nouveau' && d.statut !== 'NOUVEAU') return false
      if (filter === 'En cours' && d.statut !== 'EN_COURS') return false
      if (filter === 'Terminé' && d.statut !== 'COMPLET') return false
      if (filter === 'Refusé' && d.statut !== 'REFUSE') return false
    }
    if (!query) return true
    const q = query.toLowerCase()
    return `${d.numero_dossier}`.toLowerCase().includes(q) || `${d.nom}`.toLowerCase().includes(q) || `${d.prenom}`.toLowerCase().includes(q) || `${d.email}`.toLowerCase().includes(q)
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedId ?? null)

  const handleOpen = (id: string) => {
    if (onSelect) return onSelect(id)
    setLocalSelectedId(id)
  }

  const handleClose = async () => {
    // Refresh the list when closing the modal so the panel reflects updates
    try {
      await fetchDossiers()
    } catch (e) {
      console.error('error refreshing dossiers on modal close', e)
    }
    setLocalSelectedId(null)
  }

  // reset to first page when filters change
  React.useEffect(() => {
    setPage(1)
  }, [query, filter, pageSize, propDossiers, localDossiers])

  return (
    <div className="bg-white rounded-md shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Liste des dossiers</h2>
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="border rounded px-2 py-1 text-sm" placeholder="Rechercher par nom, email, numéro" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option>Tous</option>
              <option>Nouveau</option>
              <option>En cours</option>
              <option>Terminé</option>
              <option>Refusé</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div className="hidden md:grid text-xs text-gray-500 px-3 py-2 border-b" style={{ gridTemplateColumns: '220px 1fr 120px 110px 120px 120px 80px' }}>
          <div className="">Numéro dossier</div>
          <div className="">Client</div>
          <div className="">Pays</div>
          <div className="">Paiement</div>
          <div className="">Statut</div>
          <div className="">Date dépôt</div>
          <div className="">Actions</div>
        </div>

        <div>
          {loading && <div className="p-4 text-sm text-gray-500">Chargement...</div>}
          {!loading && paginated.map((d) => (
            <AdminDossierRow key={d.id} dossier={d} onOpen={handleOpen} selectedId={selectedId ?? localSelectedId ?? undefined} />
          ))}
          {!loading && filtered.length === 0 && <div className="p-4 text-sm text-gray-500">Aucun dossier trouvé.</div>}
        </div>

        <div className="p-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div>Afficher</div>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <div>sur {total} résultats</div>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded text-sm">Préc</button>
            <div className="text-sm">
              Page {page} / {totalPages}
            </div>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded text-sm">Suiv</button>
          </div>
        </div>
      </div>
      {localSelectedId && (
        <Modal open={true} onClose={handleClose} title={`Détails dossier`}>
          <AdminDossierDetail id={localSelectedId} onUpdated={fetchDossiers} />
        </Modal>
      )}
    </div>
  )
}
