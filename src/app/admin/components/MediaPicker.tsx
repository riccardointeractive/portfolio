'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, Search, Upload } from 'lucide-react'
import { MediaUploader } from './MediaUploader'
import { cn } from '@/lib/utils'
import { imageSizes } from '@/config/image'
import type { MediaRecord } from '@/types/content'

interface MediaPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (media: MediaRecord) => void
  filter?: 'image' | 'video'
}

export function MediaPicker({ isOpen, onClose, onSelect, filter }: MediaPickerProps) {
  const [items, setItems] = useState<MediaRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUploader, setShowUploader] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '24' })
    if (filter) params.set('type', filter)
    if (search) params.set('q', search)

    try {
      const res = await fetch(`/api/admin/media?${params}`)
      const data = await res.json()
      setItems(data.items ?? [])
      setTotalPages(data.totalPages ?? 1)
    } catch {
      console.error('Failed to fetch media')
    } finally {
      setLoading(false)
    }
  }, [page, filter, search])

  useEffect(() => {
    if (isOpen) fetchMedia()
  }, [isOpen, fetchMedia])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-default bg-surface shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-default px-5 py-4">
          <h3 className="font-display text-lg text-primary">Media Library</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="flex items-center gap-1.5 rounded-lg border border-default px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-hover"
            >
              <Upload size={14} />
              Upload
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-hover">
              <X size={18} className="text-secondary" />
            </button>
          </div>
        </div>

        {/* Upload zone */}
        {showUploader && (
          <div className="border-b border-default p-4">
            <MediaUploader
              onUpload={() => {
                setShowUploader(false)
                fetchMedia()
              }}
            />
          </div>
        )}

        {/* Search */}
        <div className="border-b border-default px-5 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              onKeyDown={(e) => e.key === 'Enter' && fetchMedia()}
              className="w-full rounded-lg border border-default bg-base pl-9 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-default border-t-interactive" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-secondary">No media found</p>
              <p className="mt-1 text-xs text-tertiary">Upload files to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {items.map((item) => {
                const isImage = item.mime_type.startsWith('image/')
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-default transition-all hover:border-border-hover hover:shadow-sm"
                  >
                    {isImage ? (
                      <Image
                        src={item.url}
                        alt={item.alt_text || item.original_name}
                        fill
                        sizes={imageSizes.adminThumbnail}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-elevated">
                        <span className="text-xs text-tertiary">
                          {item.mime_type.split('/')[1]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-overlay opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-default px-5 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                page === 1
                  ? 'cursor-not-allowed text-tertiary'
                  : 'text-secondary hover:bg-hover'
              )}
            >
              Previous
            </button>
            <span className="text-sm text-secondary">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                page === totalPages
                  ? 'cursor-not-allowed text-tertiary'
                  : 'text-secondary hover:bg-hover'
              )}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
