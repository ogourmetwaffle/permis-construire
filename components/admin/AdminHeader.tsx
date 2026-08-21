"use client"

import React from 'react'
import { Menu, Mail, ChevronDown } from 'lucide-react'

export default function AdminHeader({ onToggleSidebar, dossierLabel, adminEmail }: { onToggleSidebar?: () => void; dossierLabel?: string; adminEmail?: string }) {
  const email = adminEmail || 'admin@esquisshabitat.fr'

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="bg-gradient-to-r from-white via-[#f5f9ff] to-[#eef3f9] px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo + Baseline */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2.5">
              <img src="/logo.png" alt="Esquiss Habitat" className="h-7 w-auto rounded-md" />
              <div className="hidden md:block">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Vos projets, notre expertise</div>
              </div>
            </div>
          </div>

          {/* Right: Email + Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
              <Mail size={13} className="text-slate-400" />
              <span className="truncate max-w-[180px]">{email}</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-3 sm:pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0F2F5A] text-white text-xs font-bold flex items-center justify-center shadow-sm ring-1 ring-blue-900/20">A</div>
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-900 leading-tight">Administrateur</div>
                <div className="text-[10px] text-slate-400 leading-tight">Compte admin</div>
              </div>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
