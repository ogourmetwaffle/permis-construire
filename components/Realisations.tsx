import Image from 'next/image'

type Project = {
  title: string
  location: string
  type: string
  bgColor: string
  image: string
}

const projects: Project[] = [
  { title: 'Villa contemporaine', location: 'Bordeaux (33)', type: 'Permis de construire', bgColor: 'bg-slate-200', image: '/permis construire.png' },
  { title: 'Extension cuisine', location: 'Lyon (69)', type: 'Extension', bgColor: 'bg-stone-200', image: '/extension.png' },
  { title: 'Véranda bioclimatique', location: 'Toulouse (31)', type: 'Véranda', bgColor: 'bg-zinc-200', image: '/veranda.png' },
  { title: 'Maison moderne', location: 'Nantes (44)', type: 'Permis de construire', bgColor: 'bg-slate-300', image: '/permis construire 2.png' },
  { title: 'Déclaration préalable', location: 'Montpellier (34)', type: 'Déclaration préalable', bgColor: 'bg-stone-300', image: '/declaration prealable.png' },
  { title: 'Extension contemporaine', location: 'Marseille (13)', type: 'Extension', bgColor: 'bg-zinc-300', image: '/extension2.png' },
]

const typeColors: Record<string, string> = {
  'Permis de construire': 'bg-[#1e3a5f] text-white',
  'Extension': 'bg-[#7b2020] text-white',
  'Véranda': 'bg-amber-700 text-white',
  'Déclaration préalable': 'bg-gray-600 text-white',
}

export default function Realisations() {
  return (
    <section id="realisations" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Notre portfolio</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">Nos réalisations</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Quelques exemples de projets que nous avons accompagnés. Chaque dossier est unique et traité avec le même niveau d'exigence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <article
              key={project.title + project.location}
              className="group rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            >
              {/* Image */}
              <div className={`relative h-[260px] overflow-hidden rounded-t-2xl ${project.bgColor}`}>
                <Image
                  fill
                  src={project.image}
                  alt={`${project.title} - ${project.type}`}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* subtle bottom gradient for readability */}
                <div className="absolute left-0 right-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                {/* Type badge */}
                <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[project.type] ?? 'bg-gray-600 text-white'}`}>
                  {project.type}
                </span>
              </div>

              {/* Content */}
              <div className="p-5 bg-white">
                <h3 className="font-bold text-[#1a1a2e] mb-1">{project.title}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.location}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
