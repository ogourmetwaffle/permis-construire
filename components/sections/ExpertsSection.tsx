import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Analyse de votre projet',
    desc: 'Nous étudions votre projet pour comprendre vos besoins et les contraintes spécifiques.',
  },
  {
    number: '02',
    title: 'Étude des règles d\'urbanisme',
    desc: 'Nous analysons le PLU et les règles applicables à votre commune.',
  },
  {
    number: '03',
    title: 'Conception du dossier',
    desc: 'Nous rédigeons et composons l\'ensemble des documents nécessaires à votre demande.',
  },
  {
    number: '04',
    title: 'Formulaires et pièces administratives',
    desc: 'Nous remplissons les formulaires officiels et préparons les pièces jointes requises.',
  },
  {
    number: '05',
    title: 'Dépôt du dossier',
    desc: 'Nous déposons votre dossier complet en mairie ou via le service d\'urbanisme compétent.',
  },
  {
    number: '06',
    title: 'Suivi du dossier',
    desc: 'Nous assurons le suivi et les échanges avec l\'administration jusqu\'à la réponse.',
  },
]

export default function ExpertsSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="text-center mb-14 sm:mb-16">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">
            Nos experts s&apos;occupent de tout
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] mb-4">
            Nos experts s&apos;occupent de tout !
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            De l&apos;analyse de votre projet au suivi de votre dossier, Esquiss Habitat vous accompagne à chaque étape de votre autorisation d&apos;urbanisme.
          </p>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-gray-200">
          {steps.map((step) => (
            <div key={step.number} className="flex gap-6 sm:gap-10 items-start py-7 sm:py-8">
              <span className="text-5xl sm:text-6xl font-extrabold text-[#7b2020]/10 leading-none shrink-0 w-11 sm:w-14 text-center select-none">
                {step.number}
              </span>
              <div className="pt-1 sm:pt-2 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-[#0c1c33] mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm sm:text-base leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-14 sm:mt-16 pt-10 sm:pt-12 border-t border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#7b2020]" strokeWidth={1.5} />
          </div>
          <p className="text-[#0c1c33] text-base sm:text-lg font-medium mb-6 leading-relaxed">
            Votre projet mérite un dossier préparé avec précision.
            <br />
            Nous vous accompagnons pour vous permettre d&apos;avancer sereinement.
          </p>
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
      </div>
    </section>
  )
}
