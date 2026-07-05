"use client"

import React, { useEffect, useState } from 'react'
import AdminDossierList from './AdminDossierList'
import AdminDossierDetail from './AdminDossierDetail'
import AdminStats from './AdminStats'
import StorageCard from './StorageCard'
import { supabase } from '@/lib/supabase'
import { normalizeStatus, getStatusConfig, STATUS } from '@/lib/status'

export default function AdminPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dossiers, setDossiers] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [showModal, setShowModal] = useState(false)

  const fetchDossiers = async () => {
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) {
        console.error('No session token')
        setDossiers([])
        return
      }
      const res = await fetch('/api/admin/dossiers', { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401) {
        console.error('Unauthorized when fetching dossiers')
        setDossiers([])
        return
      }
      const json = await res.json()
      if (!json.ok) {
        console.error('api admin dossiers error', json.error)
        setDossiers([])
        return
      }
      setDossiers(json.data || [])
    } catch (err) {
      console.error('fetch dossiers', err)
      setDossiers([])
    }
  }

  useEffect(() => {
    fetchDossiers()
  }, [])

  const counts = {
    enAttente: dossiers.filter(d => normalizeStatus(d.statut) === STATUS.EN_ATTENTE_PAIEMENT).length,
    nouveaux: dossiers.filter(d => normalizeStatus(d.statut) === STATUS.NOUVEAU).length,
    enCours: dossiers.filter(d => normalizeStatus(d.statut) === STATUS.EN_COURS).length,
    termines: dossiers.filter(d => normalizeStatus(d.statut) === STATUS.TERMINE).length,
    refuses: dossiers.filter(d => normalizeStatus(d.statut) === STATUS.REFUSE).length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <AdminStats counts={{ total: dossiers.length, nouveaux: counts.nouveaux, enAttente: counts.enAttente, enCours: counts.enCours, termines: counts.termines }} />
          <StorageCard />
        </div>
      </div>

      <div>
        <AdminDossierList dossiers={dossiers} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setShowModal(true); }} />
      </div>

      {showModal && selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-4xl">
            <div className="bg-white rounded-2xl shadow-2xl overflow-auto max-h-[90vh]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="text-base font-semibold text-slate-800">Détail du dossier</div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-700 text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Fermer
                </button>
              </div>
              <div className="p-6">
                <AdminDossierDetail id={selectedId!} onUpdated={fetchDossiers} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
