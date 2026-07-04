"use client"

import React, { useEffect, useState } from 'react'
import AdminDossierList from './AdminDossierList'
import AdminDossierDetail from './AdminDossierDetail'
import { supabase } from '@/lib/supabase'
import { normalizeStatus, getStatusConfig, STATUS } from '@/lib/status'

function StatCard({ status, label, value }: { status?: any; label?: string; value: number }) {
  let cfg = null
  if (status) cfg = getStatusConfig(status)
  const displayLabel = label || cfg?.label || 'Stat'
  const badgeClasses = cfg?.badgeClass || 'bg-white text-gray-800'

  return (
    <div className={`rounded-lg p-4 shadow-sm min-w-35 ring-1 ring-inset bg-white`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{displayLabel}</div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClasses}`}>{value}</div>
      </div>
    </div>
  )
}

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <StatCard status={STATUS.EN_ATTENTE_PAIEMENT} value={counts.enAttente} />
        <StatCard status={STATUS.NOUVEAU} value={counts.nouveaux} />
        <StatCard status={STATUS.EN_COURS} value={counts.enCours} />
        <StatCard status={STATUS.TERMINE} value={counts.termines} />
      </div>

      <div>
        <AdminDossierList dossiers={dossiers} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setShowModal(true); }} />
      </div>

      {showModal && selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-4xl mx-4">
            <div className="bg-white rounded-lg shadow-lg overflow-auto max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="text-lg font-semibold text-gray-800">Dossier</div>
                <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-900">Fermer</button>
              </div>
              <div className="p-4">
                <AdminDossierDetail id={selectedId!} onUpdated={fetchDossiers} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
