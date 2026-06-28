"use client"

import React, { useEffect, useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminDossierList from './AdminDossierList'
import AdminDossierDetail from './AdminDossierDetail'
import { supabase } from '@/lib/supabase'

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'amber' | 'blue' | 'emerald' | 'red' }) {
  const toneClasses: Record<string, string> = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    blue: 'bg-blue-50 text-blue-800 ring-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    red: 'bg-red-50 text-red-700 ring-red-100'
  }
  const toneClass = tone ? toneClasses[tone] : 'bg-white text-gray-800'

  return (
    <div className={`rounded-lg p-4 shadow-sm min-w-35 ring-1 ring-inset ${tone ? 'bg-white' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${tone ? toneClasses[tone] : ''}`}>{value}</div>
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
    const { data, error } = await supabase.from('dossiers').select('*').order('created_at', { ascending: false })
    if (error) console.error('fetch dossiers', error)
    setDossiers(data || [])
  }

  useEffect(() => {
    fetchDossiers()
  }, [])

  const counts = {
    nouveaux: dossiers.filter(d => d.statut === 'NOUVEAU').length,
    enCours: dossiers.filter(d => d.statut === 'EN_COURS').length,
    termines: dossiers.filter(d => d.statut === 'COMPLET').length,
    refuses: dossiers.filter(d => d.statut === 'REFUSE').length,
  }

  return (
    <div className="min-h-screen" style={{ background: '#F8FAFC' }}>
      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              <StatCard label="Nouveaux" value={counts.nouveaux} tone="amber" />
              <StatCard label="En cours" value={counts.enCours} tone="blue" />
              <StatCard label="Terminés" value={counts.termines} tone="emerald" />
              <StatCard label="Refusés" value={counts.refuses} tone="red" />
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
        </div>
      </div>
    </div>
  )
}
