"use client"

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BeforeAfterItem {
  id: string
  label: string
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
}

interface BeforeAfterSliderProps {
  items: BeforeAfterItem[]
  defaultIndex?: number
  defaultPosition?: number
  variant?: 'default' | 'compact'
}

export default function BeforeAfterSlider({
  items,
  defaultIndex = 0,
  defaultPosition = 20,
  variant = 'default',
}: BeforeAfterSliderProps) {
  const [index, setIndex] = useState(defaultIndex)
  const [position, setPosition] = useState(defaultPosition)
  const [fadeIn, setFadeIn] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const current = items[index]

  const goTo = useCallback((i: number) => {
    if (i === index) return
    setFadeIn(false)
    setPosition(defaultPosition)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIndex(i)
        setFadeIn(true)
      })
    })
  }, [index, defaultPosition])

  const goPrev = useCallback(() => {
    goTo((index - 1 + items.length) % items.length)
  }, [index, items.length, goTo])

  const goNext = useCallback(() => {
    goTo((index + 1) % items.length)
  }, [index, items.length, goTo])

  const getPercentage = useCallback((clientX: number) => {
    if (!containerRef.current) return defaultPosition
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    return Math.min(100, Math.max(0, (x / rect.width) * 100))
  }, [defaultPosition])

  const updatePosition = useCallback((clientX: number) => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      setPosition(getPercentage(clientX))
      rafRef.current = null
    })
  }, [getPercentage])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    updatePosition(e.clientX)
  }, [updatePosition])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      updatePosition(e.clientX)
    }
  }, [updatePosition])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      setPosition((p) => Math.max(0, p - 2))
    } else if (e.key === 'ArrowRight') {
      setPosition((p) => Math.min(100, p + 2))
    } else if (e.key === 'Home') {
      setPosition(0)
    } else if (e.key === 'End') {
      setPosition(100)
    }
  }, [])

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 text-[#0c1c33] hover:bg-white hover:shadow-md transition-all"
          aria-label="Réalisation précédente"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={goNext}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-black/5 text-[#0c1c33] hover:bg-white hover:shadow-md transition-all"
          aria-label="Réalisation suivante"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>

        <div
          ref={containerRef}
          className="relative w-full aspect-[4/3] select-none overflow-hidden rounded-lg bg-gray-100 cursor-ew-resize"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-label="Comparer la réalisation avant et après"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div
            className="absolute inset-0 transition-opacity duration-400 ease-out"
            style={{ opacity: fadeIn ? 1 : 0 }}
          >
            <Image
              src={current.afterSrc}
              alt={current.afterAlt}
              fill
              className="object-cover pointer-events-none"
              quality={85}
            />
          </div>

          <div
            className="absolute inset-0 overflow-hidden transition-opacity duration-400 ease-out"
            style={{
              width: `${position}%`,
              opacity: fadeIn ? 1 : 0,
            }}
          >
            <Image
              src={current.beforeSrc}
              alt={current.beforeAlt}
              fill
              className="object-cover pointer-events-none"
              quality={85}
            />
          </div>

          <span className="absolute top-3 left-3 bg-black/20 text-white/90 text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-sm">
            AVANT
          </span>
          <span className="absolute top-3 right-3 bg-black/20 text-white/90 text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-sm">
            APRÈS
          </span>

          <div
            className="absolute top-0 bottom-0 w-px bg-white/70"
            style={{ left: `${position}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="text-[#0c1c33]">
                <path d="M8 6L4 10L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 6L16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 mt-4 justify-center">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => goTo(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index
                ? 'w-2.5 h-2.5 bg-[#7b2020]'
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Voir ${item.label}`}
          />
        ))}
      </div>
    </div>
  )
}
