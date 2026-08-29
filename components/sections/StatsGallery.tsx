import Image from 'next/image'

const stats = [
  { value: '12 000+', label: 'Dossiers réalisés' },
  { value: '5 jours', label: 'Délai moyen de traitement' },
  { value: '98%', label: 'Permis validés' },
  { value: 'France entière', label: 'DOM inclus' },
]

const galleries = [
  { src: '/maison_1_after.jpeg', alt: 'Maison 1 après travaux' },
  { src: '/maison_2_after.jpeg', alt: 'Maison 2 après travaux' },
  { src: '/veranda1_after.jpeg', alt: 'Véranda après travaux' },
]

export default function StatsGallery() {
  return (
    <section id="realisations" className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Nos réalisations</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] mb-4">Ils nous font confiance</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {galleries.map((img) => (
            <div key={img.src} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={img.src}
                alt={img.alt}
                width={800}
                height={600}
                className="w-full h-full object-cover"
                quality={85}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33]">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
