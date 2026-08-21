const contactInfo = [
  {
    label: 'Téléphone',
    value: '+33 7 50 89 64 86',
    href: 'tel:+33750896486',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'contact@esquisshabitat.com',
    href: 'mailto:contact@esquisshabitat.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Site web',
    value: 'www.esquisshabitat.com',
    href: 'https://www.esquisshabitat.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
]

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#a8c8e8] text-sm font-semibold uppercase tracking-widest mb-3">Parlons de votre projet</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Nous contacter</h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Une question sur votre projet ? Contactez-nous directement. Nous répondons sous 24 heures ouvrées.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left column: Téléphone & Email */}
          <div className="space-y-6">
            {contactInfo
              .filter((i) => i.label === 'Téléphone' || i.label === 'Email')
              .map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  className="flex items-center gap-5 p-5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-colors group"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 text-white/80 flex items-center justify-center shrink-0 group-hover:bg-[#7b2020] group-hover:text-white transition-colors">
                    {info.icon}
                  </div>
                  <div>
                    <div className="text-white/50 text-xs font-medium uppercase tracking-wide mb-0.5">{info.label}</div>
                    <div className="text-white font-semibold">{info.value}</div>
                  </div>
                </a>
              ))}
          </div>

          {/* Right column: Site web & Adresse */}
          <div className="space-y-6">
            {contactInfo.find((i) => i.label === 'Site web') && (
              <a
                href={contactInfo.find((i) => i.label === 'Site web')!.href}
                className="flex items-center gap-5 p-5 bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-white/10 text-white/80 flex items-center justify-center shrink-0 group-hover:bg-[#7b2020] group-hover:text-white transition-colors">
                  {contactInfo.find((i) => i.label === 'Site web')!.icon}
                </div>
                <div>
                  <div className="text-white/50 text-xs font-medium uppercase tracking-wide mb-0.5">Site web</div>
                  <div className="text-white font-semibold">www.esquisshabitat.com</div>
                </div>
              </a>
            )}

            <div className="flex items-start gap-5 p-5 bg-white/10 border border-white/20 rounded-2xl">
              <div className="w-11 h-11 rounded-xl bg-white/10 text-white/80 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <div className="text-white/50 text-xs font-medium uppercase tracking-wide mb-0.5">Adresse</div>
                <div className="text-white font-semibold">France entière</div>
                <div className="text-white/50 text-sm mt-0.5">Interventions sur tout le territoire national</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
