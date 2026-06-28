"use client"

import { useState } from 'react'

export default function FAQ() {
  const faqs = [
    { q: 'Quels documents fournir ?', a: 'Permis étranger, pièce d\'identité, justificatif de domicile, photo.' },
    { q: 'Combien de temps prend le traitement ?', a: 'Les délais varient selon l\'administration, mais nous assurons un suivi rapide et une réponse sous 7-14 jours ouvrés en moyenne.' },
    { q: 'Comment payer ?', a: 'Paiement sécurisé via Stripe lors du dépôt du dossier. Prix fixe: 49 €.' },
    { q: 'Puis-je vous contacter ?', a: 'Oui — téléphone, email ou WhatsApp. Voir la section contact.' }
  ]

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div id="faq">
      <h2 className="text-2xl font-bold text-blue-900">FAQ</h2>
      <div className="mt-6 space-y-3">
        {faqs.map((f, i) => (
          <div key={f.q} className="border rounded-lg overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} aria-expanded={openIndex === i} className="w-full text-left px-4 py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{f.q}</div>
              </div>
              <div className="text-gray-500">{openIndex === i ? '−' : '+'}</div>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-gray-600">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
