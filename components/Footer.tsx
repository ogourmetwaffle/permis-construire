import Link from 'next/link'
import Image from 'next/image'

const navLinks = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#prestations', label: 'Prestations' },
  { href: '#processus', label: 'Processus' },
  { href: '#realisations', label: 'Réalisations' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
]

const services = [
  'Permis de construire',
  'Déclaration préalable',
  'Extension',
  'Véranda',
  'Plans 3D',
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#0b1622] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="Esquiss Habitat"
                width={40}
                height={40}
                className="rounded object-contain"
              />
              <span className="font-bold text-white text-lg">Esquiss Habitat</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Depuis 2018, nous vous accompagnons dans vos projets de construction, extension et aménagement partout en France.
            </p>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors text-sm min-h-[44px]"
            >
              Parlons de votre projet
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">Navigation</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/50 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">Prestations</h3>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <span className="text-white/50 text-sm">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href="tel:+33750896486" className="text-white/70 hover:text-white transition-colors">
                  +33 7 50 89 64 86
                </a>
              </li>
              <li>
                <a href="mailto:contact@esquisshabitat.com" className="text-white/70 hover:text-white transition-colors">
                  contact@esquisshabitat.com
                </a>
              </li>
              <li className="text-white/50">
                Partout en France
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/30 text-sm">
          <p>© {year} Esquiss Habitat — Tous droits réservés</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
