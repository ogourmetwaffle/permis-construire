import React from 'react'
import { CreditCard, FileText, Toolbox, Paperclip, CheckCircle, XCircle } from 'lucide-react'

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

export type Status =
  | 'EN_ATTENTE_PAIEMENT'
  | 'NOUVEAU'
  | 'EN_COURS'
  | 'INFORMATIONS_MANQUANTES'
  | 'TERMINE'
  | 'REFUSE'

export const STATUS = {
  EN_ATTENTE_PAIEMENT: 'EN_ATTENTE_PAIEMENT',
  NOUVEAU: 'NOUVEAU',
  EN_COURS: 'EN_COURS',
  INFORMATIONS_MANQUANTES: 'INFORMATIONS_MANQUANTES',
  TERMINE: 'TERMINE',
  REFUSE: 'REFUSE',
} as const

export const STATUS_ORDER: Status[] = [
  STATUS.EN_ATTENTE_PAIEMENT,
  STATUS.NOUVEAU,
  STATUS.EN_COURS,
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
  EN_ATTENTE_PAIEMENT: {
    label: 'Paiement',
    icon: CreditCard,
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'ring-amber-100',
    showOnDashboard: true,
    order: 1,
  },
  NOUVEAU: {
    label: 'Nouveau',
    icon: FileText,
    badgeClass: 'bg-blue-50 text-blue-800 ring-blue-100',
    textClass: 'text-blue-800',
    borderClass: 'ring-blue-100',
    showOnDashboard: true,
    order: 2,
  },
  EN_COURS: {
    label: 'En cours',
    icon: Toolbox,
    badgeClass: 'bg-indigo-50 text-indigo-800 ring-indigo-100',
    textClass: 'text-indigo-800',
    borderClass: 'ring-indigo-100',
    showOnDashboard: true,
    order: 3,
  },
  INFORMATIONS_MANQUANTES: {
    label: 'À compléter',
    icon: Paperclip,
    badgeClass: 'bg-violet-50 text-violet-800 ring-violet-100',
    textClass: 'text-violet-800',
    borderClass: 'ring-violet-100',
    showOnDashboard: false,
    order: 4,
  },
  TERMINE: {
    label: 'Terminé',
    icon: CheckCircle,
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    textClass: 'text-emerald-700',
    borderClass: 'ring-emerald-100',
    showOnDashboard: true,
    order: 5,
  },
  REFUSE: {
    label: 'Refusé',
    icon: XCircle,
    badgeClass: 'bg-red-50 text-red-700 ring-red-100',
    textClass: 'text-red-700',
    borderClass: 'ring-red-100',
    showOnDashboard: false,
    order: 6,
  },
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

export default {
  STATUS,
  STATUS_ORDER,
  STATUS_CONFIG,
  normalizeStatus,
  getStatusConfig,
  isFinished,
}
