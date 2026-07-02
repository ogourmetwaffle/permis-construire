const steps = [
  {
    number: '01',
    title: 'Déposez votre demande',
    desc: 'Remplissez notre formulaire en ligne en quelques minutes. Indiquez votre projet et vos coordonnées.',
  },
  {
    number: '02',
    title: 'Téléversez vos documents',
    desc: 'Envoyez vos plans, photos et pièces justificatives directement depuis votre espace personnel.',
  },
  {
    number: '03',
    title: 'Choisissez votre mode de paiement',
    desc: 'Réglez par carte bancaire (Stripe) ou par virement bancaire. Votre dossier est aussitôt pris en charge.',
  },
  {
    number: '04',
    title: 'Étude du dossier',
    desc: 'Notre équipe vérifie la conformité de votre dossier et vous contacte si des éléments complémentaires sont nécessaires.',
  },
  {
    number: '05',
    title: 'Livraison de votre dossier',
    desc: 'Votre dossier complet, prêt à déposer en mairie, vous est transmis dans les délais convenus.',
  },
]

export default function Process() {
  return (
    <section id="processus" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Comment ça fonctionne</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">5 étapes simples</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            De la demande initiale à la livraison du dossier, nous vous accompagnons à chaque étape.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* Vertical connecting line */}
          <div className="absolute left-[27px] top-10 bottom-10 w-px bg-gray-200" aria-hidden="true" />

          <ol className="space-y-10">
            {steps.map((step, i) => (
              <li key={step.number} className="relative flex gap-6 items-start">
                {/* Number badge */}
                <div
                  className={`relative z-10 flex items-center justify-center w-14 h-14 rounded-full shrink-0 font-bold text-sm border-2 transition-colors ${
                    i === 0
                      ? 'bg-[#1e3a5f] border-[#1e3a5f] text-white'
                      : 'bg-white border-gray-200 text-[#1e3a5f]'
                  }`}
                >
                  {step.number}
                </div>

                {/* Content */}
                <div className="pt-3">
                  <h3 className="font-semibold text-[#1a1a2e] text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
