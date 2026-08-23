"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Settings, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Props = {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0F2F5A, #0B1D3A)' }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Esquiss Habitat" className="w-7 h-7 rounded-md object-cover ring-1 ring-blue-400/40" />
          <div>
            <div className="text-sm font-semibold text-white leading-tight">Esquiss Habitat</div>
            <div className="text-[11px] text-blue-200/80 mt-0.5">Administration</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-blue-100/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={17} className={active ? 'text-white' : 'text-blue-300/80'} />
              <span>{item.label}</span>
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-100/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Decorative background image */}
      <img
        src="/home.png"
        alt=""
        className="absolute bottom-4 right-4 h-[28%] w-auto opacity-20 pointer-events-none object-contain z-0 hidden md:block lg:h-[32%]"
        aria-hidden="true"
      />
    </div>
  )
}

export default function AdminSidebar({ open, onClose }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-44 lg:w-48 min-h-screen shrink-0" style={{ background: 'linear-gradient(to bottom, #0F2F5A, #0B1D3A)' }}>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <div className="absolute left-0 top-0 bottom-0 w-64 shadow-xl overflow-auto" style={{ background: 'linear-gradient(to bottom, #0F2F5A, #0B1D3A)' }}>
            <SidebarContent pathname={pathname} onClose={onClose} />
          </div>
        </div>
      ) : null}
    </>
  )
}

