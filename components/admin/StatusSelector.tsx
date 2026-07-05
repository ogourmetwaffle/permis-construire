"use client"

import React, { useState } from 'react'
import { STATUS_ORDER, getStatusConfig, normalizeStatus } from '@/lib/status'
import { toast } from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function StatusSelector({ currentStatus, dossierId, onUpdated }: { currentStatus?: string; dossierId: string; onUpdated?: () => void }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const updateStatus = async () => {
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) {
        toast.error('Session expirée — veuillez vous reconnecter')
        setLoading(false)
        return
      }

      const resp = await fetch('/api/admin/update-statut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
        {STATUS_ORDER.map((s) => {
          const cfg = getStatusConfig(s)
          return <option key={s} value={s}>{cfg?.label || s}</option>
        })}
      </select>
      <button type="button" onClick={updateStatus} disabled={loading} className="w-full bg-[#173B8C] text-white py-2 rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">{loading ? 'Mise à jour...' : 'Mettre à jour'}</button>
    </div>
  )
}

function renderBadge(status?: string) {
  const base = 'inline-flex items-center h-6 px-2 rounded-full text-[11px] font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap'
  const s = normalizeStatus(status)
  const cfg = s ? getStatusConfig(s) : null
  if (!cfg) return <span className={`${base} bg-gray-50 text-gray-700`}>{status || '-'}</span>
  const Icon = cfg.icon
  return (
    <span role="status" aria-label={cfg.label} title={cfg.label} className={`${base} ${cfg.badgeClass}`}>
      <Icon width={16} height={16} className="mr-1 shrink-0" />{cfg.label}
    </span>
  )
}
