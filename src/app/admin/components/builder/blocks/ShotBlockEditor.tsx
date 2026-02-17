'use client'

import { useState, useEffect } from 'react'
import NextImage from 'next/image'
import { Image } from 'lucide-react'
import { API } from '@/config/routes'
import type { ShotBlockContent, Shot } from '@/types/content'

interface ShotBlockEditorProps {
  content: ShotBlockContent
  onChange: (content: ShotBlockContent) => void
}

export function ShotBlockEditor({ content, onChange }: ShotBlockEditorProps) {
  const [shot, setShot] = useState<Shot | null>(null)
  const [shots, setShots] = useState<Shot[]>([])
  const [showPicker, setShowPicker] = useState(false)

  // Load available shots
  useEffect(() => {
    fetch(`${API.admin.shots}?limit=100`)
      .then((r) => r.json())
      .then((data) => setShots(data.items ?? []))
      .catch(() => {})
  }, [])

  // Load selected shot details
  useEffect(() => {
    if (content.shot_id) {
      fetch(API.admin.shot(content.shot_id))
        .then((r) => r.json())
        .then((data) => {
          if (data.id) setShot(data)
        })
        .catch(() => {})
    }
  }, [content.shot_id])

  return (
    <div className="flex flex-col gap-3">
      {/* Selected shot preview */}
      {shot ? (
        <div className="flex items-center gap-3 rounded-lg border border-border-default bg-base p-3">
          {(shot.thumbnail_url || shot.media_url) ? (
            <NextImage
              src={shot.thumbnail_url || shot.media_url!}
              alt={shot.title}
              width={96}
              height={64}
              className="rounded-md object-cover"
            />
          ) : (
            <div className="flex h-16 w-24 items-center justify-center rounded-md bg-elevated">
              <Image size={20} className="text-tertiary" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-primary">{shot.title}</p>
            <p className="text-xs text-tertiary capitalize">{shot.type}</p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="rounded-lg border border-border-default px-3 py-1.5 text-xs text-secondary transition-colors hover:bg-hover"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowPicker(true)}
          className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border-default py-6 text-sm text-tertiary transition-colors hover:border-border-hover hover:text-secondary"
        >
          <Image size={16} />
          Select a shot
        </button>
      )}

      {/* Shot picker */}
      {showPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
          <div className="relative z-50 max-h-64 overflow-y-auto rounded-lg border border-border-default bg-surface shadow-lg">
            {shots.length === 0 ? (
              <p className="p-4 text-sm text-tertiary">No shots available</p>
            ) : (
              shots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onChange({ ...content, shot_id: s.id })
                    setShot(s)
                    setShowPicker(false)
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-hover"
                >
                  {(s.thumbnail_url || s.media_url) ? (
                    <NextImage
                      src={s.thumbnail_url || s.media_url!}
                      alt={s.title}
                      width={64}
                      height={40}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-16 items-center justify-center rounded bg-elevated">
                      <Image size={14} className="text-tertiary" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-primary">{s.title}</p>
                    <p className="text-xs text-tertiary capitalize">{s.type}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}

      {/* Caption */}
      <input
        type="text"
        value={content.caption || ''}
        onChange={(e) => onChange({ ...content, caption: e.target.value })}
        placeholder="Caption (optional)"
        className="rounded-lg border border-border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
      />
    </div>
  )
}
