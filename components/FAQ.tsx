"use client"

import { useState } from 'react'

const faqs = [
  {
    q: 'Quelle est la différence entre un permis de construire et une déclaration préalable ?',
    a: 'La déclaration préalable (DP) concerne les travaux de faible envergure : extensions inférieures à 20 m², abris de jardin, vérandas de petite taille, clôtures. Le permis de construire (PC) est obligatoire pour les constructions nouvelles et les extensions dépassant 20 m².',
  },
  {
    q: 'Quels sont les délais d\'obtention d\'un permis de construire ?',
    a: 'Le délai légal d\'instruction est de 2 mois pour une maison individuelle et 3 mois pour les autres constructions. Ces délais débutent à compter de la réception du dossier complet par la mairie.',
  },
  {
    q: 'Quels documents sont nécessaires pour constituer un dossier ?',
    a: 'Les pièces requises varient selon la nature des travaux, mais comprennent généralement : un plan de situation, un plan de masse, des photographies de l\'environnement, un plan en coupe et une notice descriptive. Nous vous indiquons précisément les documents nécessaires lors de notre premier échange.',
  },
  {
    q: 'Comment se déroule l\'accompagnement Esquiss Habitat ?',
    a: 'Après votre demande en ligne, vous téléversez vos documents et effectuez votre paiement. Notre équipe analyse votre dossier, vous contacte si des éléments complémentaires sont nécessaires, puis vous livre un dossier complet prêt à être déposé en mairie.',
  },
  {
    q: 'Puis-je construire sans permis de construire ?',
    a: 'Non. Construire sans permis ou sans déclaration préalable est une infraction urbanistique. Les sanctions peuvent inclure une amende, la démolition de l\'ouvrage ou l\'impossibilité de vendre le bien. Il est essentiel de régulariser votre situation avant tout commencement de travaux.',
  },
  {
    q: 'Quels modes de paiement acceptez-vous ?',
    a: 'Nous acceptons le paiement par carte bancaire via Stripe (100 % sécurisé) ainsi que par virement bancaire. Le dossier est pris en charge dès la confirmation de votre paiement.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-[#f7f8fa]">
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-12">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Vous avez des questions ?</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33]">Questions fréquentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={f.q}
                className={`border rounded-lg overflow-hidden transition-colors ${isOpen ? 'border-[#7b2020] bg-white' : 'border-gray-200 bg-white'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-[#0c1c33] text-sm sm:text-base">{f.q}</span>
                  <span
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#7b2020]' : 'text-gray-400'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100">
                    <p className="pt-4">{f.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
