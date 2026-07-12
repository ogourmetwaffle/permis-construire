"use client"

import React, { useEffect, useState } from 'react'
import DocumentList, { DocItem } from './DocumentList'
import ProjectCard from './ProjectCard'
import Timeline from './Timeline'
import { CheckCircle, XCircle, Mail, Download, CreditCard, Archive, Tag, Clock, User, ArrowLeft, FileText, Banknote, Edit2 } from 'lucide-react'
import PaymentDialog from './PaymentDialog'
import { toast } from 'react-hot-toast'
import EditDossierDialog from './EditDossierDialog'
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
  date_paiement?: string | null
  reference_paiement?: string | null
  commentaire_paiement?: string | null
  created_at?: string
  updated_at?: string
}

export default function AdminDossierDetail({ id, onUpdated }: { id: string; onUpdated?: () => void }) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(false)

  const [docs, setDocs] = useState<DocItem[]>([])
  const [docsLoading, setDocsLoading] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [zipDownloading, setZipDownloading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editSection, setEditSection] = useState<'client' | 'project'>('client')
  const [savedBadge, setSavedBadge] = useState<{ client?: boolean; project?: boolean }>({})

  useEffect(() => {
    fetchDossier()
  }, [id])

  // fetch dossier (extracted so it can be re-used by child callbacks)
  async function fetchDossier() {
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

  // Fetch documents once dossier is loaded (extracted so we can re-use after archive)
  const fetchDocs = async (numero?: string) => {
    if (!numero) return
    setDocsLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) {
        setDocs([])
        setDocsLoading(false)
        return
      }

      const resp = await fetch(`/api/admin/documents?numero=${encodeURIComponent(String(numero))}`, { headers: { Authorization: `Bearer ${token}` } })
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

  useEffect(() => {
    if (!dossier?.numero_dossier) return
    fetchDocs(dossier.numero_dossier)
  }, [dossier?.numero_dossier])

  const openArchiveModal = () => setShowArchiveModal(true)
  const closeArchiveModal = () => setShowArchiveModal(false)

  const openEdit = (section: 'client' | 'project') => {
    setEditSection(section)
    setShowEditDialog(true)
  }
  const closeEdit = () => setShowEditDialog(false)

  const handleSaved = (updated: any) => {
    // merge updated fields into dossier state
    setDossier((prev) => ({ ...(prev || {}), ...updated }))
    // show transient badge for the section
    setSavedBadge((s) => ({ ...s, [editSection]: true }))
    setTimeout(() => setSavedBadge((s) => ({ ...s, [editSection]: false })), 2000)
  }

  const handlePaymentSaved = (updated: any) => {
    setDossier((prev) => ({ ...(prev || {}), ...(updated || {}) }))
    toast.success('Paiement enregistré')
    setShowPaymentDialog(false)
    if (onUpdated) onUpdated()
    // reload to ensure global state/badges are up-to-date
    setTimeout(() => {
      try { window.location.reload() } catch (e) { /* ignore */ }
    }, 700)
  }

  const handleDownloadZip = async () => {
    if (!dossier) return
    // if there are no non-archived documents, avoid requesting the ZIP
    const hasAvailableDocsLocal = docs.some(d => !d.archived_at)
    if (!hasAvailableDocsLocal) {
      alert('Aucun fichier disponible à télécharger.')
      return
    }
    try {
      setZipDownloading(true)
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) throw new Error('No token')

      const resp = await fetch(`/api/admin/documents/zip?numero=${encodeURIComponent(dossier.numero_dossier)}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!resp.ok) {
        const t = await resp.text()
        throw new Error(t || 'Download failed')
      }
      const blob = await resp.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${dossier.numero_dossier}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      console.error('zip download error', e)
      alert('Impossible de télécharger l\'archive. Voir la console.')
    } finally {
      setZipDownloading(false)
    }
  }

  const handleConfirmArchive = async () => {
    if (!dossier) return
    try {
      setArchiving(true)
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) throw new Error('No token')

      const resp = await fetch('/api/admin/documents/archive', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero: dossier.numero_dossier }),
      })
      const json = await resp.json()
      if (!resp.ok) {
        console.error('archive error', json)
        alert('Erreur lors de l\'archivage : ' + (json?.error || ''))
        setArchiving(false)
        return
      }

      // Refresh docs list
      await fetchDocs(dossier.numero_dossier)
      setShowArchiveModal(false)
    } catch (e) {
      console.error('archive failed', e)
      alert('Erreur lors de l\'archivage. Voir la console.')
    } finally {
      setArchiving(false)
    }
  }

  // unified action button classes for consistent framing
  const actionBase = 'inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm transition-colors duration-150 shadow-sm border leading-none'

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

  const renderPaymentMode = () => {
    const val = (dossier.mode_paiement || '').toLowerCase()
    if (!val) return '—'
    if (val.includes('carte') || val.includes('card') || val.includes('cb')) {
      return (
        <span className="inline-flex items-center gap-2" aria-label="Paiement par carte">
          <CreditCard width={16} height={16} aria-hidden="true" className="text-gray-800" />
          <span className="text-sm text-gray-800">Carte</span>
        </span>
      )
    }
    if (val.includes('virement') || val.includes('transfer') || val.includes('bank')) {
      return (
        <span className="inline-flex items-center gap-2" aria-label="Paiement par virement">
          <Banknote width={16} height={16} aria-hidden="true" className="text-gray-800" />
          <span className="text-sm text-gray-800">Virement</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-sm text-gray-800">{dossier.mode_paiement}</span>
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
  const getDocDate = (d: any) => d.archived_at ?? d.updated_at ?? d.created_at ?? null
  const lastDoc = docs.length ? docs.reduce((best, cur) => {
    const bestDate = getDocDate(best)
    const curDate = getDocDate(cur)
    if (!bestDate) return cur
    if (!curDate) return best
    return new Date(curDate) > new Date(bestDate) ? cur : best
  }, docs[0]) : null

  // Archive info: compute latest archived_at across documents
  const archivedDates = docs.map(d => d.archived_at).filter(Boolean) as string[]
  const latestArchivedAt = archivedDates.length ? new Date(Math.max(...archivedDates.map(s => new Date(s).getTime()))) : null

  // Whether there are any non-archived documents available for ZIP
  const hasAvailableDocs = docs.some(d => !d.archived_at)

  // Timeline events (simple, built from available data)
  const events: { date?: string | null; title: string; description?: string }[] = []
  if (dossier.created_at) events.push({ date: dossier.created_at, title: 'Dossier créé', description: `Dossier ${dossier.numero_dossier} déposé en ligne.` })
  if (dossier.paiement_effectue) events.push({ date: dossier.updated_at || null, title: 'Paiement reçu', description: `Paiement de ${dossier.montant ?? 0} €` })
  if (docCount > 0) events.push({ date: lastDoc?.updated_at || null, title: `${docCount} document(s) ajouté(s)`, description: lastDoc?.name })
  // If there is a latest archived timestamp, add it to the timeline so there's a visible trace
  if (latestArchivedAt) {
    events.push({ date: latestArchivedAt.toISOString(), title: 'Documents archivés', description: `Date et heure d'archivage ${latestArchivedAt.toLocaleString('fr-FR')}` })
  }

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
            <a href={`mailto:${dossier.email ?? ''}`} className={`${actionBase} bg-white text-gray-700 border-gray-200 hover:bg-gray-100`}> <Mail size={14} /> Email</a>
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={!hasAvailableDocs || zipDownloading}
              aria-busy={zipDownloading}
              title={!hasAvailableDocs ? 'Aucun fichier disponible' : undefined}
              className={`${actionBase} ${!hasAvailableDocs || zipDownloading ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
            >
              <Download size={14} className={zipDownloading ? 'animate-spin' : ''} />
              {zipDownloading ? 'Téléchargement…' : 'Télécharger ZIP'}
            </button>
            {!dossier.paiement_effectue ? (
              <button
                type="button"
                onClick={() => setShowPaymentDialog(true)}
                className={`${actionBase} ${dossier.paiement_effectue ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
              >
                <CreditCard size={14} /> Paiement
              </button>
            ) : (
              <span className={`${actionBase} bg-green-50 text-green-700 border-green-100`}><CheckCircle size={14} /> Paiement confirmé</span>
            )}
            <button
              type="button"
              onClick={hasAvailableDocs ? openArchiveModal : undefined}
              disabled={!hasAvailableDocs}
              title={!hasAvailableDocs ? 'Tous les documents sont déjà archivés' : undefined}
              className={`${actionBase} ${!hasAvailableDocs ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-400 border-gray-200 hover:bg-red-100 hover:text-red-600'}`}
            >
              <Archive size={14} /> Archiver
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <div className="relative">
            <ProjectCard dossier={dossier} onEdit={() => openEdit('project')} />
            {savedBadge.project && <div className="absolute top-2 right-2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded">Dernière modification enregistrée ✓</div>}
          </div>

          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
                <div className="w-7 h-7 rounded-lg bg-[var(--eh-primary)] flex items-center justify-center shrink-0 text-white">
                  <FileText size={14} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Documents</h3>
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
                <div className="text-sm text-gray-800">{renderPaymentMode()}</div>
              </div>
              {dossier.paiement_effectue && (
                <div className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Date du paiement</span>
                    <span className="text-sm font-medium text-gray-800">{dossier.date_paiement ? new Date(dossier.date_paiement).toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Référence</span>
                    <span className="text-sm font-medium text-gray-800 break-all">{dossier.reference_paiement ?? '—'}</span>
                  </div>
                  {dossier.commentaire_paiement && (
                    <div>
                      <div className="text-xs text-gray-500">Commentaire</div>
                      <div className="text-sm text-gray-800">{dossier.commentaire_paiement}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0"><Tag size={14} className="text-orange-500" /></div>
              <h3 className="text-sm font-semibold text-gray-800">Statut dossier</h3>
            </div>
            <StatusSelector currentStatus={dossier.statut} dossierId={String(dossier.id)} onUpdated={async () => { await fetchDossier(); if (onUpdated) onUpdated() }} />
          </div>

          {/* Client */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><User size={14} className="text-blue-600" /></div>
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-gray-800">Informations client</h3>
                <button type="button" onClick={() => openEdit('client')} title="Modifier" className="inline-flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:bg-gray-100"><Edit2 size={14} /></button>
                {savedBadge.client && <div className="text-sm text-green-700 bg-green-50 px-2 py-0.5 rounded">Dernière modification enregistrée ✓</div>}
              </div>
            </div>
            <div className="text-sm text-gray-800 space-y-3">
                <div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Type de client</div>
                    {(() => {
                      const raw = dossier.type_client || ''
                      const t = raw.toLowerCase()
                      if (!t) return <div className="font-medium">—</div>
                      if (t.includes('pro') || t.includes('professionnel')) {
                        return (
                          <span className="inline-flex items-center h-6 px-2 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">Professionnel</span>
                        )
                      }
                      if (t.includes('part') || t.includes('particulier')) {
                        return (
                          <span className="inline-flex items-center h-6 px-2 rounded-full text-xs font-semibold bg-green-50 text-green-700 ring-1 ring-inset ring-green-100">Particulier</span>
                        )
                      }
                      return <div className="font-medium">{dossier.type_client}</div>
                    })()}
                </div>
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
              {/* Archive date moved to Timeline for traceability */}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Dernière modification</span>
                <span className="text-xs font-medium text-gray-800">{dossier.updated_at ? new Date(dossier.updated_at).toLocaleDateString('fr-FR') : '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeArchiveModal} />
          <div role="dialog" aria-modal="true" aria-labelledby="archive-title" className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10 transform transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Archive size={20} />
                </div>
              </div>
              <div className="min-w-0">
                <h3 id="archive-title" className="text-lg font-semibold text-gray-900">Archiver les documents ?</h3>
                <p className="mt-2 text-sm text-gray-600">Cette opération supprimera définitivement les documents du stockage Supabase afin de libérer de l&apos;espace disque. Les informations du dossier seront conservées.</p>
                <p className="mt-2 text-sm text-gray-600">Les documents ne pourront plus être prévisualisés, téléchargés ou restaurés automatiquement. Nous vous recommandons fortement de télécharger l&apos;archive ZIP du dossier avant de continuer.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={!hasAvailableDocs || zipDownloading}
                  aria-busy={zipDownloading}
                  title={!hasAvailableDocs ? 'Aucun fichier disponible' : undefined}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors duration-150 ${!hasAvailableDocs || zipDownloading ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Download size={14} className={zipDownloading ? 'animate-spin' : ''} />
                  {zipDownloading ? 'Téléchargement…' : 'Télécharger le dossier ZIP'}
                </button>

                <button type="button" onClick={closeArchiveModal} className="inline-flex items-center px-3 py-2 rounded border border-gray-100 bg-white text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">Annuler</button>
              </div>

              <div>
                <div className="flex items-center gap-3">
                  {!hasAvailableDocs && (
                    <div className="text-sm text-gray-600">Aucun fichier non-archivé disponible.</div>
                  )}
                  <button type="button" onClick={handleConfirmArchive} disabled={!hasAvailableDocs || archiving} className={`inline-flex items-center gap-2 px-4 py-2 rounded text-white text-sm transition-colors duration-150 ${!hasAvailableDocs ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                    {archiving ? 'Archivage…' : 'Archiver les documents'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <PaymentDialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} dossierId={dossier.id} onSaved={handlePaymentSaved} />
      <EditDossierDialog open={showEditDialog} onClose={closeEdit} dossier={dossier} section={editSection} onSaved={handleSaved} />
    </div>
  )
}
