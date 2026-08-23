"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Menu, Mail, ChevronDown, KeyRound, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import PasswordChangeModal from './PasswordChangeModal'

export default function AdminHeader({ onToggleSidebar, adminEmail }: { onToggleSidebar?: () => void; adminEmail?: string }) {
  const email = adminEmail
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Page context + mobile menu */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
          </div>

          {/* Right: Email + Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {email && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
                <Mail size={13} className="text-slate-400" />
                <span className="truncate max-w-[180px]">{email}</span>
              </div>
            )}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-r-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#0F2F5A] text-white text-xs font-bold flex items-center justify-center shadow-sm ring-1 ring-blue-900/20">A</div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">Administrateur</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Compte admin</div>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in">
                  <button
                    onClick={() => { setDropdownOpen(false); setPasswordModalOpen(true) }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <KeyRound size={15} className="text-slate-400" />
                    Changer le mot de passe
                  </button>
                  <div className="my-1.5 border-t border-slate-100" />
                  <button
                    onClick={() => { setDropdownOpen(false); handleLogout() }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {passwordModalOpen && (
        <PasswordChangeModal
          open={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          email={email}
        />
      )}
    </header>
  )
}
