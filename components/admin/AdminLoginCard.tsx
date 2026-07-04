"use client"
import React from 'react'

type Props = {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  loading: boolean
  error: string | null
  onSubmit: (e: React.FormEvent) => void
}

export default function AdminLoginCard({ email, setEmail, password, setPassword, loading, error, onSubmit }: Props) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <img src="/logo.jpeg" alt="Esquiss Habitat" className="w-10 h-10 rounded-md object-cover" />
          <div>
            <h3 className="text-lg font-semibold">Connexion administrateur</h3>
            <p className="text-sm text-gray-600">Accédez à votre espace sécurisé.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              {!email && (
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.5 5L18 8" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8" />
                  </svg>
                </span>
              )}
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-md focus:ring-2 focus:ring-[rgba(30,58,95,0.12)]"
                aria-label="Email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <div className="mt-1 relative">
              {!password && (
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <rect x="3" y="11" width="18" height="10" rx="2" ry="2" strokeWidth={2} stroke="currentColor" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0110 0v3" />
                  </svg>
                </span>
              )}
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 bg-white rounded-md focus:ring-2 focus:ring-[rgba(30,58,95,0.12)]"
                aria-label="Mot de passe"
              />
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="assertive" className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white bg-[var(--eh-bordeaux)] hover:brightness-95 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span>Connexion...</span>
                </>
              ) : (
                <span>Se connecter</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
