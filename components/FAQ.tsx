"use client"

import { useState } from 'react'

const faqs = [
  {
    q: 'Quelle est la différence entre un permis de construire et une déclaration préalable ?',
    a: 'La déclaration préalable (DP) concerne les travaux de faible envergure : extensions inférieures à 20 m², abris de jardin, vérandas de petite taille, clôtures. Le permis de construire (PC) est obligatoire pour les constructions nouvelles et les extensions dépassant 20 m².',
  },
  {
    q: 'Quels sont les délais d’obtention d’un permis de construire ?',
    a: 'Le délai légal d’instruction est de 2 mois pour une maison individuelle et 3 mois pour les autres constructions. Ces délais débutent à compter de la réception du dossier complet par la mairie.',
  },
  {
    q: 'Quels documents sont nécessaires pour constituer un dossier ?',
    a: 'Les pièces requises varient selon la nature des travaux, mais comprennent généralement : un plan de situation, un plan de masse, des photographies de l’environnement, un plan en coupe et une notice descriptive. Nous vous indiquons précisément les documents nécessaires lors de notre premier échange.',
  },
  {
    q: 'Comment se déroule l’accompagnement Esquiss Habitat ?',
    a: 'Après votre demande en ligne, vous téléversez vos documents et effectuez votre paiement. Notre équipe analyse votre dossier, vous contacte si des éléments complémentaires sont nécessaires, puis vous livre un dossier complet prêt à être déposé en mairie.',
  },
  {
    q: 'Puis-je construire sans permis de construire ?',
    a: 'Non. Construire sans permis ou sans déclaration préalable est une infraction urbanistique. Les sanctions peuvent inclure une amende, la démolition de l’ouvrage ou l’impossibilité de vendre le bien. Il est essentiel de régulariser votre situation avant tout commencement de travaux.',
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: 'Nous acceptons le paiement par carte bancaire via Stripe (100 % sécurisé) ainsi que par virement bancaire. Le dossier est pris en charge dès la confirmation de votre paiement.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Vous avez des questions ?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e]">Questions fréquentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={f.q} className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#1a1a2e] text-sm sm:text-base">{f.q}</span>
                <span
                  className={`text-[#1e3a5f] shrink-0 transition-transform duration-200 ${
                    openIndex === i ? 'rotate-45' : 'rotate-0'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </span>
              </button>

              {openIndex === i && (
                <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                  <p className="pt-4">{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
