"use client"

import React, { useEffect, useState } from 'react'
import AdminDossierList from './AdminDossierList'
import AdminDossierDetail from './AdminDossierDetail'
import { supabase } from '@/lib/supabase'
import { normalizeStatus, getStatusConfig, STATUS } from '@/lib/status'

const STAT_STYLES: Record<string, { bg: string; iconBg: string; iconColor: string; icon: string }> = {
  en_attente_paiement: { bg: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', icon: '💳' },
  nouveau:             { bg: 'from-blue-50 to-indigo-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', icon: '📋' },
  en_cours:            { bg: 'from-indigo-50 to-violet-50', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', icon: '⚡' },
  termine:             { bg: 'from-emerald-50 to-green-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', icon: '✅' },
  refuse:              { bg: 'from-red-50 to-rose-50', iconBg: 'bg-red-100', iconColor: 'text-red-500', icon: '✕' },
}

function StatCard({ status, label, value }: { status?: string; label?: string; value: number }) {
  const cfg = status ? getStatusConfig(status) : null
  const displayLabel = label || cfg?.label || 'Stat'
  const style = status ? (STAT_STYLES[status] ?? STAT_STYLES.nouveau) : { bg: 'from-slate-50 to-gray-50', iconBg: 'bg-slate-100', iconColor: 'text-slate-600', icon: '📊' }

  return (
    <div className={`bg-linear-to-br ${style.bg} rounded-xl p-5 flex-1 min-w-35 shadow-sm border border-white`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{displayLabel}</div>
          <div className="text-3xl font-bold text-slate-800 mt-1">{value}</div>
        </div>
        <div className={`${style.iconBg} ${style.iconColor} w-10 h-10 rounded-xl flex items-center justify-center text-lg`}>
          {style.icon}
        </div>
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
      <div className="flex gap-4 mb-6 flex-wrap">
        <StatCard status={STATUS.EN_ATTENTE_PAIEMENT} value={counts.enAttente} />
        <StatCard status={STATUS.NOUVEAU} value={counts.nouveaux} />
        <StatCard status={STATUS.EN_COURS} value={counts.enCours} />
        <StatCard status={STATUS.TERMINE} value={counts.termines} />
        <StatCard status={STATUS.REFUSE} value={counts.refuses} />
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
