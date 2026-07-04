"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Bell } from 'lucide-react'

const titleMap: Record<string, { label: string; desc: string }> = {
  '/admin': { label: 'Tableau de bord', desc: 'Vue d\'ensemble des dossiers' },
  '/admin/dossiers': { label: 'Dossiers', desc: 'Gérer tous les dossiers de permis' },
  '/admin/parametres': { label: 'Paramètres', desc: 'Configuration de la plateforme' },
}

export default function AdminHeader({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const pathname = usePathname()

  const page = titleMap[pathname] ?? { label: 'Administration', desc: '' }

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

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

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-xs text-slate-400 capitalize">{today}</div>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow">
          A
        </div>
      </div>
    </header>
  )
}
