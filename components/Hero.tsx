import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FileText, Layers, Home } from 'lucide-react'

const pricing = [
  { label: 'Permis de construire', price: '400 €', icon: FileText },
  { label: 'Déclaration préalable', price: '300 €', icon: FileText },
  { label: 'Extension / Véranda', price: '300 €', icon: Home },
  { label: 'Plans 3D', price: '150 €', icon: Layers },
  { label: 'Accompagnement administratif', price: 'Sur devis', icon: FileText },
]

export default function Hero() {
  return (
    <section id="accueil" className="relative bg-[#1e3a5f] overflow-visible max-h-[820px]">
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

      {/* illustration is placed inside the grid (middle column on lg) and inline on mobile */}

      <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-12 lg:pt-16 lg:pb-16 grid lg:grid-cols-3 gap-8 items-start">
        {/* Left — Main content */}
        <div>
          <div className="inline-flex items-center gap-2 text-white/70 text-sm bg-white/8 border border-white/10 px-4 py-1.5 rounded-full mb-6 font-medium">
            <span className="w-2 h-2 bg-[#c0392b] rounded-full inline-block" />
            ● Spécialiste en permis de construire
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.02] tracking-tight">
            Concevons ensemble<br />
            <span className="text-[#a8c8e8]">votre projet</span><br />
            <span className="text-white/90">de construction</span>
          </h1>

          <p className="mt-6 text-white/70 text-lg leading-relaxed max-w-lg">
            Permis de construire, déclaration préalable,
            <br />extension, véranda
            <br />et accompagnement administratif.
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

          {/* mobile illustration placed after CTAs (Text -> Buttons -> Illustration on mobile) */}
          <div className="block lg:hidden mt-4 w-full">
            <div className="relative w-full">
              <Image src="/backround.png" alt="Illustration" width={1100} height={1100} className="w-full h-auto object-contain" />
            </div>
          </div>
          
          
        </div>

        {/* Middle — Illustration (desktop) */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="relative w-[900px] max-w-full -translate-y-6 -translate-x-12 transform scale-125 animate-float-slow drop-shadow-lg z-10 mb-[-32px]">
            <Image src="/backround.png" alt="Illustration" width={1600} height={1600} className="w-full h-auto object-contain" priority />
          </div>
        </div>

        {/* Right — Pricing card (desktop) */}
        <div className="hidden lg:flex justify-end relative z-30">
          <div className="backdrop-blur-sm bg-white/6 border border-white/12 rounded-2xl p-6 w-80 shadow-2xl">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">Nos tarifs</p>
            <ul>
              {pricing.map((item, i) => (
                <li key={item.label}>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {React.createElement(item.icon, { size: 16, className: 'text-white/80' })}
                      <span className="text-white/70 text-sm">{item.label}</span>
                    </div>
                    <span className="text-[#a8c8e8] text-sm font-semibold">{item.price}</span>
                  </div>
                  {i < pricing.length - 1 && <div className="h-px bg-white/8" />}
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
