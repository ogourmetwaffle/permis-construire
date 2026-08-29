import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section id="accueil" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[550px] rounded-lg overflow-hidden bg-gray-100">
            <Image
              src="/backround.png"
              alt=""
              fill
              priority
              className="object-cover"
              quality={85}
            />
          </div>

          <div>
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">
              Permis de construire
            </p>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0c1c33] leading-[1.05] tracking-tight mb-6">
              Concevons ensemble votre projet
            </h1>

            <p className="text-[#111827]/80 text-lg leading-relaxed mb-4">
              Depuis 2018, Esquiss Habitat vous accompagne dans la constitution de vos dossiers d&apos;urbanisme, de la première idée jusqu&apos;au dépôt en mairie.
            </p>

            <p className="text-gray-500 leading-relaxed mb-8">
              Permis de construire, déclaration préalable, extension, véranda et plans 3D : nous vous accompagnons pour concrétiser votre projet, partout en France.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/deposer-dossier"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-lg transition-colors text-base min-h-[52px]"
              >
                Déposer mon dossier
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-[#0c1c33] text-[#0c1c33] hover:bg-gray-50 font-semibold rounded-lg transition-colors text-base min-h-[52px]"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
