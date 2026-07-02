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
    <footer className="bg-[#0f1f35] text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.jpeg"
                alt="Esquiss Habitat"
                width={40}
                height={40}
                className="rounded-lg object-contain"
              />
              <div className="leading-tight">
                <div className="font-bold text-white">Esquiss Habitat</div>
                <div className="text-white/40 text-xs">Permis de construire &amp; plans</div>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed">
              Votre expert en permis de construire, déclarations préalables et plans 3D. Partout en France.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-5">Navigation</h3>
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
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-5">Prestations</h3>
            <ul className="space-y-3">
              {services.map((s) => (
                <li key={s}>
                  <Link href="#prestations" className="text-white/50 hover:text-white text-sm transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-5">Contact</h3>
            <ul className="space-y-3 text-sm text-white/50">
              <li>
                <a href="tel:+33750896486" className="hover:text-white transition-colors">+33 7 50 89 64 86</a>
              </li>
              <li>
                <a href="mailto:contact@esquisshabitat.com" className="hover:text-white transition-colors">
                  contact@esquisshabitat.com
                </a>
              </li>
              <li>
                <Link href="/deposer-dossier" className="inline-flex items-center gap-2 text-[#a8c8e8] hover:text-white transition-colors font-medium">
                  Déposer mon dossier →
                </Link>
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
