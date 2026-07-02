type Testimonial = {
  name: string
  location: string
  rating: number
  comment: string
  initials: string
  color: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Marie Dupont',
    location: 'Lyon (69)',
    rating: 5,
    comment:
      'Service impeccable ! Esquiss Habitat a géré intégralement mon dossier de permis de construire. Dossier déposé en mairie en 3 semaines, sans aucun problème. Je recommande vivement.',
    initials: 'MD',
    color: 'bg-[#1e3a5f]',
  },
  {
    name: 'Thomas Bernard',
    location: 'Bordeaux (33)',
    rating: 5,
    comment:
      "J'avais des inquiétudes sur les délais mais l'équipe m'a rassurée et a livré dans les temps. Le rendu 3D était parfait pour visualiser mon extension avant les travaux. Très professionnel.",
    initials: 'TB',
    color: 'bg-[#7b2020]',
  },
  {
    name: 'Sophie Martin',
    location: 'Toulouse (31)',
    rating: 5,
    comment:
      "Déclaration préalable pour ma véranda traitée rapidement et sans erreur. L'accompagnement était vraiment personnalisé. Je n'aurais pas su gérer ça seule. Merci à toute l'équipe !",
    initials: 'SM',
    color: 'bg-slate-600',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Note : ${rating} sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-[#f5f6f8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Témoignages</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">Ils nous font confiance</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Des centaines de particuliers et de professionnels ont confié leur dossier à Esquiss Habitat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col"
            >
              <StarRating rating={t.rating} />

              <p className="mt-4 text-gray-600 text-sm leading-relaxed flex-1">
                &ldquo;{t.comment}&rdquo;
              </p>

              <footer className="mt-6 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} text-white text-sm font-bold flex items-center justify-center shrink-0`}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-[#1a1a2e] text-sm">{t.name}</div>
                  <div className="text-gray-400 text-xs">{t.location}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
