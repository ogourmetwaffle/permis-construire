import Image from 'next/image'
import Link from 'next/link'

const galleries = [
  { src: '/maison_1_after.jpeg', alt: 'Maison après travaux', w: 800, h: 600 },
  { src: '/maison_2_after.jpeg', alt: 'Maison après travaux', w: 600, h: 800 },
  { src: '/veranda1_after.jpeg', alt: 'Véranda après travaux', w: 700, h: 500 },
  { src: '/veranda2_after.jpeg', alt: 'Véranda après travaux', w: 500, h: 600 },
]

const tags = [
  { label: 'Permis de construire', icon: '📋' },
  { label: 'Extension', icon: '🔨' },
  { label: 'Véranda', icon: '🏠' },
  { label: 'Piscine', icon: '💧' },
  { label: 'Maison individuelle', icon: '🏡' },
]

export default function Showcase() {
  return (
    <section className="bg-white" aria-label="Présentation et réalisations">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Colonne éditoriale */}
          <div className="max-w-xl">
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-4">
              ESQUISS HABITAT
            </p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] leading-tight mb-6">
              Des projets bien pensés, des dossiers bien préparés.
            </h2>

            <p className="text-[#111827]/80 text-lg leading-relaxed mb-4">
              Depuis 2018, Esquiss Habitat accompagne particuliers et professionnels dans leurs projets de construction, d&apos;extension et d&apos;aménagement.
            </p>

            <p className="text-gray-500 leading-relaxed mb-6">
              De la déclaration préalable au permis de construire, nous vous accompagnons dans la préparation de votre dossier et dans vos démarches administratives, avec une approche simple, claire et entièrement à distance.
            </p>

            <p className="text-gray-500 leading-relaxed mb-8">
              Piscine, garage, pergola, extension, véranda ou construction d&apos;une maison : chaque projet mérite un dossier précis et adapté.
            </p>

            <Link
              href="#realisations"
              className="inline-flex items-center gap-2 text-[#7b2020] font-semibold text-sm hover:underline underline-offset-4 transition-colors"
            >
              Découvrir nos réalisations
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Colonne galerie */}
          <div className="relative">
            <div className="grid grid-cols-12 gap-4 auto-rows-auto">
              
              {/* Image principale - grande */}
              <div className="col-span-12 sm:col-span-7 relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={galleries[0].src}
                  alt={galleries[0].alt}
                  width={galleries[0].w}
                  height={galleries[0].h}
                  className="w-full h-full object-cover"
                  quality={85}
                />
                <span className="absolute top-4 left-4 bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-[#0c1c33] shadow-sm">
                  {tags[0].label}
                </span>
              </div>

              {/* Image secondaire 1 - portrait */}
              <div className="col-span-6 sm:col-span-5 relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 sm:mt-8">
                <Image
                  src={galleries[1].src}
                  alt={galleries[1].alt}
                  width={galleries[1].w}
                  height={galleries[1].h}
                  className="w-full h-full object-cover"
                  quality={85}
                />
                <span className="absolute top-4 right-4 bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-[#0c1c33] shadow-sm">
                  {tags[1].label}
                </span>
              </div>

              {/* Image secondaire 2 - paysage */}
              <div className="col-span-6 sm:col-span-5 relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={galleries[2].src}
                  alt={galleries[2].alt}
                  width={galleries[2].w}
                  height={galleries[2].h}
                  className="w-full h-full object-cover"
                  quality={85}
                />
                <span className="absolute bottom-4 left-4 bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-[#0c1c33] shadow-sm">
                  {tags[2].label}
                </span>
              </div>

              {/* Image secondaire 3 - carré/portrait */}
              <div className="col-span-12 sm:col-span-7 relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 sm:-mt-4">
                <Image
                  src={galleries[3].src}
                  alt={galleries[3].alt}
                  width={galleries[3].w}
                  height={galleries[3].h}
                  className="w-full h-full object-cover"
                  quality={85}
                />
                <span className="absolute bottom-4 right-4 bg-white/90 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-[#0c1c33] shadow-sm">
                  {tags[3].label}
                </span>
              </div>

            </div>

            {/* Bulle flottante isolée - Maison individuelle */}
            <div className="hidden lg:flex absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
              <span className="text-xs font-medium text-[#0c1c33]">{tags[4].label}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
