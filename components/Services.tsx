import Link from 'next/link'

type Service = {
  title: string
  description: string
  price: string
  icon: React.ReactNode
}

const services: Service[] = [
  {
    title: 'Permis de construire',
    description:
      'Constitution complète de votre dossier PCMI pour toute construction nouvelle ou agrandissement important dépassant 20 m².',
    price: 'à partir de 400 €',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Déclaration préalable',
    description:
      'Pour vos travaux de faible envergure : abri de jardin, clôture, ravalement de façade, changement de fenêtres.',
    price: 'à partir de 300 €',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Extension',
    description:
      'Agrandissement de votre surface habitable : surélévation, extension latérale, garage accolé à la maison.',
    price: 'à partir de 300 €',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    ),
  },
  {
    title: 'Véranda',
    description:
      "Création d'une véranda ou d'une pergola bioclimatique : conception du dossier administratif complet.",
    price: 'à partir de 300 €',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m8.66-13l-.87.5M4.21 17.5l-.87.5M20.66 17.5l-.87-.5M4.21 6.5l-.87-.5M21 12h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ),
  },
  {
    title: 'Plans 3D',
    description:
      'Modélisation et rendu 3D de votre projet pour visualiser le résultat final avant le début des travaux.',
    price: 'à partir de 150 €',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
]

export default function Services() {
  return (
    <section id="prestations" className="py-20 bg-[#f5f6f8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Ce que nous proposons</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">Nos prestations</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            De la déclaration préalable au permis de construire complet, nous prenons en charge l'intégralité de votre dossier administratif.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <article
              key={service.title}
              className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#f0f5fa] text-[#1e3a5f] flex items-center justify-center mb-5 shrink-0">
                {service.icon}
              </div>

              <h3 className="text-lg font-bold text-[#1a1a2e] mb-2">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{service.description}</p>

              <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[#7b2020] font-semibold text-sm">{service.price}</span>
                <Link
                  href="#contact"
                  className="text-[#1e3a5f] text-sm font-medium hover:underline"
                >
                  En savoir plus →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
