"use client"

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

function MerciContent() {
  const searchParams = useSearchParams()
  const numero = searchParams.get('numero')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    async function syncPayment() {
      if (!sessionId || !numero) return

      try {
        await fetch('/api/stripe/confirm-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, numero }),
        })
      } catch {
        // Silent fallback: webhook and admin can still reconcile payment status.
      }
    }

    syncPayment()
  }, [sessionId, numero])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-gray-50">
      <Header />

      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7b2020] text-white mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-[#0f1f35]">Merci — votre dossier a bien été reçu</h1>
            <p className="mt-3 text-sm text-gray-600">Nous vous remercions pour votre confiance. Voici la confirmation de dépôt et les prochaines étapes.</p>

            {numero ? (
              <div className="mt-6 w-full max-w-md mx-auto">
                <div className="bg-[#f4f7ff] border border-[#d6e2ff] rounded-xl px-6 py-5 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#4f6ea8]">Numéro de dossier</div>
                  <div className="mt-2 font-mono text-xl sm:text-2xl font-bold text-[#1e3a5f] tracking-wide">{numero}</div>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-sm text-gray-500">Aucun numéro de dossier fourni.</div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={numero ? `/admin/dossiers/${numero}` : '/admin'}
                className="px-5 py-3 bg-[#1e3a5f] text-white rounded-lg font-semibold shadow-sm hover:opacity-95"
              >
                Suivre l&apos;avancement
              </Link>

              <Link
                href="/deposer-dossier"
                className="px-5 py-3 border border-transparent bg-white text-[#1e3a5f] rounded-lg shadow-sm hover:bg-gray-50"
              >
                Déposer un nouveau dossier
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <h4 className="font-semibold text-gray-800">Prochaines étapes</h4>
                <ul className="mt-2 space-y-2 list-disc list-inside">
                  <li>Vérification administrative de votre dossier</li>
                  <li>Prise de contact si des documents complémentaires sont nécessaires</li>
                  <li>Traitement et instruction par nos services (délai indicatif : 2–6 semaines)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-800">Besoin d&apos;aide ?</h4>
                <p className="mt-2">Pour toute question, contactez-nous :</p>
                <p className="mt-2 font-medium text-[#1e3a5f]">+33 7 50 89 64 86</p>
                <p className="text-sm text-gray-500">contact@esquisshabitat.com</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function Merci() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MerciContent />
    </Suspense>
  )
}
