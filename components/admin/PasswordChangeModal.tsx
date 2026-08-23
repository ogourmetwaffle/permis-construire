"use client"

import React, { useState } from 'react'
import { X, Eye, EyeOff, KeyRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'

type Props = {
  open: boolean
  onClose: () => void
  email?: string
}

function validatePassword(password: string): string | null {
  if (!password || password.length === 0) return 'Veuillez saisir un mot de passe.'
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.'
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une lettre majuscule.'
  if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une lettre minuscule.'
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre.'
  return null
}

export default function PasswordChangeModal({ open, onClose, email }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string; general?: string }>({})

  if (!open) return null

  const currentError = currentPassword ? undefined : 'Veuillez saisir votre mot de passe actuel.'
  const newError = validatePassword(newPassword)
  const confirmError = confirmPassword ? (confirmPassword !== newPassword ? 'Les mots de passe ne correspondent pas.' : null) : 'Veuillez confirmer le nouveau mot de passe.'
  const isSamePassword = currentPassword && newPassword && currentPassword === newPassword
  const isFormValid = !newError && !confirmError && !isSamePassword && currentPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!currentPassword) {
      setErrors({ current: 'Veuillez saisir votre mot de passe actuel.' })
      return
    }
    if (!newPassword) {
      setErrors({ new: 'Veuillez saisir un nouveau mot de passe.' })
      return
    }
    if (!confirmPassword) {
      setErrors({ confirm: 'Veuillez confirmer le nouveau mot de passe.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirm: 'Les mots de passe ne correspondent pas.' })
      return
    }
    if (currentPassword === newPassword) {
      setErrors({ new: 'Le nouveau mot de passe doit être différent du mot de passe actuel.' })
      return
    }

    const validationError = validatePassword(newPassword)
    if (validationError) {
      setErrors({ new: validationError })
      return
    }

    if (!email) {
      setErrors({ general: 'Adresse email introuvable. Veuillez vous reconnecter.' })
      return
    }

    setSaving(true)

    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })

      if (reauthError) {
        setErrors({ current: 'Le mot de passe actuel est incorrect.' })
        setSaving(false)
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      setSaving(false)

      if (updateError) {
        setErrors({ general: updateError.message || 'Erreur lors de la modification du mot de passe.' })
        return
      }

      toast.success('Votre mot de passe a été modifié avec succès.')
      onClose()
    } catch {
      setSaving(false)
      setErrors({ general: 'Erreur réseau. Veuillez réessayer.' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-auto z-10">
        <div className="flex items-start justify-between p-5 sm:p-6 pb-0">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <KeyRound size={18} className="text-[#1e3a5f]" />
              Changer mon mot de passe
            </h3>
            <p className="text-xs text-slate-500 mt-1">Modifiez le mot de passe de votre compte administrateur.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-md transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {errors.general && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {errors.general}
            </div>
          )}

          <div>
            <label htmlFor="current-password" className="block text-xs font-medium text-slate-700 mb-1">
              Mot de passe actuel <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="current-password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); if (errors.current) setErrors((s) => ({ ...s, current: undefined })) }}
                className="w-full rounded-md border border-slate-200 shadow-sm px-3 py-2 pr-10 text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.current && <p className="text-xs text-red-600 mt-1">{errors.current}</p>}
          </div>

          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-slate-700 mb-1">
              Nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); if (errors.new) setErrors((s) => ({ ...s, new: undefined })) }}
                className="w-full rounded-md border border-slate-200 shadow-sm px-3 py-2 pr-10 text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.new && <p className="text-xs text-red-600 mt-1">{errors.new}</p>}
            {isSamePassword && <p className="text-xs text-red-600 mt-1">Le nouveau mot de passe doit être différent du mot de passe actuel.</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
              <span className={newPassword.length >= 8 ? 'text-green-600' : ''}>8 caractères</span>
              <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}>1 majuscule</span>
              <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : ''}>1 minuscule</span>
              <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : ''}>1 chiffre</span>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-slate-700 mb-1">
              Confirmer le nouveau mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirm) setErrors((s) => ({ ...s, confirm: undefined })) }}
                className="w-full rounded-md border border-slate-200 shadow-sm px-3 py-2 pr-10 text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-600 mt-1">{errors.confirm}</p>}
          </div>
        </div>

        <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-3.5 py-2 rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!isFormValid || saving}
            className="px-3.5 py-2 rounded-md bg-[#1e3a5f] text-white text-sm font-medium hover:bg-[#0F2F5A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  )
}