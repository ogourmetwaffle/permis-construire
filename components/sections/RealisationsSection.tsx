import BeforeAfterSlider from './BeforeAfterSlider'

const items = [
  {
    id: 'maison-1',
    label: 'Maison 1',
    beforeSrc: '/maison_1_before.jpeg',
    afterSrc: '/maison_1_after.jpeg',
    beforeAlt: 'Maison avant travaux',
    afterAlt: 'Maison après travaux',
  },
  {
    id: 'maison-2',
    label: 'Maison 2',
    beforeSrc: '/maison_2_before.jpeg',
    afterSrc: '/maison_2_after.jpeg',
    beforeAlt: 'Maison avant travaux',
    afterAlt: 'Maison après travaux',
  },
  {
    id: 'veranda-1',
    label: 'Véranda 1',
    beforeSrc: '/veranda1_before.jpeg',
    afterSrc: '/veranda1_after.jpeg',
    beforeAlt: 'Véranda avant travaux',
    afterAlt: 'Véranda après travaux',
  },
  {
    id: 'veranda-2',
    label: 'Véranda 2',
    beforeSrc: '/veranda2_before.jpeg',
    afterSrc: '/veranda2_after.jpeg',
    beforeAlt: 'Véranda avant travaux',
    afterAlt: 'Véranda après travaux',
  },
]

export default function RealisationsSection() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-2">
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-4">
              NOS RÉALISATIONS
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] leading-tight mb-6">
              Donnez vie à votre projet
            </h2>
            <p className="text-[#111827]/80 text-lg leading-relaxed mb-4">
              Depuis 2018, Esquiss Habitat accompagne les particuliers dans leurs projets de construction, d&apos;extension et d&apos;aménagement. Nous concevons et préparons vos dossiers avec soin afin de simplifier vos démarches administratives et vous permettre de concrétiser votre projet sereinement.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              Découvrez quelques-unes de nos réalisations et visualisez concrètement le travail réalisé avant et après notre accompagnement.
            </p>
            <a
              href="#prestations"
              className="inline-flex items-center gap-2 text-[#7b2020] font-semibold text-sm hover:underline underline-offset-4 transition-colors"
            >
              Découvrir nos prestations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div className="lg:col-span-3">
            <BeforeAfterSlider items={items} defaultPosition={20} />
          </div>
        </div>
      </div>
    </section>
  )
}
