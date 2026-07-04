import React from 'react'

export default function AdminLoginIllustration() {
  return (
    <div className="hidden md:flex items-center justify-center w-full h-full p-10 text-white">
      <div className="max-w-md">
        <div className="mb-6">
          <svg viewBox="0 0 600 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
            <defs>
              <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" rx="16" fill="url(#g)" />
            <g transform="translate(40,40) scale(0.9)" strokeWidth="2" stroke="rgba(255,255,255,0.85)" fill="none">
              <path d="M20 220 L140 120 L260 220 L380 120 L500 220" strokeOpacity="0.12" />
              <rect x="40" y="140" width="200" height="110" rx="8" strokeOpacity="0.16" />
              <rect x="260" y="80" width="220" height="170" rx="8" strokeOpacity="0.12" />
              <path d="M80 180 L120 140 L160 180" strokeOpacity="0.18" />
              <g transform="translate(60,40)">
                <rect x="0" y="0" width="120" height="80" rx="6" strokeOpacity="0.14" />
                <line x1="8" y1="20" x2="112" y2="20" strokeOpacity="0.1" />
                <line x1="8" y1="40" x2="112" y2="40" strokeOpacity="0.06" />
              </g>
              <g transform="translate(300,160) rotate(-6)">
                <rect x="0" y="0" width="140" height="90" rx="6" strokeOpacity="0.12" />
                <path d="M10 20 L130 20" strokeOpacity="0.06" />
              </g>
            </g>
          </svg>
        </div>

        <h1 className="text-3xl font-semibold mb-2">Espace Administration</h1>
        <p className="text-sm opacity-90">Gérez facilement vos dossiers de permis de construire.</p>
      </div>
    </div>
  )
}
