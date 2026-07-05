"use client"

import React, { useEffect, useState } from 'react'
import DocumentList from './DocumentList'
import { CheckCircle, XCircle, Mail, Download, CreditCard, Archive, User, Calendar, FileText, Tag, Clock, BarChart2 } from 'lucide-react'
import StatusSelector from './StatusSelector'
import { supabase } from '@/lib/supabase'
import { getStatusConfig, normalizeStatus } from '@/lib/status'

type Dossier = {
  id: string
  numero_dossier: string
  nom: string
  prenom: string
  email?: string
  telephone?: string
  pays_permis?: string
  montant?: number
  paiement_effectue?: boolean
  date_paiement?: string
  stripe_payment_id?: string
  stripe_session_id?: string
  statut?: string
  created_at?: string
}

export default function AdminDossierDetail({ id, onUpdated }: { id: string; onUpdated?: () => void }) {
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDossier = async () => {
      setLoading(true)
      console.log('[AdminDossierDetail] fetchDossier start for id=', id)
      try {
        const session = await supabase.auth.getSession()
        const token = session.data?.session?.access_token
        console.log('[AdminDossierDetail] session fetched, token present=', !!token)
        if (!token) {
          console.error('[AdminDossierDetail] No session token')
          setDossier(null)
          setLoading(false)
          return
        }

        const res = await fetch('/api/admin/dossiers', { headers: { Authorization: `Bearer ${token}` } })
        console.log('[AdminDossierDetail] fetch /api/admin/dossiers status=', res.status)
        if (res.status === 401) {
          console.error('[AdminDossierDetail] Unauthorized when fetching dossier')
          setDossier(null)
          setLoading(false)
          return
        }

        const json = await res.json()
        console.log('[AdminDossierDetail] api response ok=', json?.ok, 'dataLength=', Array.isArray(json?.data) ? json.data.length : 'n/a')
        if (!json.ok) {
          console.error('[AdminDossierDetail] api admin dossiers error', json.error)
          setDossier(null)
          setLoading(false)
          return
        }

        const all: Dossier[] = json.data || []
        console.log('[AdminDossierDetail] received dossiers count=', all.length, 'sample=', all.slice(0,3).map(d=>({id:d.id, numero_dossier:d.numero_dossier})))
        // Support fetching by numeric id or by numero_dossier (PE-...)
        const searchBy = (typeof id === 'string' && id.startsWith('PE-')) ? 'numero_dossier' : 'id'
        console.log('[AdminDossierDetail] searching by', searchBy, 'for value=', id)
        const found = all.find((d) => (typeof id === 'string' && id.startsWith('PE-') ? d.numero_dossier === id : String(d.id) === String(id)))
        console.log('[AdminDossierDetail] found=', found)
        setDossier(found || null)
      } catch (err) {
        console.error('[AdminDossierDetail] fetch dossier error', err)
        setDossier(null)
      }
      setLoading(false)
    }
    fetchDossier()
  }, [id])

  if (loading) return <div className="p-4">Chargement...</div>
  if (!dossier) return <div className="p-4 text-gray-600">Dossier introuvable.</div>

  // Helper function to render status badge
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

  // Helper function to render payment badge
  const renderPaymentBadge = () => {
    const base = 'inline-flex items-center h-6 px-3 rounded-full text-[12px] font-semibold shadow-sm ring-1 ring-inset whitespace-nowrap'
    if (dossier.paiement_effectue) {
      return (
        <span className={`${base} bg-green-50 text-green-700 ring-green-100`}>
          <CheckCircle width={16} height={16} className="mr-1.5" />Payé
        </span>
      )
    } else {
      return (
        <span className={`${base} bg-red-50 text-red-700 ring-red-100`}>
          <XCircle width={16} height={16} className="mr-1.5" />Non payé
        </span>
      )
    }
  }

  // Format date
  const formattedDate = dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR') : '-'

  return (
    <div className="w-full">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8 pb-6 border-b border-gray-100">

        {/* Identification */}
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Dossier</div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{dossier.numero_dossier}</h1>
          </div>
          <div className="flex items-center gap-2">
            {renderStatusBadge()}
            {renderPaymentBadge()}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} className="shrink-0" />
            <span>Créé le {formattedDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={`mailto:${dossier.email}`}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap"
          >
            <Mail size={14} /><span>Email</span>
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap"
          >
            <Download size={14} /><span>Télécharger ZIP</span>
          </button>
          <a
            href={dossier.stripe_payment_id ? `https://dashboard.stripe.com/payments/${dossier.stripe_payment_id}` : '#'}
            target={dossier.stripe_payment_id ? '_blank' : undefined}
            rel={dossier.stripe_payment_id ? 'noreferrer' : undefined}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap"
          >
            <CreditCard size={14} /><span>Paiement</span>
          </a>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors whitespace-nowrap"
          >
            <Archive size={14} /><span>Archiver</span>
          </button>
        </div>
      </div>

      {/* ── MAIN GRID 70 / 30 ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* ── LEFT COLUMN ─────────────────────────────────────────────── */}
        <div className="space-y-6 min-w-0">

          {/* Informations client */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Informations client</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
              <div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nom complet</div>
                <div className="text-sm font-semibold text-gray-900">{dossier.nom} {dossier.prenom}</div>
              </div>
              {dossier.email && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</div>
                  <div className="text-sm text-gray-800 break-all">{dossier.email}</div>
                </div>
              )}
              {dossier.telephone && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Téléphone</div>
                  <div className="text-sm text-gray-800">{dossier.telephone}</div>
                </div>
              )}
              {dossier.pays_permis && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pays</div>
                  <div className="text-sm text-gray-800">{dossier.pays_permis}</div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <FileText size={14} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Documents</h3>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors"
              >
                <Download size={12} />
                Tout télécharger
              </button>
            </div>
            <DocumentList numero={dossier.numero_dossier} />
          </div>

          {/* Historique */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <Clock size={14} className="text-gray-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Historique</h3>
            </div>
            {/* Timeline */}
            <div className="relative pl-8">
              <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200" />
              {/* ● Dossier créé */}
              <div className="relative mb-7 last:mb-0">
                <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white shadow-sm" />
                <div className="text-sm font-semibold text-gray-800 mb-0.5">Dossier créé</div>
                <div className="text-xs text-gray-400 mb-1.5">{formattedDate}</div>
                <p className="text-xs text-gray-500 leading-relaxed">Dossier {dossier.numero_dossier} déposé en ligne.</p>
              </div>
              {/* ● Paiement reçu */}
              {dossier.paiement_effectue && (
                <div className="relative last:mb-0">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-green-500 ring-2 ring-white shadow-sm" />
                  <div className="text-sm font-semibold text-gray-800 mb-0.5">Paiement reçu</div>
                  {dossier.date_paiement && (
                    <div className="text-xs text-gray-400 mb-1.5">{dossier.date_paiement}</div>
                  )}
                  <p className="text-xs text-gray-500 leading-relaxed">Paiement de {dossier.montant ?? 49}€ confirmé.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Paiement */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <CreditCard size={14} className="text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Paiement</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Montant</span>
                <span className="text-lg font-bold text-gray-900">{dossier.montant ?? 49} €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Statut</span>
                {dossier.paiement_effectue ? (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold bg-green-50 text-green-700 ring-1 ring-inset ring-green-100">
                    <CheckCircle size={12} />Payé
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100">
                    <XCircle size={12} />En attente
                  </span>
                )}
              </div>
              {dossier.date_paiement && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date</span>
                  <span className="text-xs text-gray-700">{dossier.date_paiement}</span>
                </div>
              )}
              {dossier.stripe_payment_id && (
                <div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Réf. Stripe</div>
                  <div className="text-[11px] font-mono text-gray-600 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 truncate">
                    {dossier.stripe_payment_id}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                <Tag size={14} className="text-orange-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Statut dossier</h3>
            </div>
            <StatusSelector currentStatus={dossier.statut} dossierId={dossier.id} onUpdated={onUpdated} />
          </div>

          {/* Résumé */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-100">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                <BarChart2 size={14} className="text-purple-500" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">Résumé</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Déposé le</span>
                <span className="text-xs font-medium text-gray-800">{formattedDate}</span>
              </div>
              {dossier.pays_permis && (
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-gray-500">Pays</span>
                  <span className="text-xs font-medium text-gray-800">{dossier.pays_permis}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Montant</span>
                <span className="text-sm font-bold text-gray-900">{dossier.montant ?? 49} €</span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-xs text-gray-500">Paiement</span>
                <span className={`text-xs font-semibold ${dossier.paiement_effectue ? 'text-green-600' : 'text-amber-500'}`}>
                  {dossier.paiement_effectue ? 'Confirmé' : 'En attente'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
