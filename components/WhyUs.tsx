const points = [
  {
    title: 'Expertise reconnue',
    desc: "Des années d'expérience dans la constitution de dossiers d'urbanisme conformes aux règles en vigueur.",
  },
  {
    title: 'Conseils personnalisés',
    desc: 'Chaque projet est unique. Nous analysons votre situation pour vous proposer la meilleure solution.',
  },
  {
    title: 'Suivi complet',
    desc: "Vous suivez l'avancement de votre dossier en temps réel depuis votre espace personnel.",
  },
  {
    title: 'Délais rapides',
    desc: "Nos dossiers sont traités avec réactivité. Livraison garantie dans les délais convenus.",
  },
  {
    title: "Accompagnement jusqu'au dépôt",
    desc: "Nous vous guidons jusqu'au dépôt en mairie, étape par étape, sans rien laisser au hasard.",
  },
]

export default function WhyUs() {
  return (
    <section className="py-20 bg-[#f5f6f8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Illustration */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Background card */}
              <div className="absolute inset-0 bg-[#1e3a5f] rounded-3xl rotate-3 opacity-10" aria-hidden="true" />

              <div className="relative bg-[#1e3a5f] rounded-3xl p-10 overflow-hidden">
                {/* Blueprint grid */}
                <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="why-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.6" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#why-grid)" />
                  </svg>
                </div>

                {/* House SVG illustration */}
                <svg
                  viewBox="0 0 320 280"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full"
                  aria-label="Illustration d'une maison"
                >
                  <g stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7">
                    {/* House body */}
                    <rect x="60" y="120" width="200" height="130" />
                    {/* Roof */}
                    <polyline points="40,120 160,30 280,120" />
                    {/* Chimney */}
                    <rect x="200" y="55" width="22" height="42" />
                    {/* Door */}
                    <path d="M140,250 L140,175 Q140,167 148,167 L172,167 Q180,167 180,175 L180,250" />
                    {/* Window left */}
                    <rect x="78" y="148" width="54" height="46" />
                    <line x1="105" y1="148" x2="105" y2="194" />
                    <line x1="78" y1="171" x2="132" y2="171" />
                    {/* Window right */}
                    <rect x="188" y="148" width="54" height="46" />
                    <line x1="215" y1="148" x2="215" y2="194" />
                    <line x1="188" y1="171" x2="242" y2="171" />
                    {/* Ground */}
                    <line x1="30" y1="250" x2="290" y2="250" />
                    {/* Dimension line */}
                    <line x1="60" y1="268" x2="260" y2="268" strokeDasharray="5 3" opacity="0.4" />
                    <line x1="60" y1="262" x2="60" y2="274" opacity="0.4" />
                    <line x1="260" y1="262" x2="260" y2="274" opacity="0.4" />
                  </g>
                  <text x="132" y="282" fill="white" fontSize="11" fontFamily="monospace" opacity="0.4">10.00 m</text>
                </svg>

                {/* Stats overlay */}
                <div className="absolute bottom-6 right-6 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white text-center">
                  <div className="text-2xl font-extrabold">500+</div>
                  <div className="text-white/60 text-xs mt-0.5">dossiers traités</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Points */}
          <div>
            <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Notre différence</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1a2e] mb-4">
              Pourquoi nous choisir ?
            </h2>
            <p className="text-gray-500 mb-10 leading-relaxed">
              Esquiss Habitat s'engage à vos côtés pour simplifier vos démarches administratives et sécuriser votre projet de construction.
            </p>

            <ul className="space-y-6">
              {points.map((point) => (
                <li key={point.title} className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e] mb-1">{point.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
