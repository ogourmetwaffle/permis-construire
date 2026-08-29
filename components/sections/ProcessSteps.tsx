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

export default function ProcessSteps() {
  return (
    <section id="processus" className="bg-[#f7f8fa]">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-16">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Comment ça fonctionne</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] mb-4">5 étapes simples</h2>
          <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
            De la demande initiale à la livraison du dossier, nous vous accompagnons à chaque étape.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-12 sm:space-y-16">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6 items-start">
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-200 leading-none shrink-0">
                {step.number}
              </span>
              <div className="pt-1 sm:pt-2">
                <h3 className="text-lg sm:text-xl font-semibold text-[#0c1c33] mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
