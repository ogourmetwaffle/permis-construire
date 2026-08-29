"use client"

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)

  const current = items[index]

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

  const selectItem = useCallback((i: number) => {
    setIndex(i)
    setPosition(defaultPosition)
  }, [defaultPosition])

  return (
    <div>
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] select-none overflow-hidden rounded-lg bg-gray-100 cursor-ew-resize"
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
        <Image
          src={current.afterSrc}
          alt={current.afterAlt}
          fill
          className="object-cover pointer-events-none"
          quality={85}
        />

        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <Image
            src={current.beforeSrc}
            alt={current.beforeAlt}
            fill
            className="object-cover pointer-events-none"
            quality={85}
          />
        </div>

        <span className="absolute top-4 left-4 bg-black/40 text-white text-xs font-semibold tracking-wider px-2.5 py-1 rounded">
          AVANT
        </span>
        <span className="absolute top-4 right-4 bg-black/40 text-white text-xs font-semibold tracking-wider px-2.5 py-1 rounded">
          APRÈS
        </span>

        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white"
          style={{ left: `${position}%` }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#0c1c33]">
              <path d="M8 6L4 10L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6L16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className={variant === 'compact' ? 'flex gap-4 mt-4 justify-center flex-wrap' : 'flex gap-3 mt-4 justify-center flex-wrap'}>
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => selectItem(i)}
            className={variant === 'compact' ? 'flex flex-col items-center gap-1.5 group' : `rounded-lg overflow-hidden border-2 transition-colors ${i === index ? 'border-[#7b2020]' : 'border-transparent hover:border-gray-200'}`}
            aria-label={`Voir ${item.label}`}
          >
            {variant === 'compact' ? (
              <>
                <span className={`block w-3 h-3 rounded-full transition-colors ${i === index ? 'bg-[#7b2020]' : 'bg-gray-300 group-hover:bg-gray-400'}`} />
                <span className={`block text-[11px] font-medium ${i === index ? 'text-[#0c1c33]' : 'text-gray-500'}`}>{item.label}</span>
              </>
            ) : (
              <>
                <div className="relative w-20 h-14 sm:w-24 sm:h-16">
                  <Image src={item.afterSrc} alt={item.label} fill className="object-cover" />
                </div>
                <span className="block text-xs text-center py-1.5 text-gray-600 font-medium">{item.label}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
