import Link from 'next/link'

const trustItems = ['Partout en France', 'Réponse sous 24h', 'Dossier vérifié avant dépôt']

const pricing = [
  { label: 'Plans 3D', price: 'à partir de 150 €' },
  { label: 'Déclaration préalable', price: 'à partir de 300 €' },
  { label: 'Extension / Véranda', price: 'à partir de 300 €' },
  { label: 'Permis de construire', price: 'à partir de 400 €' },
]

export default function Hero() {
  return (
    <section id="accueil" className="relative bg-[#1e3a5f] overflow-hidden">
      {/* Blueprint grid background */}
      <div className="absolute inset-0 opacity-[0.04]" aria-hidden="true">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blueprint-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
        </svg>
      </div>

      {/* Architectural house sketch — right decoration */}
      <div
        className="absolute right-0 top-0 w-1/2 h-full opacity-[0.06] hidden xl:block pointer-events-none"
        aria-hidden="true"
      >
        <svg viewBox="0 0 640 720" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <g stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="120,320 320,130 520,320" />
            <rect x="150" y="320" width="340" height="250" />
            <rect x="390" y="185" width="32" height="60" />
            <rect x="175" y="360" width="75" height="65" />
            <line x1="212" y1="360" x2="212" y2="425" />
            <line x1="175" y1="392" x2="250" y2="392" />
            <rect x="390" y="360" width="75" height="65" />
            <line x1="427" y1="360" x2="427" y2="425" />
            <line x1="390" y1="392" x2="465" y2="392" />
            <path d="M295,570 L295,455 Q295,445 305,445 L335,445 Q345,445 345,455 L345,570" />
            <line x1="80" y1="570" x2="560" y2="570" />
            <line x1="150" y1="606" x2="490" y2="606" strokeDasharray="6 3" />
            <line x1="150" y1="598" x2="150" y2="614" />
            <line x1="490" y1="598" x2="490" y2="614" />
            <line x1="76" y1="320" x2="76" y2="570" strokeDasharray="6 3" />
            <line x1="68" y1="320" x2="84" y2="320" />
            <line x1="68" y1="570" x2="84" y2="570" />
          </g>
          <text x="285" y="638" fill="white" fontSize="13" fontFamily="monospace">11.35 m</text>
          <text x="24" y="458" fill="white" fontSize="13" fontFamily="monospace" transform="rotate(-90 24 458)">8.20 m</text>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-24 lg:pt-36 lg:pb-32 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — Main content */}
        <div>
          <div className="inline-flex items-center gap-2 text-white/60 text-sm bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-8 font-medium">
            <span className="w-1.5 h-1.5 bg-[#c0392b] rounded-full inline-block" />
            Spécialiste en permis de construire
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
            Concevons ensemble<br />
            <span className="text-[#a8c8e8]">votre projet</span><br />
            de construction
          </h1>

          <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-lg">
            Permis de construire, déclaration préalable, extension, véranda et accompagnement administratif.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              href="/deposer-dossier"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-xl shadow-lg transition-all hover:shadow-xl text-base"
            >
              Déposer mon dossier
            </Link>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold rounded-xl transition-all text-base"
            >
              Obtenir un devis
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-white/50 text-sm">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#a8c8e8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Pricing card (desktop) */}
        <div className="hidden lg:flex justify-end">
          <div className="bg-white/10 border border-white/20 rounded-2xl p-8 w-85 shadow-2xl">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-6">Nos tarifs</p>
            <ul>
              {pricing.map((item, i) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-white/70 text-sm">{item.label}</span>
                    <span className="text-[#a8c8e8] text-sm font-semibold">{item.price}</span>
                  </div>
                  {i < pricing.length - 1 && <div className="h-px bg-white/10" />}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link
                href="#contact"
                className="block text-center w-full py-3 bg-white text-[#1e3a5f] font-semibold rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Demander un devis gratuit
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
