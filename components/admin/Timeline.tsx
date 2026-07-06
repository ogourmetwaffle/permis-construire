"use client"

import React from 'react'

type Event = { date?: string | null; title: string; description?: string }

export default function Timeline({ events }: { events?: Event[] }) {
  if (!events || events.length === 0) {
    return <div className="text-sm text-gray-400">Aucun événement pour le moment.</div>
  }

  const sorted = [...events].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  })

  return (
    <div className="relative pl-8">
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-200" />
      {sorted.map((e, idx) => (
        <div key={idx} className="relative mb-6 last:mb-0">
          <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-white shadow-sm" />
          <div className="text-sm font-semibold text-gray-800 mb-0.5">{e.title}</div>
          {e.date && <div className="text-xs text-gray-400 mb-1.5">{new Date(e.date).toLocaleString('fr-FR')}</div>}
          {e.description && <p className="text-xs text-gray-500 leading-relaxed">{e.description}</p>}
        </div>
      ))}
    </div>
  )
}
