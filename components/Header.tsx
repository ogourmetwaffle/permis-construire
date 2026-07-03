"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import MobileNav from '@/components/MobileNav'

const navLinks = [
  { href: '/#accueil', label: 'Accueil' },
  { href: '/#prestations', label: 'Prestations' },
  { href: '/#processus', label: 'Processus' },
  { href: '/#realisations', label: 'Réalisations' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash.replace('#', ''))
    updateHash()
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.jpeg"
            alt="Esquiss Habitat"
            width={44}
            height={44}
            className="rounded-lg object-contain"
            priority
          />
          <div className="leading-tight">
            <div className="text-base font-bold text-[#1e3a5f]">
              Esquiss <span>Habitat</span>
            </div>
            <div className="text-xs text-gray-600 hidden sm:block">Permis de construire &amp; plans</div>
          </div>
        </Link>

        <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            // determine active state
            const isAnchor = link.href.includes('#')
            const anchor = isAnchor ? link.href.split('#')[1] : ''
            const isActive = isAnchor ? pathname === '/' && hash === anchor : pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${isActive ? 'text-[#7b2020] font-semibold' : 'text-gray-700 hover:text-[#1e3a5f]'}`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link
            href="/deposer-dossier"
            className="ml-2 px-5 py-2.5 bg-[#7b2020] hover:bg-[#6a1a1a] text-white text-sm font-semibold rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            Déposer mon dossier
          </Link>
        </nav>

        <button aria-label="Ouvrir le menu" onClick={() => setOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <MobileNav isOpen={open} onClose={() => setOpen(false)} links={navLinks} />
    </header>
  )
}
