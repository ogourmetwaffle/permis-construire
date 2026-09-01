import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Analyse de votre projet',
    desc: 'Compréhension de vos besoins et des contraintes.',
  },
  {
    number: '02',
    title: 'Étude des règles d\'urbanisme',
    desc: 'Analyse du PLU et des règles applicables.',
  },
  {
    number: '03',
    title: 'Conception du dossier',
    desc: 'Rédaction et composition des documents nécessaires.',
  },
  {
    number: '04',
    title: 'Formulaires et pièces administratives',
    desc: 'Remplissage des formulaires et préparation des pièces jointes.',
  },
  {
    number: '05',
    title: 'Dépôt du dossier',
    desc: 'Dépôt en mairie ou auprès du service compétent.',
  },
  {
    number: '06',
    title: 'Suivi du dossier',
    desc: 'Esquiss Habitat assure le suivi de votre dossier jusqu’à sa finalisation et vous accompagne à chaque étape.',
  },
]

export default function ExpertsSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          
          <div className="max-w-xl">
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">
              NOS EXPERTS
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] mb-4">
              Nos experts s&apos;occupent de tout !
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              De l&apos;analyse de votre projet au suivi de votre dossier, Esquiss Habitat vous accompagne à chaque étape de votre autorisation d&apos;urbanisme.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Depuis 2018, notre équipe accompagne les particuliers dans leurs démarches d&apos;urbanisme et prépare leurs dossiers avec rigueur afin de simplifier chaque étape de leur projet.
            </p>

            <div className="flex items-start gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-[#7b2020] mt-0.5 shrink-0" strokeWidth={1.5} />
              <p className="text-sm text-gray-600 leading-relaxed">
                Votre projet mérite un dossier préparé avec précision.
                <br />
                Nous vous accompagnons pour vous permettre d&apos;avancer sereinement.
              </p>
            </div>

            <Link
              href="/deposer-dossier"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#7b2020] text-white font-semibold rounded-lg hover:bg-[#6a1a1a] transition-colors text-sm sm:text-base"
            >
              Démarrer mon projet
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="divide-y divide-gray-200">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4 sm:gap-6 items-start py-5 sm:py-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#7b2020]/10 leading-none shrink-0 w-10 sm:w-12 text-center select-none">
                  {step.number}
                </span>
                <div className="pt-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[#0c1c33] mb-1">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
