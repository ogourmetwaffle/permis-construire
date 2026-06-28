"use client"

import Link from 'next/link'
import { useState } from 'react'
import MobileNav from '@/components/MobileNav'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white shadow sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">PE</div>
          <div>
            <div className="text-xl font-bold text-blue-900">Permis <span className="text-red-600">Express</span></div>
            <div className="text-sm text-gray-600">Du permis étranger au permis français</div>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center space-x-6">
          <Link href="#faq" className="text-gray-700 hover:text-blue-900">FAQ</Link>
          <Link href="#contact" className="text-gray-700 hover:text-blue-900">Contact</Link>
          <Link href="/deposer-dossier" className="ml-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold shadow">Déposer mon dossier</Link>
        </nav>

        <div className="md:hidden flex items-center">
          <button aria-label="Ouvrir le menu" onClick={() => setOpen(true)} className="p-2 rounded-md text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </div>
      <MobileNav isOpen={open} onClose={() => setOpen(false)} />
    </header>
  )
}
