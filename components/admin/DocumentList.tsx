"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { File as FileIcon, Image as ImageIcon, Eye as EyeIcon, Download as DownloadIcon } from 'lucide-react'

const iconFor = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return <FileIcon size={16} className="text-indigo-600" />
  return <ImageIcon size={16} className="text-indigo-600" />
}

type DocItem = {
  name: string
  size: number
  updated_at: string
  url?: string | null
}

export default function DocumentList({ numero }: { numero?: string }) {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!numero) return
    const fetchDocs = async () => {
      setLoading(true)
      try {
        const session = await supabase.auth.getSession()
        const token = session.data?.session?.access_token
        if (!token) {
          console.error('No session token')
          setDocs([])
          setLoading(false)
          return
        }

        const resp = await fetch(`/api/admin/documents?numero=${encodeURIComponent(numero)}`, { headers: { Authorization: `Bearer ${token}` } })
        const text = await resp.text()
        if (!text) {
          console.error('api docs: empty response body')
          setDocs([])
          } else {
          let json: unknown = null
          try {
            json = JSON.parse(text)
          } catch (err) {
            console.error('api docs: invalid JSON response', text, err)
            setDocs([])
          }
          if (json) {
            if (!resp.ok) {
              console.error('api docs', json)
              setDocs([])
            } else {
              const parsed = json as { items?: DocItem[] }
              console.log('docs api items', parsed.items)
              setDocs(parsed.items || [])
            }
          }
        }
      } catch (err) {
        console.error(err)
        setDocs([])
      }
      setLoading(false)
    }
    fetchDocs()
  }, [numero])

  const handleOpen = (url?: string) => {
    if (!url) return
    console.log('preview click', url)
    // Create an anchor and click it synchronously to avoid popup blockers
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const handleDownload = async (url?: string, name?: string, key?: string) => {
    if (!url) return
    const dlKey = key || url
    try {
      setDownloading(prev => ({ ...prev, [dlKey]: true }))
      const res = await fetch(url)
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = name || 'document'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
    } catch (err) {
      console.error('download failed, falling back to opening in new tab', err)
      // Fallback: open in new tab (may let user save manually)
      try {
        const a2 = document.createElement('a')
        a2.href = url
        a2.target = '_blank'
        a2.rel = 'noopener noreferrer'
        document.body.appendChild(a2)
        a2.click()
        a2.remove()
      } catch (e2) {
        console.error('fallback open failed', e2)
        alert('Impossible de télécharger le document.')
      }
    } finally {
      setDownloading(prev => ({ ...prev, [dlKey]: false }))
    }
  }

  if (!numero) return <div className="text-sm text-gray-400 py-2">Aucun numéro de dossier fourni.</div>

  return (
    <div className="space-y-1.5">
      {loading && (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
          Chargement des documents…
        </div>
      )}
      {!loading && docs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
            <FileIcon size={18} className="text-gray-300" />
          </div>
          <p className="text-sm text-gray-400">Aucun document trouvé</p>
        </div>
      )}
      {docs.map((d, i) => (
        <div key={i} className="group flex items-center gap-3 px-3 py-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
          {/* Icon */}
          <div className="w-9 h-9 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            {iconFor(d.name)}
          </div>
          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-800 truncate">{d.name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-gray-400">
                {(() => {
                  const sizeNum = Number(d.size)
                  if (Number.isFinite(sizeNum) && sizeNum > 0) {
                    return `${(sizeNum / 1024 / 1024).toFixed(2)} Mo`
                  }
                  return '—'
                })()}
              </span>
              <span className="text-gray-200 text-[10px]">•</span>
              <span className="text-[11px] text-gray-400">{new Date(d.updated_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => handleOpen(d.url ?? undefined)}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <EyeIcon size={13} />Voir
            </button>
            {(() => {
              const dlKey = d.url ?? `${numero}-${i}-${d.name}`
              return (
                <button
                  type="button"
                  onClick={() => handleDownload(d.url ?? undefined, d.name, dlKey)}
                  disabled={!!downloading[dlKey]}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DownloadIcon size={13} />
                  {downloading[dlKey] ? '…' : 'DL'}
                </button>
              )
            })()}
          </div>
        </div>
      ))}
    </div>
  )
}
