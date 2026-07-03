'use client'

import { ModePaiement, WizardData, TypeProjet } from './types'
import SummaryCard from './SummaryCard'

interface StepPaiementProps {
  data: WizardData
  tarif: number | null
  onSubmit: (modePaiement: ModePaiement) => void
  onPrev: () => void
  loading: boolean
  error: string | null
}

export default function StepPaiement({ data, tarif, onSubmit, onPrev, loading, error }: StepPaiementProps) {
  const surfaceNum = parseFloat(data.surface)
  const needsDevis = !isNaN(surfaceNum) && surfaceNum > 150

  const handleSelect = (mode: ModePaiement) => {
    if (!loading) onSubmit(mode)
  }

  if (needsDevis) {
    return (
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">Paiement</h2>
        </div>
        <SummaryCard data={data} tarif={null} />
        <div className="flex gap-4 p-6 bg-amber-50 border border-amber-200 rounded-2xl mb-8">
          <div className="text-3xl shrink-0">📬</div>
          <div>
            <h3 className="font-bold text-amber-900 mb-1">Devis personnalisé</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Votre projet dépasse 150 m² et nécessite un devis personnalisé. Notre équipe vous recontactera rapidement pour établir un devis adapté.
            </p>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onPrev}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Précédent
          </button>
          <button
            type="button"
            onClick={() => handleSelect('VIREMENT')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Envoi en cours…
              </>
            ) : (
              <>
                Envoyer ma demande
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-2">
          Paiement
        </h2>
        <p className="text-gray-500 text-base">
          Choisissez votre mode de paiement pour finaliser votre dossier.
        </p>
      </div>

      <SummaryCard data={data} tarif={tarif} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Carte bancaire */}
        <button
          type="button"
          onClick={() => handleSelect('CARTE')}
          disabled={loading}
          className="group text-left p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#1e3a5f]/40 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#1e3a5f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">💳 Carte bancaire</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Paiement sécurisé via Stripe. Visa, Mastercard, American Express.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Paiement chiffré 3D Secure
          </div>
        </button>

        {/* Virement */}
        <button
          type="button"
          onClick={() => handleSelect('VIREMENT')}
          disabled={loading}
          className="group text-left p-6 rounded-2xl border-2 border-gray-100 bg-white hover:border-[#1e3a5f]/40 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="w-12 h-12 rounded-xl bg-[#7b2020]/10 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-[#7b2020]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">🏦 Virement bancaire</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Virement via Wise. Les coordonnées vous seront communiquées après validation.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dossier créé immédiatement
          </div>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 py-4 text-sm text-gray-500">
          <svg className="animate-spin w-5 h-5 text-[#1e3a5f]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Création du dossier en cours…
        </div>
      )}

      {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Précédent
        </button>
      </div>
    </div>
  )
}
