"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

const titleMap: Record<string, { label: string; desc: string }> = {
  '/admin': { label: 'Tableau de bord', desc: 'Vue d\'ensemble des dossiers' },
  '/admin/parametres': { label: 'Paramètres', desc: 'Configuration de la plateforme' },
}

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname()

  const page = titleMap[pathname] ?? { label: 'Administration', desc: '' }

  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{page.label}</h1>
          {page.desc && <p className="text-xs text-slate-400 mt-0.5">{page.desc}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end text-right">
          <div className="text-xs text-slate-400">{today}</div>
          <div className="text-sm text-slate-600 mt-1">Bonjour,</div>
          <div className="text-base font-semibold text-slate-900">Administrateur</div>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow">A</div>
        </div>
      </div>
    </header>
  )
}
