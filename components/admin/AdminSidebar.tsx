"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Settings, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/dossiers', label: 'Dossiers', icon: FolderOpen },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#0F172A' }}>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Esquiss Habitat" className="w-9 h-9 rounded-lg object-cover ring-2 ring-blue-500/40" />
          <div>
            <div className="text-sm font-bold text-white leading-tight">Esquiss Habitat</div>
            <div className="text-xs text-slate-400 mt-0.5">Administration</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">Menu</div>
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={17} className={active ? 'text-white' : 'text-slate-500'} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-52 lg:w-56 min-h-screen shrink-0" style={{ background: '#0F172A' }}>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl overflow-auto" style={{ background: '#0F172A' }}>
            <SidebarContent pathname={pathname} onClose={onClose} />
          </div>
        </div>
      ) : null}
    </>
  )
}

