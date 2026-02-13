'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Trash2, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AdminFilterTabs } from '@/app/admin/components/AdminFilterTabs'
import { AdminSearchBar } from '@/app/admin/components/AdminSearchBar'
import { EmptyState } from '@/app/admin/components/EmptyState'
import { AdminLoadingSpinner } from '@/app/admin/components/AdminLoadingSpinner'
import { AdminPagination } from '@/app/admin/components/AdminPagination'
import { MediaUploader } from '@/app/admin/components/MediaUploader'
import { cn } from '@/lib/utils'
import { imageSizes } from '@/config/image'
import type { MediaRecord } from '@/types/content'

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
]

function MediaContent() {
  const [items, setItems] = useState<MediaRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<MediaRecord | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showUploader, setShowUploader] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '24' })
    if (typeFilter !== 'all') params.set('type', typeFilter)
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
  }, [page, typeFilter, search])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleDelete = async (media: MediaRecord) => {
    if (!confirm(`Delete "${media.original_name}"?`)) return

    await fetch(`/api/admin/media?id=${media.id}`, { method: 'DELETE' })
    setSelected(null)
    fetchMedia()
  }

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFilterChange = (value: string) => {
    setTypeFilter(value)
    setPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => setShowUploader(!showUploader)}>
          Upload
        </Button>
      </div>

      {/* Upload zone */}
      {showUploader && (
        <MediaUploader
          onUpload={() => {
            setShowUploader(false)
            fetchMedia()
          }}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminFilterTabs
          filters={typeFilters}
          activeFilter={typeFilter}
          onFilterChange={handleFilterChange}
        />
        <AdminSearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search files..."
        />
      </div>

      <div className="flex gap-6">
        {/* Grid */}
        <div className="flex-1">
          {loading ? (
            <AdminLoadingSpinner />
          ) : items.length === 0 ? (
            <EmptyState
              title="No media files"
              action={
                <Button variant="ghost" onClick={() => setShowUploader(true)}>
                  Upload your first file
                </Button>
              }
              className="rounded-xl border border-dashed border-border-default"
            />
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {items.map((item) => {
                const isImage = item.mime_type.startsWith('image/')
                const isSelected = selected?.id === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelected(isSelected ? null : item)}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-lg border transition-all',
                      isSelected
                        ? 'border-interactive ring-2 ring-interactive/20'
                        : 'border-default hover:border-border-hover'
                    )}
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
                        <span className="text-xs font-medium text-tertiary">
                          {item.mime_type.split('/')[1]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <AdminPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="hidden w-72 shrink-0 flex-col gap-4 rounded-xl border border-border-default bg-surface p-4 lg:flex">
            {/* Preview */}
            {selected.mime_type.startsWith('image/') ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={selected.url}
                  alt={selected.alt_text || selected.original_name}
                  fill
                  sizes={imageSizes.adminPreview}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-elevated">
                <span className="text-sm text-tertiary">
                  {selected.mime_type.split('/')[1]?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <span className="text-tertiary">Filename</span>
                <p className="text-primary truncate">{selected.original_name}</p>
              </div>
              <div>
                <span className="text-tertiary">Type</span>
                <p className="text-primary">{selected.mime_type}</p>
              </div>
              <div>
                <span className="text-tertiary">Size</span>
                <p className="text-primary">{formatBytes(selected.size_bytes)}</p>
              </div>
              {selected.width && selected.height && (
                <div>
                  <span className="text-tertiary">Dimensions</span>
                  <p className="text-primary">{selected.width} x {selected.height}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 border-t border-border-default pt-3">
              <button
                onClick={() => copyUrl(selected.url, selected.id)}
                className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-hover"
              >
                {copiedId === selected.id ? <Check size={14} /> : <Copy size={14} />}
                {copiedId === selected.id ? 'Copied!' : 'Copy URL'}
              </button>
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-hover"
              >
                <ExternalLink size={14} />
                Open in new tab
              </a>
              <button
                onClick={() => handleDelete(selected)}
                className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-1.5 text-sm text-error transition-colors hover:bg-hover"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MediaPage() {
  return <MediaContent />
}
