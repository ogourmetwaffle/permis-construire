'use client'

import { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import StepClient from './StepClient'
import StepProjet from './StepProjet'
import StepInformations from './StepInformations'
import StepDetails from './StepDetails'
import StepDocuments from './StepDocuments'
import StepPaiement from './StepPaiement'
import { WizardData, WIZARD_INITIAL_DATA, TOTAL_STEPS, STEP_LABELS, ModePaiement, TypeProjet } from './types'
import { supabase } from '@/lib/supabase'

interface VirementConfirmation {
  numeroDossier: string
  iban: string | null
  bic: string | null
  titulaire: string | null
  montant: number
}

export default function Wizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(WIZARD_INITIAL_DATA)
  const [tarif, setTarif] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [virementInfo, setVirementInfo] = useState<VirementConfirmation | null>(null)

  const handleChange = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const goNext = () => setStep(s => Math.min(s + 1, TOTAL_STEPS))
  const goPrev = () => setStep(s => Math.max(s - 1, 1))

  // Fetch tarif whenever typeClient or typeProjet changes
  useEffect(() => {
    if (!data.typeClient || !data.typeProjet) { setTarif(null); return }
    supabase
      .from('tarifs')
      .select('prix')
      .eq('type_client', data.typeClient)
      .eq('type_projet', data.typeProjet)
      .eq('actif', true)
      .single()
      .then(({ data: row }) => {
        setTarif(row ? (row as { prix: number }).prix : null)
      })
  }, [data.typeClient, data.typeProjet])

  const uploadFiles = async (numeroDossier: string) => {
    for (const file of data.files) {
      try {
        const baseName = file.name.replace(/[^a-z0-9.\-_]/gi, '_')
        const path = `${numeroDossier}/${Date.now()}_${baseName}`
        await supabase.storage.from('documents').upload(path, file, {
          contentType: file.type,
          upsert: false,
        })
      } catch (err) {
        console.error('File upload error:', err)
      }
    }
  }

  const handleSubmit = async (modePaiement: ModePaiement) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      if (modePaiement === 'VIREMENT') {
        const res = await fetch('/api/deposer-virement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            typeClient: data.typeClient,
            typeProjet: data.typeProjet,
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            dateNaissance: data.dateNaissance,
            adresseProjet: data.adresseProjet,
            adresseClient: data.adresseClient,
            numeroParcelle: data.numeroParcelle,
            surface: data.surface,
            description: data.description,
            montant: tarif ?? 0,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) {
          setSubmitError(json.error || 'Une erreur est survenue. Veuillez réessayer.')
          return
        }
        await uploadFiles(json.numeroDossier)
        setVirementInfo({
          numeroDossier: json.numeroDossier,
          iban: json.iban,
          bic: json.bic,
          titulaire: json.titulaire,
          montant: tarif ?? 0,
        })
      } else {
        // CARTE — create dossier + redirect to Stripe
        const res = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            typeClient: data.typeClient,
            typeProjet: data.typeProjet,
            nom: data.nom,
            prenom: data.prenom,
            email: data.email,
            telephone: data.telephone,
            dateNaissance: data.dateNaissance,
            adresseProjet: data.adresseProjet,
            adresseClient: data.adresseClient,
            numeroParcelle: data.numeroParcelle,
            surface: data.surface,
            description: data.description,
            montant: tarif ?? 0,
          }),
        })
        const json = await res.json()
        if (!res.ok || json.error) {
          setSubmitError(json.error || 'Erreur lors de la création du paiement.')
          return
        }
        // Upload files before redirect (best effort)
        if (json.numeroDossier) {
          await uploadFiles(json.numeroDossier)
        }
        if (json.url) {
          window.location.href = json.url
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur inattendue est survenue.'
      setSubmitError(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Virement confirmation screen
  if (virementInfo) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Success header */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">Dossier créé avec succès !</h2>
              <p className="text-gray-500 text-base">
                Votre dossier a été enregistré. Effectuez le virement pour démarrer le traitement.
              </p>
            </div>

            {/* Dossier reference */}
            <div className="flex items-center justify-between p-4 bg-[#f5f6f8] rounded-xl mb-6">
              <span className="text-sm text-gray-500">Référence dossier</span>
              <span className="text-sm font-bold text-[#1e3a5f] tracking-wide">{virementInfo.numeroDossier}</span>
            </div>

            {/* Bank details */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
              <div className="bg-[#1e3a5f] px-5 py-3">
                <h3 className="text-sm font-semibold text-white">Coordonnées bancaires Wise</h3>
              </div>
              <div className="p-5 space-y-4">
                {virementInfo.titulaire && (
                  <BankRow label="Titulaire" value={virementInfo.titulaire} />
                )}
                {virementInfo.iban && (
                  <BankRow label="IBAN" value={virementInfo.iban} mono />
                )}
                {virementInfo.bic && (
                  <BankRow label="BIC / SWIFT" value={virementInfo.bic} mono />
                )}
                <BankRow label="Montant" value={`${virementInfo.montant} € TTC`} highlight />
                <BankRow label="Référence" value={virementInfo.numeroDossier} mono />
              </div>
            </div>

            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-8">
              <span className="text-xl shrink-0">⚠️</span>
              <p className="text-sm text-amber-800">
                Indiquez impérativement la <strong>référence du dossier</strong> dans le libellé de votre virement pour un traitement rapide.
              </p>
            </div>

            <a
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3.5 rounded-xl bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    )
  }

  const stepTitle = STEP_LABELS.find(s => s.step === step)?.label ?? ''

  return (
    <div className="min-h-screen bg-[#f5f6f8] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Déposer mon dossier</p>
              <h1 className="text-lg font-bold text-[#1e3a5f] leading-tight">{stepTitle}</h1>
            </div>
          </div>
          <ProgressBar currentStep={step} />
        </div>

        {/* Step content card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {step === 1 && (
            <StepClient data={data} onChange={handleChange} onNext={goNext} />
          )}
          {step === 2 && (
            <StepProjet data={data} onChange={handleChange} onNext={goNext} onPrev={goPrev} />
          )}
          {step === 3 && (
            <StepInformations data={data} onChange={handleChange} onNext={goNext} onPrev={goPrev} />
          )}
          {step === 4 && (
            <StepDetails data={data} onChange={handleChange} onNext={goNext} onPrev={goPrev} />
          )}
          {step === 5 && (
            <StepDocuments data={data} onChange={handleChange} onNext={goNext} onPrev={goPrev} />
          )}
          {step === 6 && (
            <StepPaiement
              data={data}
              tarif={tarif}
              onSubmit={handleSubmit}
              onPrev={goPrev}
              loading={submitting}
              error={submitError}
            />
          )}
        </div>

        {/* Trust footer */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#7b2020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Paiement sécurisé
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#7b2020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Données protégées
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#7b2020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Réponse sous 24h
          </span>
        </div>
      </div>
    </div>
  )
}

function BankRow({ label, value, mono = false, highlight = false }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className={`text-sm font-semibold break-all ${mono ? 'font-mono' : ''} ${highlight ? 'text-[#7b2020]' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  )
}
