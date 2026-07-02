"use client"

import Link from 'next/link'
import { useEffect } from 'react'

type NavLink = { href: string; label: string }
type Props = { isOpen: boolean; onClose: () => void; links: NavLink[] }

export default function MobileNav({ isOpen, onClose, links }: Props) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <nav className="absolute right-0 top-0 w-80 h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <span className="font-bold text-[#1e3a5f] text-lg">Menu</span>
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-[#f5f6f8] hover:text-[#1e3a5f] font-medium transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="px-4 pb-8">
          <Link
            href="/deposer-dossier"
            onClick={onClose}
            className="block text-center w-full px-5 py-3.5 bg-[#7b2020] hover:bg-[#6a1a1a] text-white font-semibold rounded-xl shadow transition-colors"
          >
            Déposer mon dossier
          </Link>
        </div>
      </nav>
    </div>
  )
}
