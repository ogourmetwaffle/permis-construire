"use client"

import React, { useEffect, useState } from 'react'
import AdminDossierList from './AdminDossierList'
import AdminStats from './AdminStats'
import StorageCard from './StorageCard'
import { supabase } from '@/lib/supabase'
import { normalizeStatus, STATUS } from '@/lib/status'

export default function AdminPanel() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dossiers, setDossiers] = useState<any[]>([])

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
    // consider 'À compléter' (INFORMATIONS_MANQUANTES) as part of 'En cours' for dashboard totals
    enCours: dossiers.filter(d => {
      const s = normalizeStatus(d.statut)
      return s === STATUS.EN_COURS || s === STATUS.INFORMATIONS_MANQUANTES
    }).length,
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
        <AdminDossierList dossiers={dossiers} />
      </div>
    </div>
  )
}
