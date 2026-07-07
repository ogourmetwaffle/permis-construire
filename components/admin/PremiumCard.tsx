import React from 'react'

type Props = {
  title?: string
  subtitle?: string
  accent?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export default function PremiumCard({ title, subtitle, accent, children, className = '' }: Props) {
  return (
    <div className={`relative rounded-2xl overflow-hidden shadow-lg bg-white ${className}`}>
      <div className="absolute -inset-px bg-gradient-to-r from-[#173B8C] to-[#2E5FC1] opacity-10 blur-md" />
      <div className="relative p-6 md:p-8 bg-white/80 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {accent && <div className="ml-4 flex-shrink-0">{accent}</div>}
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}
