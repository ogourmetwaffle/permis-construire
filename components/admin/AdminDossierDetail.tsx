"use client"

import React, { useEffect, useState } from 'react'
import DocumentList, { DocItem } from './DocumentList'
import ProjectCard from './ProjectCard'
import Timeline from './Timeline'
import {
  ArrowLeft,
  Mail,
  Download,
  CreditCard,
  Archive,
  Trash2,
  FileText,
  User,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Edit2,
  Tag,
} from 'lucide-react'
import PaymentDialog from './PaymentDialog'
import { toast } from 'react-hot-toast'
import EditDossierDialog from './EditDossierDialog'
import { supabase } from '@/lib/supabase'
import { getStatusConfig, normalizeStatus, STATUS } from '@/lib/status'
import PrepareDevisDialog from './PrepareDevisDialog'
import ActionMenu from './ActionMenu'

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
  lieu_naissance_ville?: string | null
  lieu_naissance_pays?: string | null
  nom_societe?: string | null
  adresse_client?: string | null
  adresse_projet?: string | null
  numero_parcelle?: string | null
  surface?: number | null
  description?: string | null
  montant?: number | null
  mode_paiement?: string | null
  paiement_effectue?: boolean
  iban?: string | null
  bic?: string | null
  titulaire?: string | null
  reference_virement?: string | null
  mot_de_passe_suivi?: string | null
  statut?: string
  commentaire_admin?: string | null
  date_paiement?: string | null
  reference_paiement?: string | null
  commentaire_paiement?: string | null
  created_at?: string
  updated_at?: string
}

type Tab = 'overview' | 'documents' | 'payment' | 'history'

export default function AdminDossierDetail({ id, onUpdated }: { id: string; onUpdated?: () => void }) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(false)

  const [docs, setDocs] = useState<DocItem[]>([])
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [zipDownloading, setZipDownloading] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPrepareDevis, setShowPrepareDevis] = useState(false)
  const [editSection, setEditSection] = useState<'client' | 'project'>('client')
  const [savedBadge, setSavedBadge] = useState<{ client?: boolean; project?: boolean }>({})
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  useEffect(() => {
    fetchDossier()
  }, [id])

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

  const fetchDocs = async (numero?: string) => {
    if (!numero) return
    try {
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) {
        setDocs([])
        return
      }

      const resp = await fetch(`/api/admin/documents?numero=${encodeURIComponent(String(numero))}`, { headers: { Authorization: `Bearer ${token}` } })
      const text = await resp.text()
      if (!text) {
        setDocs([])
      } else {
        let json: unknown = null
        try { json = JSON.parse(text) } catch (e) { console.error('invalid docs response', e); setDocs([]) }
        if (json && resp.ok) setDocs((json as { items?: DocItem[] }).items || [])
        else setDocs([])
      }
    } catch (err) {
      console.error(err)
      setDocs([])
    }
  }

  useEffect(() => {
    if (!dossier?.numero_dossier) return
    fetchDocs(dossier.numero_dossier)
  }, [dossier?.numero_dossier])

  const openArchiveModal = () => setShowArchiveModal(true)
  const closeArchiveModal = () => setShowArchiveModal(false)
  const openDeleteModal = () => setShowDeleteModal(true)
  const closeDeleteModal = () => setShowDeleteModal(false)

  const openEdit = (section: 'client' | 'project') => {
    setEditSection(section)
    setShowEditDialog(true)
  }
  const closeEdit = () => setShowEditDialog(false)

  const handleDevisSaved = (updated: any) => {
    setDossier((prev) => ({ ...(prev || {}), ...(updated || {}) }))
    toast.success('Devis enregistré')
    if (onUpdated) onUpdated()
  }

  const handleSaved = (updated: any) => {
    setDossier((prev) => ({ ...(prev || {}), ...updated }))
    setSavedBadge((s) => ({ ...s, [editSection]: true }))
    setTimeout(() => setSavedBadge((s) => ({ ...s, [editSection]: false })), 2000)
  }

  const handlePaymentSaved = (updated: any) => {
    setDossier((prev) => ({ ...(prev || {}), ...(updated || {}) }))
    toast.success('Paiement enregistré')
    setShowPaymentDialog(false)
    if (onUpdated) onUpdated()
    setTimeout(() => {
      try { window.location.reload() } catch (e) { /* ignore */ }
    }, 700)
  }

  const handleDownloadZip = async () => {
    if (!dossier) return
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

      await fetchDocs(dossier.numero_dossier)
      window.dispatchEvent(new Event('admin-storage-refresh'))
      setShowArchiveModal(false)
    } catch (e) {
      console.error('archive failed', e)
      alert('Erreur lors de l\'archivage. Voir la console.')
    } finally {
      setArchiving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!dossier) return
    try {
      setDeleting(true)
      const session = await supabase.auth.getSession()
      const token = session.data?.session?.access_token
      if (!token) throw new Error('No token')

      const resp = await fetch(`/api/admin/dossiers/${encodeURIComponent(String(id))}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await resp.json()

      if (!resp.ok) {
        console.error('delete dossier error', json)
        alert('Erreur lors de la suppression du dossier : ' + (json?.error || ''))
        setDeleting(false)
        return
      }

      window.dispatchEvent(new Event('admin-storage-refresh'))
      closeDeleteModal()
      toast.success('Dossier supprimé')
      setTimeout(() => {
        window.location.href = '/admin'
      }, 350)
    } catch (e) {
      console.error('delete dossier failed', e)
      alert('Erreur lors de la suppression du dossier. Voir la console.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <div className="p-4">Chargement...</div>
  if (!dossier) return <div className="p-4 text-gray-600">Dossier introuvable.</div>

  const status = normalizeStatus(dossier.statut)
  const statusCfg = status ? getStatusConfig(status) : null

  const docCount = docs.length
  const totalBytes = docs.reduce((acc, d) => acc + (Number(d.size) || 0), 0)
  const formatBytes = (n: number) => {
    if (!n || n <= 0) return '0 Mo'
    return `${(n / 1024 / 1024).toFixed(2)} Mo`
  }
  const hasAvailableDocs = docs.some(d => !d.archived_at)

  const archivedDates = docs.map(d => d.archived_at).filter(Boolean) as string[]
  const latestArchivedAt = archivedDates.length ? new Date(Math.max(...archivedDates.map(s => new Date(s).getTime()))) : null

  const events: { date?: string | null; title: string; description?: string }[] = []
  if (dossier.created_at) events.push({ date: dossier.created_at, title: 'Dossier créé', description: `Dossier ${dossier.numero_dossier} déposé en ligne.` })
  if (dossier.paiement_effectue) events.push({ date: dossier.updated_at || null, title: 'Paiement reçu', description: `Paiement de ${dossier.montant ?? 0} €` })
  if (docCount > 0) events.push({ date: docs[0]?.updated_at || null, title: `${docCount} document(s) ajouté(s)`, description: docs[0]?.name })
  if (latestArchivedAt) {
    events.push({ date: latestArchivedAt.toISOString(), title: 'Documents archivés', description: `Date et heure d'archivage ${latestArchivedAt.toLocaleString('fr-FR')}` })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble' },
    { id: 'documents', label: 'Documents' },
    { id: 'payment', label: 'Paiement' },
    { id: 'history', label: 'Historique' },
  ]

  const getNextAction = () => {
    if (status === STATUS.DEVIS) {
      return {
        label: 'Préparer le devis',
        action: () => setShowPrepareDevis(true),
        variant: 'primary' as const,
      }
    }
    if (status === STATUS.EN_ATTENTE_PAIEMENT) {
      return {
        label: 'En attente du paiement client',
        action: () => {},
        variant: 'info' as const,
        detail: `Montant : ${dossier.montant ?? 0} €`,
      }
    }
    if (status === STATUS.NOUVEAU) {
      return {
        label: 'Dossier prêt à être traité',
        action: () => {},
        variant: 'success' as const,
      }
    }
    if (status === STATUS.EN_COURS) {
      return {
        label: 'Dossier en cours de traitement',
        action: () => {},
        variant: 'info' as const,
      }
    }
    if (status === STATUS.TERMINE) {
      return {
        label: 'Dossier terminé',
        action: () => {},
        variant: 'success' as const,
      }
    }
    if (status === STATUS.INFORMATIONS_MANQUANTES) {
      return {
        label: 'Informations manquantes',
        action: () => openEdit('project'),
        variant: 'warning' as const,
      }
    }
    return null
  }

  const nextAction = getNextAction()

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <a href="/admin" className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors" title="Retour aux dossiers">
            <ArrowLeft size={16} className="text-gray-600" />
          </a>
          <div>
            <div className="text-sm font-medium text-gray-500">Dossier</div>
            <div className="text-base font-semibold text-gray-900">{dossier.numero_dossier}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {statusCfg && (
            <span className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap ${statusCfg.badgeClass}`}>
              {React.createElement(statusCfg.icon, { width: 14, height: 14, className: 'shrink-0' })}
              {statusCfg.label}
            </span>
          )}

          <ActionMenu
            items={[
              { label: 'Modifier le dossier', onClick: () => openEdit('project') },
              { label: 'Envoyer un email', onClick: () => window.location.href = `mailto:${dossier.email ?? ''}` },
              { label: 'Télécharger les documents', onClick: handleDownloadZip, disabled: !hasAvailableDocs },
              { label: 'Télécharger ZIP', onClick: handleDownloadZip, disabled: !hasAvailableDocs },
              { label: 'Archiver', onClick: hasAvailableDocs ? openArchiveModal : () => {}, disabled: !hasAvailableDocs },
              { label: 'Supprimer', onClick: openDeleteModal, danger: true },
            ]}
          />
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Informations client</div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-gray-900">{dossier.nom} {dossier.prenom}</span>
                {dossier.type_client && (
                  <span className={`inline-flex items-center h-5 px-2 rounded-full text-[11px] font-semibold ${dossier.type_client.toLowerCase().includes('pro') ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100' : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-100'}`}>
                    {dossier.type_client.toLowerCase().includes('pro') ? 'Professionnel' : 'Particulier'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                {dossier.email && (
                  <a href={`mailto:${dossier.email}`} className="inline-flex items-center gap-1.5 hover:text-[#1e3a5f] transition-colors">
                    <Mail size={13} className="text-gray-400" />
                    {dossier.email}
                  </a>
                )}
                {dossier.telephone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" />
                    {dossier.telephone}
                  </span>
                )}
                {dossier.adresse_client && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    {dossier.adresse_client}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button type="button" onClick={() => openEdit('client')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0">
            <Edit2 size={13} />
            Modifier
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#1e3a5f] text-[#1e3a5f]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <ProjectCard dossier={dossier} onEdit={() => openEdit('project')} />
              {savedBadge.project && (
                <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg inline-flex items-center gap-2">
                  <CheckCircle size={14} /> Dernière modification enregistrée
                </div>
              )}

              <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Tag size={14} className="text-orange-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">État du dossier</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    {statusCfg && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ring-1 ring-inset ${statusCfg.badgeClass}`}>
                        {React.createElement(statusCfg.icon, { width: 16, height: 16, className: 'shrink-0' })}
                        {statusCfg.label}
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Mis à jour le {dossier.updated_at ? new Date(dossier.updated_at).toLocaleDateString('fr-FR') : '—'}
                    </div>
                  </div>
                  <div>
                    {nextAction && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Prochaine action</div>
                        <div className="text-sm font-medium text-gray-800">{nextAction.label}</div>
                        {nextAction.detail && <div className="text-xs text-gray-500 mt-0.5">{nextAction.detail}</div>}
                        {nextAction.variant === 'primary' && (
                          <button
                            type="button"
                            onClick={nextAction.action}
                            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                          >
                            <FileText size={14} />
                            {nextAction.label}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{docCount}</span> document{docCount !== 1 ? 's' : ''} · <span className="font-semibold text-gray-900">{formatBytes(totalBytes)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={!hasAvailableDocs || zipDownloading}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!hasAvailableDocs || zipDownloading ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                  >
                    <Download size={14} className={zipDownloading ? 'animate-spin' : ''} />
                    {zipDownloading ? 'Téléchargement…' : 'Télécharger ZIP'}
                  </button>
                  <button
                    type="button"
                    onClick={openArchiveModal}
                    disabled={!hasAvailableDocs}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!hasAvailableDocs ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'}`}
                  >
                    <Archive size={14} />
                    Archiver
                  </button>
                </div>
              </div>

              <DocumentList numero={dossier.numero_dossier} items={docs} />
            </div>
          )}

          {/* Paiement */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <CreditCard size={14} className="text-green-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Informations de paiement</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Montant</div>
                    <div className="text-lg font-bold text-gray-900">{dossier.montant ?? 0} €</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Statut</div>
                    {dossier.paiement_effectue ? (
                      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 ring-1 ring-inset ring-green-100">
                        <CheckCircle size={12} /> Payé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100">
                        <XCircle size={12} /> Non payé
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Mode</div>
                    <div className="text-sm text-gray-800">{dossier.mode_paiement || '—'}</div>
                  </div>
                  {dossier.paiement_effectue && (
                    <>
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date du paiement</div>
                        <div className="text-sm text-gray-800">{dossier.date_paiement ? new Date(dossier.date_paiement).toLocaleDateString('fr-FR') : '—'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Référence</div>
                        <div className="text-sm text-gray-800 break-all">{dossier.reference_paiement ?? '—'}</div>
                      </div>
                      {dossier.commentaire_paiement && (
                        <div className="sm:col-span-2">
                          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Commentaire</div>
                          <div className="text-sm text-gray-800">{dossier.commentaire_paiement}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!dossier.paiement_effectue && status === STATUS.DEVIS && (
                <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                      <FileText size={14} className="text-orange-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">Préparer le devis</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Envoyez le devis au client avec les coordonnées bancaires. Le client pourra alors effectuer son virement.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowPrepareDevis(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                  >
                    <FileText size={14} />
                    Préparer le devis
                  </button>
                </div>
              )}

              {!dossier.paiement_effectue && (
                <button
                  type="button"
                  onClick={() => setShowPaymentDialog(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#173B8C] hover:bg-[#132f73] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                >
                  <CheckCircle size={14} />
                  Confirmer la réception du paiement
                </button>
              )}
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div>
              <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider mb-6">Historique du dossier</h3>
              <Timeline events={events} />
            </div>
          )}
        </div>
      </div>

      {/* Prepare Devis Dialog */}
      <PrepareDevisDialog
        open={showPrepareDevis}
        onClose={() => setShowPrepareDevis(false)}
        dossierId={dossier.id}
        initial={{ montant: dossier.montant ?? 0, iban: dossier.iban ?? undefined, bic: dossier.bic ?? undefined, titulaire: dossier.titulaire ?? undefined, reference: dossier.reference_virement ?? dossier.numero_dossier, commentaire: dossier.commentaire_admin ?? '' }}
        onSaved={(u) => { handleDevisSaved(u); setShowPrepareDevis(false); fetchDossier() }}
      />

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeArchiveModal} />
          <div role="dialog" aria-modal="true" aria-labelledby="archive-title" className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
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
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors duration-150 ${!hasAvailableDocs || zipDownloading ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Download size={14} className={zipDownloading ? 'animate-spin' : ''} />
                  {zipDownloading ? 'Téléchargement…' : 'Télécharger le dossier ZIP'}
                </button>
                <button type="button" onClick={closeArchiveModal} className="inline-flex items-center px-3 py-2 rounded border border-gray-100 bg-white text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150">Annuler</button>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  {!hasAvailableDocs && <div className="text-sm text-gray-600">Aucun fichier non-archivé disponible.</div>}
                  <button type="button" onClick={handleConfirmArchive} disabled={!hasAvailableDocs || archiving} className={`inline-flex items-center gap-2 px-4 py-2 rounded text-white text-sm transition-colors duration-150 ${!hasAvailableDocs ? 'bg-gray-300 text-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}>
                    {archiving ? 'Archivage…' : 'Archiver les documents'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDeleteModal} />
          <div role="dialog" aria-modal="true" aria-labelledby="delete-title" className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 z-10">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                  <Trash2 size={20} />
                </div>
              </div>
              <div className="min-w-0">
                <h3 id="delete-title" className="text-lg font-semibold text-gray-900">Supprimer ce dossier ?</h3>
                <p className="mt-2 text-sm text-gray-600">Cette action est irréversible. Le dossier sera supprimé de la base de données ainsi que tous ses documents du stockage Supabase.</p>
                <p className="mt-2 text-sm text-gray-600">Avant de continuer, vous pouvez télécharger le dossier ZIP si vous souhaitez conserver une copie.</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={!hasAvailableDocs || zipDownloading || deleting}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-sm transition-colors duration-150 ${!hasAvailableDocs || zipDownloading || deleting ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Download size={14} className={zipDownloading ? 'animate-spin' : ''} />
                  {zipDownloading ? 'Téléchargement…' : 'Télécharger le dossier ZIP'}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="inline-flex items-center px-3 py-2 rounded border border-gray-100 bg-white text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-60"
                >
                  Annuler
                </button>
              </div>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded text-white text-sm transition-colors duration-150 ${deleting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <Trash2 size={14} />
                {deleting ? 'Suppression…' : 'Supprimer le dossier'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentDialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} dossierId={dossier.id} onSaved={handlePaymentSaved} />
      <EditDossierDialog open={showEditDialog} onClose={closeEdit} dossier={dossier} section={editSection} onSaved={handleSaved} />
    </div>
  )
}
