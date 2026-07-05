import React, { useEffect, useState } from 'react'
import AdminDossierRow from './AdminDossierRow'
import AdminDossierDetail from './AdminDossierDetail'
import Modal from './Modal'
import { supabase } from '@/lib/supabase'
import { STATUS_ORDER, getStatusConfig, normalizeStatus } from '@/lib/status'

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
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const fetchDossiers = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) {
        console.error('No session token')
        setLocalDossiers([])
        setLoading(false)
        return
      }

      const res = await fetch('/api/admin/dossiers', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.status === 401) {
        // Let the parent page handle redirect; clear list
        console.error('Unauthorized when fetching dossiers')
        setLocalDossiers([])
        setLoading(false)
        return
      }

      const json = await res.json()
      if (!json.ok) {
        console.error('api admin dossiers error', json.error)
        setLocalDossiers([])
        setLoading(false)
        return
      }

      setLocalDossiers((json.data as Dossier[]) || [])
    } catch (err) {
      console.error('fetchDossiers error', err)
      setLocalDossiers([])
    }
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
    if (filter) {
      if (normalizeStatus(d.statut) !== filter) return false
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-800">Liste des dossiers</h2>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
              placeholder="Nom, email, numéro…"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
            >
              <option value="">Tous les statuts</option>
              {STATUS_ORDER.map((s) => {
                const cfg = getStatusConfig(s)
                return <option key={s} value={s}>{cfg?.label || s}</option>
              })}
            </select>
          </div>
        </div>
      </div>

      <div>
        <div className="hidden md:grid text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2 border-b border-slate-100 bg-slate-50/60" style={{ gridTemplateColumns: '220px 1fr 120px 110px 140px 140px 96px' }}>
          <div className="text-left">Numéro dossier</div>
          <div className="text-left">Client</div>
          <div className="text-left">Pays</div>
          <div className="text-center">Paiement</div>
          <div className="text-center">Statut</div>
          <div className="text-left">Date dépôt</div>
          <div className="text-center">Actions</div>
        </div>

        <div>
          {loading && <div className="p-8 text-sm text-slate-400 text-center">Chargement...</div>}
          {!loading && paginated.map((d) => (
            <AdminDossierRow key={d.id} dossier={d} onOpen={handleOpen} selectedId={selectedId ?? localSelectedId ?? undefined} />
          ))}
          {!loading && filtered.length === 0 && (
            <div className="p-10 text-center">
              <div className="text-3xl mb-2">📂</div>
              <div className="text-sm text-slate-400">Aucun dossier trouvé.</div>
            </div>
          )}
        </div>

        <div className="px-5 py-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-b-xl">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Afficher</span>
            <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>sur <strong className="text-slate-700">{total}</strong> résultats</span>
          </div>

          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Préc</button>
            <span className="text-sm text-slate-500 px-1">Page {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Suiv →</button>
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
