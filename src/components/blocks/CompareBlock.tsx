'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { CompareBlockContent } from '@/types/content'

interface CompareBlockProps {
  content: CompareBlockContent
}

export function CompareBlock({ content }: CompareBlockProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(percent)
  }, [])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      handleMove(e.clientX)
    },
    [handleMove]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging.current) handleMove(e.clientX)
    },
    [handleMove]
  )

  const handlePointerUp = useCallback(() => {
    isDragging.current = false
  }, [])

  if (!content.before_url || !content.after_url) return null

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="relative select-none overflow-hidden rounded-xl cursor-col-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* After image (full width) — unoptimized to stay in-flow and set container height */}
        <Image
          src={content.after_url}
          alt={content.after_label || 'After'}
          width={1200}
          height={800}
          unoptimized
          className="block w-full"
          draggable={false}
        />

        {/* Before image (clipped) — unoptimized, width set by JS for slider */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <Image
            src={content.before_url}
            alt={content.before_label || 'Before'}
            width={1200}
            height={800}
            unoptimized
            className="block w-full"
            style={{ width: containerRef.current?.offsetWidth }}
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-md"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 3L2 8L5 13M11 3L14 8L11 13" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Labels */}
        {content.before_label && (
          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
            {content.before_label}
          </span>
        )}
        {content.after_label && (
          <span className="absolute right-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
            {content.after_label}
          </span>
        )}
      </div>
    </div>
  )
}
