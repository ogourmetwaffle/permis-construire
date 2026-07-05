"use client"

import React, { useEffect, useState } from 'react'
import DocumentList, { DocItem } from './DocumentList'
import ProjectCard from './ProjectCard'
import Timeline from './Timeline'
import { CheckCircle, XCircle, Mail, Download, CreditCard, Archive, Tag, Clock, User, ArrowLeft } from 'lucide-react'
import StatusSelector from './StatusSelector'
import { supabase } from '@/lib/supabase'
import { getStatusConfig, normalizeStatus } from '@/lib/status'

type Dossier = {
  id: number | string
  numero_dossier: string
  type_client?: string
  type_projet?: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  date_naissance?: string | null
  adresse_client?: string | null
  adresse_projet?: string | null
  numero_parcelle?: string | null
  surface?: number | null
  description?: string | null
  montant?: number | null
  mode_paiement?: string | null
  paiement_effectue?: boolean
  statut?: string
  commentaire_admin?: string | null
  created_at?: string
  updated_at?: string
}

export default function AdminDossierDetail({ id, onUpdated }: { id: string; onUpdated?: () => void }) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(false)

  const [docs, setDocs] = useState<DocItem[]>([])
  const [docsLoading, setDocsLoading] = useState(false)

  useEffect(() => {
    const fetchDossier = async () => {
      setLoading(true)
      try {
        const session = await supabase.auth.getSession()
        const token = session.data?.session?.access_token
        if (!token) {
          console.error('No session token')
          setDossier(null)
          setLoading(false)
          return
        }

        const res = await fetch('/api/admin/dossiers', { headers: { Authorization: `Bearer ${token}` } })
        if (res.status === 401) {
          console.error('Unauthorized when fetching dossier')
          setDossier(null)
          setLoading(false)
          return
        }

        const json = await res.json()
        if (!json.ok) {
          console.error('api admin dossiers error', json.error)
          setDossier(null)
          setLoading(false)
          return
        }

        const all: Dossier[] = json.data || []
        const found = all.find((d) => (typeof id === 'string' && id.startsWith('PE-') ? d.numero_dossier === id : String(d.id) === String(id)))
        setDossier(found || null)
      } catch (err) {
        console.error('fetch dossier', err)
        setDossier(null)
      }
      setLoading(false)
    }
    fetchDossier()
  }, [id])

  // Fetch documents once dossier is loaded
  useEffect(() => {
    if (!dossier?.numero_dossier) return
    const fetchDocs = async () => {
      setDocsLoading(true)
      try {
        const session = await supabase.auth.getSession()
        const token = session.data?.session?.access_token
        if (!token) {
          setDocs([])
          setDocsLoading(false)
          return
        }

        const resp = await fetch(`/api/admin/documents?numero=${encodeURIComponent(String(dossier.numero_dossier))}`, { headers: { Authorization: `Bearer ${token}` } })
        const text = await resp.text()
        if (!text) {
          setDocs([])
        } else {
          let json: any = null
          try { json = JSON.parse(text) } catch (e) { console.error('invalid docs response', e); setDocs([]) }
          if (json && resp.ok) setDocs(json.items || [])
          else setDocs([])
        }
      } catch (err) {
        console.error('fetch docs', err)
        setDocs([])
      }
      setDocsLoading(false)
    }
    fetchDocs()
  }, [dossier?.numero_dossier])

  if (loading) return <div className="p-4">Chargement...</div>
  if (!dossier) return <div className="p-4 text-gray-600">Dossier introuvable.</div>

  const renderStatusBadge = () => {
    const base = 'inline-flex items-center h-6 px-3 rounded-full text-[12px] font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap'
    const s = normalizeStatus(dossier.statut)
    const cfg = s ? getStatusConfig(s) : null
    if (!cfg) return <span className={`${base} bg-gray-50 text-gray-700`}>{dossier.statut || '-'}</span>
    const Icon = cfg.icon
    return (
      <span className={`${base} ${cfg.badgeClass}`}>
        <Icon width={16} height={16} className="mr-1.5 shrink-0" />{cfg.label}
      </span>
    )
  }

  const renderPaymentBadge = () => {
    const base = 'inline-flex items-center h-6 px-3 rounded-full text-[12px] font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap'
    if (dossier.paiement_effectue) {
      return (
        <span className={`${base} bg-green-50 text-green-700 ring-green-100`}>
          <CheckCircle width={16} height={16} className="mr-1.5" />Payé
        </span>
      )
    }
    return (
      <span className={`${base} bg-red-50 text-red-700 ring-red-100`}>
        <XCircle width={16} height={16} className="mr-1.5" />Non payé
      </span>
    )
  }

  // Documents stats
  const docCount = docs.length
  const totalBytes = docs.reduce((acc, d) => acc + (Number(d.size) || 0), 0)
  const formatBytes = (n: number) => {
    if (!n || n <= 0) return '0 Mo'
    return `${(n / 1024 / 1024).toFixed(2)} Mo`
  }
  const lastDoc = docs.length ? docs.reduce((best, cur) => (new Date(cur.updated_at) > new Date(best.updated_at) ? cur : best), docs[0]) : null

  // Timeline events (simple, built from available data)
  const events: { date?: string | null; title: string; description?: string }[] = []
  if (dossier.created_at) events.push({ date: dossier.created_at, title: 'Dossier créé', description: `Dossier ${dossier.numero_dossier} déposé en ligne.` })
  if (dossier.paiement_effectue) events.push({ date: dossier.updated_at || null, title: 'Paiement reçu', description: `Paiement de ${dossier.montant ?? 0} €` })
  if (docCount > 0) events.push({ date: lastDoc?.updated_at || null, title: `${docCount} document(s) ajouté(s)`, description: lastDoc?.name })

  return (
    <div className="w-full">

      {/* Header: back arrow + dossier label */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <a href="/admin" className="inline-flex items-center gap-3 group rounded-lg bg-white border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
            <div className="w-9 h-9 rounded-md bg-[var(--eh-primary)] flex items-center justify-center text-white">
              <ArrowLeft size={16} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-sm font-medium text-gray-600">Dossiers</div>
              <div className="mt-1 inline-flex items-center px-3 py-1 rounded-md bg-gray-50 border border-gray-100 text-base font-semibold text-gray-900">{dossier.numero_dossier}</div>
            </div>
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">{renderStatusBadge()}{renderPaymentBadge()}</div>
          <div className="flex items-center gap-2">
            <a href={`mailto:${dossier.email ?? ''}`} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm"> <Mail size={14} /> Email</a>
            <button type="button" className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm"><Download size={14} /> Télécharger ZIP</button>
            <a href={"#"} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 shadow-sm"><CreditCard size={14} /> Paiement</a>
            <button type="button" className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-400 hover:bg-red-50 hover:text-red-500"> <Archive size={14} /> Archiver</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <ProjectCard dossier={dossier} />

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 text-indigo-600"><svg className="w-4 h-4" /></div>
                <h3 className="text-sm font-semibold text-gray-800">Documents</h3>
              </div>
              <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
                <Download size={12} /> Tout télécharger
              </button>
            </div>
            <DocumentList numero={dossier.numero_dossier} items={docs} />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><Clock size={14} className="text-gray-500" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Historique</h3>
            </div>
            <Timeline events={events} />
          </div>
        </div>

        <div className="space-y-5">
          {/* Paiement */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0"><CreditCard size={14} className="text-green-600" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Paiement</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Montant</span>
                <span className="text-lg font-bold text-gray-900">{dossier.montant ?? 0} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Statut</span>
                {dossier.paiement_effectue ? (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 ring-1 ring-inset ring-green-100"><CheckCircle size={12} />Payé</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100"><XCircle size={12} />En attente</span>
                )}
              </div>
              <div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Mode</div>
                <div className="text-sm text-gray-800">{dossier.mode_paiement || '—'}</div>
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0"><Tag size={14} className="text-orange-500" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Statut dossier</h3>
            </div>
            <StatusSelector currentStatus={dossier.statut} dossierId={String(dossier.id)} onUpdated={onUpdated} />
          </div>

          {/* Client */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><User size={14} className="text-blue-600" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Informations client</h3>
            </div>
            <div className="text-sm text-gray-800 space-y-3">
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Nom</div>
                <div className="font-medium">{dossier.nom} {dossier.prenom}</div>
              </div>
              {dossier.email && (
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Email</div>
                  <a href={`mailto:${dossier.email}`} className="text-sm text-gray-700 break-all">{dossier.email}</a>
                </div>
              )}
              {dossier.telephone && (
                <div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Téléphone</div>
                  <div className="text-sm text-gray-700">{dossier.telephone}</div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques simples (inline) */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0"><Clock size={14} className="text-purple-500" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Statistiques</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Nombre de documents</span>
                <span className="text-xs font-medium text-gray-800">{docCount}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Taille totale</span>
                <span className="text-xs font-medium text-gray-800">{formatBytes(totalBytes)}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Dernier document</span>
                <span className="text-xs font-medium text-gray-800">{lastDoc ? lastDoc.name : '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Dernière modification</span>
                <span className="text-xs font-medium text-gray-800">{dossier.updated_at ? new Date(dossier.updated_at).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
