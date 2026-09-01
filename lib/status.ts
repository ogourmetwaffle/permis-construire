import React from 'react'
import { CreditCard, FileText, Toolbox, Paperclip, CheckCircle, XCircle, Clock } from 'lucide-react'

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export type Status =
  | 'EN_ATTENTE_PAIEMENT'
  | 'EN_ATTENTE_VERIFICATION_PAIEMENT'
  | 'DEVIS'
  | 'NOUVEAU'
  | 'EN_COURS'
  | 'DEPOT_MAIRIE'
  | 'INFORMATIONS_MANQUANTES'
  | 'EN_ATTENTE_CLIENT'
  | 'ARCHIVE'
  | 'TERMINE'
  | 'REFUSE'
  | 'SOLDE_A_PAYER'

export const STATUS = {
  DEVIS: 'DEVIS',
  EN_ATTENTE_PAIEMENT: 'EN_ATTENTE_PAIEMENT',
  EN_ATTENTE_VERIFICATION_PAIEMENT: 'EN_ATTENTE_VERIFICATION_PAIEMENT',
  NOUVEAU: 'NOUVEAU',
  EN_COURS: 'EN_COURS',
  DEPOT_MAIRIE: 'DEPOT_MAIRIE',
  INFORMATIONS_MANQUANTES: 'INFORMATIONS_MANQUANTES',
  TERMINE: 'TERMINE',
  EN_ATTENTE_CLIENT: 'EN_ATTENTE_CLIENT',
  ARCHIVE: 'ARCHIVE',
  REFUSE: 'REFUSE',
  SOLDE_A_PAYER: 'SOLDE_A_PAYER',
} as const

export const STATUS_ORDER: Status[] = [
  STATUS.EN_ATTENTE_PAIEMENT,
  STATUS.EN_ATTENTE_VERIFICATION_PAIEMENT,
  STATUS.DEVIS,
  STATUS.NOUVEAU,
  STATUS.EN_COURS,
  STATUS.DEPOT_MAIRIE,
  STATUS.INFORMATIONS_MANQUANTES,
  STATUS.TERMINE,
  STATUS.REFUSE,
]

type StatusConfig = {
  label: string
  icon: IconType
  badgeClass: string
  textClass?: string
  borderClass?: string
  showOnDashboard?: boolean
  order?: number
}

export const STATUS_CONFIG: Record<Status, StatusConfig> = {
  DEVIS: {
    label: 'Devis',
    icon: FileText,
    badgeClass: 'bg-amber-50 text-amber-800 ring-amber-100',
    textClass: 'text-amber-800',
    borderClass: 'ring-amber-100',
    showOnDashboard: true,
    order: 0,
  },
  EN_ATTENTE_PAIEMENT: {
    label: 'En attente de paiement',
    icon: CreditCard,
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'ring-amber-100',
    showOnDashboard: true,
    order: 1,
  },
  EN_ATTENTE_VERIFICATION_PAIEMENT: {
    label: 'Virement à vérifier',
    icon: Clock,
    badgeClass: 'bg-orange-50 text-orange-800 ring-orange-100',
    textClass: 'text-orange-800',
    borderClass: 'ring-orange-100',
    showOnDashboard: true,
    order: 2,
  },
  NOUVEAU: {
    label: 'Nouveau',
    icon: FileText,
    badgeClass: 'bg-blue-50 text-blue-800 ring-blue-100',
    textClass: 'text-blue-800',
    borderClass: 'ring-blue-100',
    showOnDashboard: true,
    order: 3,
  },
  EN_COURS: {
    label: 'En cours',
    icon: Toolbox,
    badgeClass: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
    textClass: 'text-indigo-800',
    borderClass: 'ring-indigo-100',
    showOnDashboard: true,
    order: 4,
  },
  INFORMATIONS_MANQUANTES: {
    label: 'À compléter',
    icon: Paperclip,
    badgeClass: 'bg-violet-50 text-violet-800 ring-violet-100',
    textClass: 'text-violet-800',
    borderClass: 'ring-violet-100',
    showOnDashboard: false,
    order: 5,
  },
  DEPOT_MAIRIE: {
    label: 'Dépôt mairie',
    icon: FileText,
    badgeClass: 'bg-teal-50 text-teal-800 ring-teal-100',
    textClass: 'text-teal-800',
    borderClass: 'ring-teal-100',
    showOnDashboard: true,
    order: 6,
  },
  EN_ATTENTE_CLIENT: {
    label: 'Validation client',
    icon: Clock,
    badgeClass: 'bg-yellow-50 text-yellow-800 ring-yellow-100',
    textClass: 'text-yellow-800',
    borderClass: 'ring-yellow-100',
    showOnDashboard: false,
    order: 7,
  },
  ARCHIVE: {
    label: 'Archivé',
    icon: XCircle,
    badgeClass: 'bg-gray-50 text-gray-700 ring-gray-100',
    textClass: 'text-gray-700',
    borderClass: 'ring-gray-100',
    showOnDashboard: false,
    order: 99,
  },
  TERMINE: {
    label: 'Terminé',
    icon: CheckCircle,
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    textClass: 'text-emerald-700',
    borderClass: 'ring-emerald-100',
    showOnDashboard: true,
    order: 8,
  },
  REFUSE: {
    label: 'Refusé',
    icon: XCircle,
    badgeClass: 'bg-red-50 text-red-700 ring-red-100',
    textClass: 'text-red-700',
    borderClass: 'ring-red-100',
    showOnDashboard: false,
    order: 9,
  },
  SOLDE_A_PAYER: {
    label: 'Solde à payer',
    icon: Clock,
    badgeClass: 'bg-orange-50 text-orange-800 ring-orange-100',
    textClass: 'text-orange-800',
    borderClass: 'ring-orange-100',
    showOnDashboard: true,
    order: 10,
  },
}

export const CLIENT_STATUS_LABELS: Record<Status, string> = {
  DEVIS: 'En cours d\'étude',
  EN_ATTENTE_PAIEMENT: 'En attente de paiement',
  EN_ATTENTE_VERIFICATION_PAIEMENT: 'Paiement en cours de vérification',
  NOUVEAU: 'Paiement confirmé',
  EN_COURS: 'En cours de traitement',
  DEPOT_MAIRIE: 'Dépôt en mairie',
  INFORMATIONS_MANQUANTES: 'Informations manquantes',
  EN_ATTENTE_CLIENT: 'Validation client',
  ARCHIVE: 'Archivé',
  TERMINE: 'Terminé',
  REFUSE: 'Refusé',
  SOLDE_A_PAYER: 'Solde à payer',
}

const LEGACY_MAP: Record<string, Status> = {
  COMPLET: STATUS.TERMINE,
  COMPLETED: STATUS.TERMINE,
  'EN ATTENTE PAIEMENT': STATUS.EN_ATTENTE_PAIEMENT,
}

export function normalizeStatus(value?: string | null): Status | undefined {
  if (!value) return undefined
  const v = String(value).trim().toUpperCase()
  if (v in STATUS) return v as Status
  if (v in LEGACY_MAP) return LEGACY_MAP[v]
  // fallback: try partial matches
  if (v.includes('ATTENTE') && v.includes('PAIEMENT')) return STATUS.EN_ATTENTE_PAIEMENT
  if (v.includes('TERM') || v.includes('COMPLET')) return STATUS.TERMINE
  if (v.includes('REFUS')) return STATUS.REFUSE
  if (v.includes('EN_COURS') || v.includes('ENCOURS') || v.includes('COUR')) return STATUS.EN_COURS
  return undefined
}

export function getStatusConfig(value?: string | null) {
  const s = normalizeStatus(value)
  if (!s) return null
  return STATUS_CONFIG[s]
}

export function isFinished(value?: string | null) {
  const s = normalizeStatus(value)
  if (!s) return false
  return s === STATUS.TERMINE || s === STATUS.REFUSE
}

const statusModule = {
  STATUS,
  STATUS_ORDER,
  STATUS_CONFIG,
  CLIENT_STATUS_LABELS,
  normalizeStatus,
  getStatusConfig,
  isFinished,
}

export default statusModule
