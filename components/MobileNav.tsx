"use client"

import Link from 'next/link'
import { useEffect } from 'react'

type Props = { isOpen: boolean; onClose: () => void }

export default function MobileNav({ isOpen, onClose }: Props) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <nav className="absolute right-0 top-0 w-80 h-full bg-white shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="font-bold text-lg">Menu</div>
          <button onClick={onClose} aria-label="Fermer le menu" className="text-gray-600">Fermer</button>
        </div>
        <ul className="space-y-4">
          <li><Link href="/deposer-dossier" onClick={onClose} className="block font-semibold bg-red-600 text-white px-4 py-2 rounded">Déposer mon dossier</Link></li>
          <li><Link href="#faq" onClick={onClose} className="block">FAQ</Link></li>
          <li><Link href="#contact" onClick={onClose} className="block">Contact</Link></li>
        </ul>
      </nav>
    </div>
  )
}
