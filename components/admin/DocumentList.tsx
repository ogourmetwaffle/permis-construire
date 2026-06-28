"use client"

import React, { useEffect, useState } from 'react'
import { File as FileIcon, Image as ImageIcon, Eye as EyeIcon, Download as DownloadIcon } from 'lucide-react'

const iconFor = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return <FileIcon size={18} className="text-indigo-600" />
  return <ImageIcon size={18} className="text-indigo-600" />
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
        const resp = await fetch(`/api/admin/docs?numero=${encodeURIComponent(numero)}`)
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

  if (!numero) return <div className="text-sm text-gray-500">Aucun numéro de dossier fourni.</div>

  return (
    <div className="space-y-2">
      {loading && <div className="text-sm text-gray-500">Chargement des documents...</div>}
      {!loading && docs.length === 0 && <div className="text-sm text-gray-500">Aucun document trouvé.</div>}
      {docs.map((d, i) => (
        <div key={i} className="flex items-center justify-between p-2 border rounded">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">{iconFor(d.name)}</div>
            <div className="min-w-0">
              <div className="text-sm text-gray-800 truncate max-w-50">{d.name}</div>
              <div className="text-xs text-gray-500">
                {(() => {
                  const sizeNum = Number(d.size)
                  if (Number.isFinite(sizeNum) && sizeNum > 0) {
                    return `${(sizeNum / 1024 / 1024).toFixed(2)} MB`
                  }
                  return '-' 
                })()} • {new Date(d.updated_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => handleOpen(d.url ?? undefined)} className="text-sm text-blue-600 flex items-center gap-1 cursor-pointer"><EyeIcon size={14}/>Prévisualiser</button>
            {(() => {
              const dlKey = d.url ?? `${numero}-${i}-${d.name}`
              return (
                <button
                  type="button"
                  onClick={() => handleDownload(d.url ?? undefined, d.name, dlKey)}
                  disabled={!!downloading[dlKey]}
                  className="text-sm text-gray-700 flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <DownloadIcon size={14}/>
                  {downloading[dlKey] ? 'Téléchargement...' : 'Télécharger'}
                </button>
              )
            })()}
          </div>
        </div>
      ))}
    </div>
  )
}
