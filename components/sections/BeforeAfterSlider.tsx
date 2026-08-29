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
}

export default function BeforeAfterSlider({ items, defaultIndex = 0 }: BeforeAfterSliderProps) {
  const [index, setIndex] = useState(defaultIndex)
  const [position, setPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = items[index]

  const getPercentage = useCallback((clientX: number) => {
    if (!containerRef.current) return 50
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    return Math.min(100, Math.max(0, (x / rect.width) * 100))
  }, [])

  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true)
    setPosition(getPercentage(clientX))
  }, [getPercentage])

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging) return
    setPosition(getPercentage(clientX))
  }, [isDragging, getPercentage])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX)
  }

  const onMouseUp = () => handleEnd()

  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX)
  }

  const onTouchEnd = () => handleEnd()

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setPosition((p) => Math.max(0, p - 2))
    } else if (e.key === 'ArrowRight') {
      setPosition((p) => Math.min(100, p + 2))
    }
  }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-10">
          <p className="text-[#7b2020] text-sm font-semibold uppercase tracking-widest mb-3">Nos réalisations</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c1c33] mb-3">Découvrez nos transformations</h2>
          <p className="text-gray-500">Glissez pour comparer avant / après</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div
            ref={containerRef}
            className="relative w-full aspect-[16/9] select-none overflow-hidden rounded-lg cursor-ew-resize bg-gray-100"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            role="slider"
            aria-label="Comparaison avant après"
            aria-valuenow={Math.round(position)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            {/* AFTER image (background) */}
            <Image
              src={current.afterSrc}
              alt={current.afterAlt}
              fill
              className="object-cover pointer-events-none"
              quality={85}
            />

            {/* BEFORE image (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
              <Image
                src={current.beforeSrc}
                alt={current.beforeAlt}
                fill
                className="object-cover pointer-events-none"
                quality={85}
              />
            </div>

            {/* Labels */}
            <span className="absolute top-4 left-4 bg-black/40 text-white text-xs font-medium px-2.5 py-1 rounded backdrop-blur-sm">
              AVANT
            </span>
            <span className="absolute top-4 right-4 bg-black/40 text-white text-xs font-medium px-2.5 py-1 rounded backdrop-blur-sm">
              APRÈS
            </span>

            {/* Divider + handle */}
            <div
              className="absolute top-0 bottom-0 w-px bg-white shadow-sm"
              style={{ left: `${position}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#0c1c33]">
                  <path d="M8 6L4 10L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 6L16 10L12 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 mt-6 justify-center flex-wrap">
            {items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => {
                  setIndex(i)
                  setPosition(50)
                }}
                className={`rounded-lg overflow-hidden border-2 transition-colors ${i === index ? 'border-[#7b2020]' : 'border-transparent hover:border-gray-200'}`}
              >
                <div className="relative w-20 h-14">
                  <Image src={item.afterSrc} alt={item.label} fill className="object-cover" />
                </div>
                <span className="block text-xs text-center py-1.5 text-gray-600 font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
