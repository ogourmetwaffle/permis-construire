export type TypeClient = 'PARTICULIER' | 'PROFESSIONNEL'
export type TypeProjet = 'DP' | 'PCMI'
export type ModePaiement = 'CARTE' | 'VIREMENT'

export interface WizardData {
  typeClient: TypeClient | ''
  typeProjet: TypeProjet | ''
  nom: string
  prenom: string
  email: string
  telephone: string
  dateNaissance: string
  adresseProjet: string
  adresseClient: string
  numeroParcelle: string
  surface: string
  description: string
  files: File[]
  modePaiement: ModePaiement | ''
}

export const WIZARD_INITIAL_DATA: WizardData = {
  typeClient: '',
  typeProjet: '',
  nom: '',
  prenom: '',
  email: '',
  telephone: '',
  dateNaissance: '',
  adresseProjet: '',
  adresseClient: '',
  numeroParcelle: '',
  surface: '',
  description: '',
  files: [],
  modePaiement: '',
}

export const STEP_LABELS = [
  { step: 1, label: 'Profil' },
  { step: 2, label: 'Projet' },
  { step: 3, label: 'Infos' },
  { step: 4, label: 'Détails' },
  { step: 5, label: 'Documents' },
  { step: 6, label: 'Paiement' },
]

export const TOTAL_STEPS = 6
