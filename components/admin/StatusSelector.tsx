"use client"

import React, { useState } from 'react'
import { CheckCircle, XCircle, Clock, Circle } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function StatusSelector({ currentStatus, dossierId, onUpdated }: { currentStatus?: string; dossierId: string; onUpdated?: () => void }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const updateStatus = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/update-statut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId, statut: status })
      })
      const json = await resp.json()
      if (!resp.ok) {
        console.error('update statut api', json)
        toast.error('Erreur lors de la mise à jour')
      } else {
        toast.success('Statut mis à jour')
        // notify parent to refresh list/dashboard
        onUpdated?.()
      }
    } catch (err) {
      console.error(err)
      toast.error('Erreur réseau')
    }
    setLoading(false)
    // no local message; using toast for feedback
  }

  return (
    <div className="space-y-3">
      <div className="text-sm">Statut actuel: <span className="ml-2">{renderBadge(status)}</span></div>
      <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-2 py-1 w-full">
        <option value="NOUVEAU">Nouveau</option>
        <option value="EN_COURS">En cours</option>
        <option value="COMPLET">Terminé</option>
        <option value="REFUSE">Refusé</option>
      </select>
      <button type="button" onClick={updateStatus} disabled={loading} className="w-full bg-[#173B8C] text-white py-2 rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Mise à jour...' : 'Mettre à jour'}</button>
    </div>
  )
}

function renderBadge(status?: string) {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ring-1 ring-inset'
  if (status === 'NOUVEAU' || !status) return (
    <span role="status" aria-label="Nouveau" title="Nouveau" className={`${base} bg-orange-50 text-orange-700 ring-orange-100`}> 
      <Circle size={12} className="mr-2" />Nouveau
    </span>
  )
  if (status === 'EN_COURS') return (
    <span role="status" aria-label="En cours" title="En cours" className={`${base} bg-blue-50 text-blue-800 ring-blue-100`}> 
      <Clock size={12} className="mr-2" />En cours
    </span>
  )
  if (status === 'COMPLET') return (
    <span role="status" aria-label="Terminé" title="Terminé" className={`${base} bg-emerald-50 text-emerald-700 ring-emerald-100`}> 
      <CheckCircle size={12} className="mr-2" />Terminé
    </span>
  )
  return (
    <span role="status" aria-label="Refusé" title="Refusé" className={`${base} bg-red-50 text-red-700 ring-red-100`}> 
      <XCircle size={12} className="mr-2" />Refusé
    </span>
  )
}
