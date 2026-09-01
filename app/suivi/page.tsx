"use client"

import React, { useState } from 'react'
import Header from '@/components/Header'
import { normalizeStatus, STATUS, getStatusConfig, CLIENT_STATUS_LABELS } from '@/lib/status'
import { Lock, Search, CheckCircle2, Clock, FileText, CreditCard, Banknote, FolderOpen } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

type Dossier = {
  id: number | string
  numero_dossier: string
  statut?: string
  montant?: number | null
  montant_acompte?: number | null
  iban?: string | null
  bic?: string | null
  titulaire?: string | null
  reference_virement?: string | null
  commentaire_admin?: string | null
  commentaire_statut?: string | null
  paiement_effectue?: boolean
  declarations?: Array<{ id: number; reference: string; montant?: number | null; date_declaration?: string | null; created_at?: string }>
  historique?: Array<{ id: number; action: string; description?: string; acteur_type?: string; metadata?: Record<string, unknown>; created_at?: string }>
}

type Step = {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const timelineSteps: Step[] = [
  { id: 'received', label: 'Dossier reçu', icon: CheckCircle2 },
  { id: 'study', label: 'Étude de votre projet', icon: Clock },
  { id: 'devis', label: 'Devis', icon: FileText },
  { id: 'payment', label: 'Paiement', icon: CreditCard },
  { id: 'processing', label: 'Traitement du dossier', icon: Banknote },
  { id: 'done', label: 'Terminé', icon: CheckCircle2 },
]

function getStepStatus(dossier: Dossier, stepId: string): 'completed' | 'active' | 'pending' {
  const s = normalizeStatus(dossier.statut)

  if (stepId === 'received') return 'completed'

  if (s === STATUS.INFORMATIONS_MANQUANTES) {
    if (stepId === 'processing') return 'active'
    if (stepId === 'done') return 'pending'
    return 'completed'
  }

  if (stepId === 'study') {
    if (s === STATUS.DEVIS || s === STATUS.EN_ATTENTE_PAIEMENT || s === STATUS.EN_ATTENTE_VERIFICATION_PAIEMENT || s === STATUS.NOUVEAU || s === STATUS.EN_COURS || s === STATUS.SOLDE_A_PAYER) return 'active'
    return 'pending'
  }

  if (stepId === 'devis') {
    if (s === STATUS.EN_ATTENTE_PAIEMENT || s === STATUS.EN_ATTENTE_VERIFICATION_PAIEMENT || s === STATUS.NOUVEAU || s === STATUS.EN_COURS || s === STATUS.SOLDE_A_PAYER) return 'completed'
    if (s === STATUS.DEVIS) return 'active'
    return 'pending'
  }

  if (stepId === 'payment') {
    if (s === STATUS.NOUVEAU || s === STATUS.EN_COURS || s === STATUS.TERMINE) return 'completed'
    if (s === STATUS.EN_ATTENTE_VERIFICATION_PAIEMENT || s === STATUS.SOLDE_A_PAYER) return 'active'
    if (s === STATUS.EN_ATTENTE_PAIEMENT) return 'active'
    return 'pending'
  }

  if (stepId === 'processing') {
    if (s === STATUS.EN_COURS || s === STATUS.DEPOT_MAIRIE || s === STATUS.TERMINE) return 'active'
    if (s === STATUS.NOUVEAU || s === STATUS.SOLDE_A_PAYER) return 'pending'
    return 'pending'
  }

  if (stepId === 'done') {
    if (s === STATUS.TERMINE) return 'completed'
    return 'pending'
  }

  return 'pending'
}

export default function SuiviPage() {
  const [numero, setNumero] = useState('')
  const [pwd, setPwd] = useState('')
  const [loading, setLoading] = useState(false)
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showDeclare, setShowDeclare] = useState(false)
  const [decl, setDecl] = useState({ date: '', reference: '', montant: '' })
  const [trackingFiles, setTrackingFiles] = useState<File[]>([])
  const [uploadingTracking, setUploadingTracking] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [trackingUploadKey, setTrackingUploadKey] = useState(0)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/dossiers/suivi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero, mot_de_passe: pwd }) })
      const j = await resp.json()
      if (!resp.ok) { setMessage(j?.error || 'Erreur'); setDossier(null); setLoading(false); return }
      setDossier(j.dossier)
    } catch {
      setMessage('Erreur réseau')
      setDossier(null)
    } finally { setLoading(false) }
  }

  const submitDeclaration = async () => {
    if (!dossier) return
    setLoading(true)
    setMessage(null)
    try {
      const montantNum = decl.montant ? Number(decl.montant) : null
      if (!decl.date) { setMessage('La date du virement est obligatoire'); setLoading(false); return }
      if (!decl.reference || !decl.reference.trim()) { setMessage('La référence du virement est obligatoire'); setLoading(false); return }
      if (montantNum == null || Number.isNaN(montantNum) || montantNum <= 0) { setMessage('Le montant du virement est obligatoire et doit être positif'); setLoading(false); return }

      const resp = await fetch(`/api/dossiers/${encodeURIComponent(String(dossier.id))}/declarer-virement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mot_de_passe: pwd, date: decl.date, reference: decl.reference, montant: montantNum }),
      })
      const j = await resp.json()
      if (!resp.ok) { setMessage(j?.error || 'Erreur'); setLoading(false); return }
      setMessage('Déclaration envoyée. L\'administration vérifiera votre virement.')
      setShowDeclare(false)
    } catch {
      setMessage('Erreur réseau')
    } finally { setLoading(false) }
  }

  const status = dossier ? normalizeStatus(dossier.statut) : undefined
  const cfg = dossier ? getStatusConfig(dossier.statut) : null
  const clientLabel = dossier && status ? CLIENT_STATUS_LABELS[status] : undefined

  const formatHistoriqueDate = (dateStr?: string) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatHistoriqueTime = (dateStr?: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const getHistoriqueTitle = (action?: string) => {
    switch (action) {
      case 'DOSSIER_DEPOSE':
        return 'Dossier déposé'
      case 'DEVIS_ENVOYE':
        return 'Devis envoyé'
      case 'VIREMENT_DECLARE':
        return 'Déclaration de virement'
      case 'PAIEMENT_CONFIRME':
        return 'Paiement confirmé'
      case 'ACOMPTE_PAYE':
        return 'Accompte payé'
      case 'SOLDE_PAYE':
        return 'Solde payé'
      case 'DEMANDE_SOLDE':
        return 'Demande de solde'
      case 'STATUT_MODIFIE':
        return 'Statut modifié'
      default:
        return action || 'Événement'
    }
  }

  const total = Number(dossier?.montant) || 0
  const acompte = Number(dossier?.montant_acompte) || 0
  const hasAcompte = acompte > 0

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Header />
      <div className="pt-24">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:py-16">
          {!dossier ? (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e3a5f] mb-3">Suivez votre dossier</h1>
                <p className="text-gray-500 text-base">Retrouvez l&apos;avancement de votre projet en quelques secondes.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label htmlFor="numero" className="block text-sm font-medium text-gray-700 mb-1.5">Numéro de dossier</label>
                    <input
                      id="numero"
                      value={numero}
                      onChange={e => setNumero(e.target.value)}
                      placeholder="Ex: PE-1787319666089"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="pwd" className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe de suivi</label>
                    <input
                      id="pwd"
                      type="password"
                      value={pwd}
                      onChange={e => setPwd(e.target.value)}
                      placeholder="Mot de passe reçu par email"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                        Chargement…
                      </>
                    ) : (
                      <>
                        <Search size={16} />
                        Accéder à mon dossier
                      </>
                    )}
                  </button>

                  {message && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">{message}</div>
                  )}
                </form>

                <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
                  <Lock size={14} className="shrink-0" />
                  <span>Vos informations sont sécurisées.</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Dossier Identification - Compact Zone */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center shrink-0">
                      <FolderOpen size={20} className="text-[#1e3a5f]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mon dossier</p>
                      <p className="text-xl font-bold text-[#1e3a5f] tracking-tight">{dossier.numero_dossier}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Suivi de votre demande</p>
                    </div>
                  </div>
                  {clientLabel && cfg && (
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ring-1 ring-inset ${cfg.badgeClass}`}>
                        {cfg.icon && React.createElement(cfg.icon, { width: 16, height: 16, className: 'shrink-0' })}
                        {clientLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Context */}
              {status === STATUS.INFORMATIONS_MANQUANTES && (
                <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={18} className="text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-violet-800 mb-1">Informations manquantes</p>
                      <p className="text-sm text-violet-700 leading-relaxed">Votre dossier nécessite des informations complémentaires.</p>
                      {dossier.commentaire_statut && (
                        <div className="mt-3 p-3 bg-white/70 rounded-lg border border-violet-100">
                          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-1">Commentaire de l&apos;administration</p>
                          <p className="text-sm text-violet-800 whitespace-pre-line">{dossier.commentaire_statut}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.DEVIS && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-800 mb-1">En cours d&apos;étude</p>
                      <p className="text-sm text-amber-700 leading-relaxed">Votre dossier est actuellement étudié par notre équipe. Vous serez informé par email dès que votre devis sera disponible.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.EN_ATTENTE_PAIEMENT && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">En attente de paiement</p>
                      <p className="text-sm text-blue-700 leading-relaxed">Votre devis est disponible. Veuillez effectuer le virement selon les coordonnées ci-dessous.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.EN_ATTENTE_VERIFICATION_PAIEMENT && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-800 mb-1">Paiement en cours de vérification</p>
                      <p className="text-sm text-orange-700 leading-relaxed">Merci, votre déclaration de virement a bien été transmise. L&apos;administration vérifiera votre virement.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.SOLDE_A_PAYER && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={18} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-800 mb-1">Accompte payé</p>
                      <p className="text-sm text-orange-700 leading-relaxed">Votre acompte a bien été reçu. Veuillez régler le solde restant pour finaliser votre dossier.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.NOUVEAU && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 mb-1">Paiement confirmé</p>
                      <p className="text-sm text-emerald-700 leading-relaxed">Votre dossier va maintenant être traité par notre équipe.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.EN_COURS && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={18} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-800 mb-1">En cours de traitement</p>
                      <p className="text-sm text-indigo-700 leading-relaxed">Votre dossier est en cours de traitement par notre équipe.</p>
                    </div>
                  </div>
                </div>
              )}

              {status === STATUS.TERMINE && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 mb-1">Dossier terminé</p>
                      <p className="text-sm text-emerald-700 leading-relaxed">Votre dossier est terminé. Merci pour votre confiance.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details - EN_ATTENTE_PAIEMENT */}
              {status === STATUS.EN_ATTENTE_PAIEMENT && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider">Coordonnées bancaires</h3>
                  <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5 space-y-3">
                    {hasAcompte ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Acompte à régler</span>
                          <span className="text-lg font-bold text-[#1e3a5f]">{acompte.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant total du devis</span>
                          <span className="text-sm font-medium text-gray-800">{total.toLocaleString('fr-FR')} €</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solde restant</span>
                          <span className="text-sm font-medium text-gray-800">{(total - acompte).toLocaleString('fr-FR')} €</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant</span>
                        <span className="text-lg font-bold text-[#1e3a5f]">{total.toLocaleString('fr-FR')} €</span>
                      </div>
                    )}
                    {dossier.titulaire && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titulaire</span>
                        <span className="text-sm font-medium text-gray-800">{dossier.titulaire}</span>
                      </div>
                    )}
                    {dossier.iban && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">IBAN</span>
                        <span className="text-sm font-medium text-gray-800 font-mono break-all text-right">{dossier.iban}</span>
                      </div>
                    )}
                    {dossier.bic && (
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">BIC</span>
                        <span className="text-sm font-medium text-gray-800 font-mono break-all text-right">{dossier.bic}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Référence</span>
                      <span className="text-sm font-medium text-gray-800 font-mono break-all text-right">{dossier.reference_virement || dossier.numero_dossier}</span>
                    </div>
                    {dossier.commentaire_admin && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Commentaire</div>
                        <p className="text-sm text-gray-800 whitespace-pre-line">{dossier.commentaire_admin}</p>
                      </div>
                    )}
                  </div>

                  {!showDeclare ? (
                    <button
                      type="button"
                      onClick={() => setShowDeclare(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md"
                    >
                      <CheckCircle2 size={16} />
                      J&apos;ai effectué mon virement
                    </button>
                  ) : (
                    <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5 space-y-4">
                      <h4 className="text-sm font-semibold text-[#1e3a5f]">Déclarer un virement</h4>
                      {hasAcompte && (
                        <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                          Le montant attendu pour cet acompte est de <strong>{acompte.toLocaleString('fr-FR')} €</strong>.
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="decl-date" className="block text-xs font-medium text-gray-500 mb-1">Date du virement <span className="text-red-600">*</span></label>
                          <input id="decl-date" type="date" value={decl.date} onChange={e => setDecl(s => ({ ...s, date: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]" required />
                        </div>
                        <div>
                          <label htmlFor="decl-ref" className="block text-xs font-medium text-gray-500 mb-1">Référence <span className="text-red-600">*</span></label>
                          <input id="decl-ref" value={decl.reference} onChange={e => setDecl(s => ({ ...s, reference: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]" required />
                        </div>
                        <div>
                          <label htmlFor="decl-montant" className="block text-xs font-medium text-gray-500 mb-1">Montant <span className="text-red-600">*</span></label>
                          <input id="decl-montant" value={decl.montant} onChange={e => setDecl(s => ({ ...s, montant: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]" required />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={submitDeclaration} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-60">
                          {loading ? 'Envoi…' : 'Envoyer la déclaration'}
                        </button>
                        <button type="button" onClick={() => setShowDeclare(false)} className="px-5 py-2.5 border border-gray-200 bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details - SOLDE_A_PAYER */}
              {status === STATUS.SOLDE_A_PAYER && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider">Paiement</h3>
                  <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Accompte payé</span>
                      <span className="text-lg font-bold text-green-700">{acompte.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant total</span>
                      <span className="text-sm font-medium text-gray-800">{total.toLocaleString('fr-FR')} €</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Solde restant</span>
                      <span className="text-sm font-medium text-gray-800">{(total - acompte).toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>

                  {dossier.iban && (
                    <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5 space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coordonnées bancaires</h4>
                      {dossier.titulaire && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Titulaire</span>
                          <span className="text-sm font-medium text-gray-800">{dossier.titulaire}</span>
                        </div>
                      )}
                      {dossier.iban && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">IBAN</span>
                          <span className="text-sm font-medium text-gray-800 font-mono break-all text-right">{dossier.iban}</span>
                        </div>
                      )}
                      {dossier.bic && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">BIC</span>
                          <span className="text-sm font-medium text-gray-800 font-mono break-all text-right">{dossier.bic}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">Référence</span>
                        <span className="text-sm font-medium text-gray-800 font-mono break-all text-right">{dossier.reference_virement || dossier.numero_dossier}</span>
                      </div>
                    </div>
                  )}

                  {!showDeclare ? (
                    <button
                      type="button"
                      onClick={() => { setShowDeclare(true); setDecl({ date: '', reference: '', montant: String(total - acompte) }) }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:shadow-md"
                    >
                      <CheckCircle2 size={16} />
                      J&apos;ai effectué mon virement pour le solde
                    </button>
                  ) : (
                    <div className="bg-[#f5f6f8] rounded-xl border border-gray-100 p-5 space-y-4">
                      <h4 className="text-sm font-semibold text-[#1e3a5f]">Déclarer le virement du solde</h4>
                      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                        Le montant attendu pour le solde est de <strong>{(total - acompte).toLocaleString('fr-FR')} €</strong>.
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="decl-date" className="block text-xs font-medium text-gray-500 mb-1">Date du virement <span className="text-red-600">*</span></label>
                          <input id="decl-date" type="date" value={decl.date} onChange={e => setDecl(s => ({ ...s, date: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]" required />
                        </div>
                        <div>
                          <label htmlFor="decl-ref" className="block text-xs font-medium text-gray-500 mb-1">Référence <span className="text-red-600">*</span></label>
                          <input id="decl-ref" value={decl.reference} onChange={e => setDecl(s => ({ ...s, reference: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]" required />
                        </div>
                        <div>
                          <label htmlFor="decl-montant" className="block text-xs font-medium text-gray-500 mb-1">Montant <span className="text-red-600">*</span></label>
                          <input id="decl-montant" value={decl.montant} onChange={e => setDecl(s => ({ ...s, montant: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]" required />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={submitDeclaration} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-60">
                          {loading ? 'Envoi…' : 'Envoyer la déclaration'}
                        </button>
                        <button type="button" onClick={() => setShowDeclare(false)} className="px-5 py-2.5 border border-gray-200 bg-white text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Zone - INFORMATIONS_MANQUANTES */}
              {status === STATUS.INFORMATIONS_MANQUANTES && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider">Documents</h3>
                  <FileUpload key={trackingUploadKey} onFilesChange={(f: File[]) => setTrackingFiles(f)} />
                  <button
                    type="button"
                    onClick={() => {
                      if (!dossier || trackingFiles.length === 0) return
                      setUploadingTracking(true)
                      setUploadProgress(0)
                      setMessage(null)
                      try {
                        const form = new FormData()
                        form.append('mot_de_passe', pwd)
                        trackingFiles.forEach(f => form.append('files', f))
                        const xhr = new XMLHttpRequest()
                        xhr.open('POST', `/api/dossiers/${encodeURIComponent(String(dossier.id))}/upload-documents`)
                        xhr.upload.onprogress = (e: ProgressEvent) => {
                          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
                        }
                        xhr.onload = () => {
                          setUploadingTracking(false)
                          let j: { error?: string } | null = null
                          try { j = JSON.parse(xhr.responseText) } catch { /* ignore */ }
                          if (xhr.status >= 200 && xhr.status < 300) {
                            setMessage('Documents envoyés. Votre dossier va être réexaminé.')
                            setTrackingFiles([])
                            setTrackingUploadKey(k => k + 1)
                            setDossier((prev) => prev ? { ...prev, statut: STATUS.EN_COURS } : prev)
                          } else {
                            setMessage(j?.error || 'Erreur')
                          }
                        }
                        xhr.onerror = () => {
                          setUploadingTracking(false)
                          setMessage('Erreur réseau')
                        }
                        xhr.send(form)
                      } catch {
                        setUploadingTracking(false)
                        setMessage('Erreur réseau')
                      }
                    }}
                    disabled={uploadingTracking || trackingFiles.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-60"
                  >
                    {uploadingTracking ? 'Envoi…' : 'Envoyer les documents'}
                  </button>

                  {uploadingTracking && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Téléversement en cours…</span>
                        <span className="font-medium text-gray-700">{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7b2020] rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider mb-6">Avancement du dossier</h3>
                <div className="space-y-0">
                  {timelineSteps.map((step, idx) => {
                    const stepStatus = getStepStatus(dossier, step.id)
                    const Icon = step.icon
                    const isLast = idx === timelineSteps.length - 1

                    return (
                      <div key={step.id} className="relative flex gap-4">
                        {!isLast && (
                          <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200" aria-hidden="true" />
                        )}
                        <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-2 ${
                          stepStatus === 'completed' ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white' :
                          stepStatus === 'active' ? 'bg-white border-[#1e3a5f] text-[#1e3a5f]' :
                          'bg-white border-gray-200 text-gray-300'
                        }`}>
                          <Icon size={14} />
                        </div>
                        <div className={`pt-1 pb-6 ${isLast ? '' : 'border-b border-gray-50'}`}>
                          <p className={`text-sm font-medium ${stepStatus === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{step.label}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Historique client */}
              {dossier.historique && dossier.historique.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider mb-6">Historique</h3>
                  <div className="space-y-0">
                    {dossier.historique.map((event) => (
                      <div key={event.id} className="relative flex gap-4">
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200 last:bg-transparent" aria-hidden="true" />
                        <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 border-2 bg-blue-500 border-blue-500 text-white">
                          <CheckCircle2 size={14} />
                        </div>
                         <div className="pt-1 pb-6">
                            <div className="text-sm font-semibold text-gray-800 mb-0.5">{getHistoriqueTitle(event.action)}</div>
                            <div className="text-xs text-gray-400 mb-1">
                              {event.action === 'DOSSIER_DEPOSE' && event.metadata?.date_creation
                                ? formatHistoriqueDate(event.metadata.date_creation as string)
                                : `${formatHistoriqueDate(event.created_at)} ${formatHistoriqueTime(event.created_at)}`}
                            </div>
                            {event.description && <p className="text-xs text-gray-500 leading-relaxed">{event.description}</p>}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Declarations de virement (legacy display, kept for redundancy) */}
              {dossier.declarations && dossier.declarations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  <h3 className="text-sm font-semibold text-[#1e3a5f] uppercase tracking-wider mb-4">Déclarations de virement</h3>
                  <div className="space-y-3">
                    {dossier.declarations.map((d) => (
                      <div key={d.id} className="flex items-center justify-between p-3 bg-[#f5f6f8] rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">Réf: {d.reference}</p>
                          <p className="text-xs text-gray-500">Montant: {d.montant ?? '-'} €</p>
                        </div>
                        <div className="text-xs text-gray-400 text-right">
                          {d.date_declaration ? new Date(d.date_declaration).toLocaleDateString('fr-FR') : d.created_at ? new Date(d.created_at).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {message && (
                <div className={`text-sm px-4 py-3 rounded-xl border ${message.includes('envoyée') ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-100'}`}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
