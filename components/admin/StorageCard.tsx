"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Mo'
  const kb = 1024
  const mb = kb * 1024
  if (bytes >= mb) return Math.round((bytes / mb) * 10) / 10 + ' Mo'
  return Math.round((bytes / kb) * 10) / 10 + ' Ko'
}

export default function StorageCard() {
  const [totalSize, setTotalSize] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const session = await supabase.auth.getSession()
        const token = session.data?.session?.access_token
        if (!token) return

        const res = await fetch('/api/admin/storage', { headers: { Authorization: `Bearer ${token}` } })
        const json = await res.json()
        if (json?.ok && mounted) {
          setTotalSize(json.totalSize ?? 0)
        } else {
          console.error('storage api error', json)
        }
      } catch (e) {
        console.error('fetch storage error', e)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [])

  const used = totalSize ?? 0
  const limit = 1024 * 1024 * 1024 // 1 GB
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0

  const percentColor = percent < 70 ? 'bg-emerald-500' : percent < 90 ? 'bg-amber-500' : 'bg-rose-500'

  const usedStr = formatBytes(used)

  return (
    <div className={`rounded-xl p-4 bg-white border border-slate-100 shadow-sm h-24 flex items-center gap-3`}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-transparent" />
      <div className="flex-1">
        <div className="text-[11px] text-slate-500">Stockage</div>
        <div className="text-base font-semibold text-slate-900 mt-1 whitespace-nowrap overflow-hidden">{usedStr} / 1 Go</div>
        <div className="mt-3">
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div className={`${percentColor} h-1 transition-all duration-300`} style={{ width: `${Math.min(100, percent)}%` }} />
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right">{isNaN(percent) ? '—' : percent + ' %'}</div>
        </div>
      </div>
    </div>
  )
}
