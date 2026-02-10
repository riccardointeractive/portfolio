'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { AdminAuthGuard } from '@/app/admin/components/AdminAuthGuard'
import { ShotCard } from '@/app/admin/components/ShotCard'
import { ShotEditor, type ShotFormData } from '@/app/admin/components/ShotEditor'
import { cn } from '@/lib/utils'
import type { Shot, ShotType } from '@/types/content'

const typeFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'code', label: 'Code' },
  { value: 'animation', label: 'Animation' },
]

function ShotsContent() {
  const [shots, setShots] = useState<Shot[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingShot, setEditingShot] = useState<Shot | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const fetchShots = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '24' })
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (search) params.set('q', search)

    try {
      const res = await fetch(`/api/admin/shots?${params}`)
      const data = await res.json()
      setShots(data.items ?? [])
      setTotalPages(data.totalPages ?? 1)
    } catch {
      console.error('Failed to fetch shots')
    } finally {
      setLoading(false)
    }
  }, [page, typeFilter, search])

  useEffect(() => {
    fetchShots()
  }, [fetchShots])

  const handleSave = async (formData: ShotFormData) => {
    setIsSaving(true)
    try {
      const url = editingShot
        ? `/api/admin/shots/${editingShot.id}`
        : '/api/admin/shots'
      const method = editingShot ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setEditorOpen(false)
        setEditingShot(null)
        fetchShots()
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (shot: Shot) => {
    if (!confirm(`Delete "${shot.title}"?`)) return

    await fetch(`/api/admin/shots/${shot.id}`, { method: 'DELETE' })
    fetchShots()
  }

  const handleTogglePublish = async (shot: Shot) => {
    await fetch(`/api/admin/shots/${shot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !shot.published }),
    })
    fetchShots()
  }

  const openEditor = (shot?: Shot) => {
    setEditingShot(shot ?? null)
    setEditorOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-primary">Shots</h1>
          <p className="mt-1 text-sm text-secondary">
            Manage your visual content — images, videos, code snippets, animations.
          </p>
        </div>
        <button
          onClick={() => openEditor()}
          className="flex items-center gap-1.5 rounded-lg bg-interactive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-interactive-hover"
        >
          <Plus size={16} />
          New Shot
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {typeFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setTypeFilter(value)
                setPage(1)
              }}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                typeFilter === value
                  ? 'bg-elevated text-primary font-medium'
                  : 'text-secondary hover:bg-hover'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
          <input
            type="text"
            placeholder="Search shots..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-border-default bg-base pl-9 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-default border-t-interactive" />
        </div>
      ) : shots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default py-20">
          <p className="text-sm text-secondary">No shots yet</p>
          <button
            onClick={() => openEditor()}
            className="mt-3 text-sm text-interactive hover:underline"
          >
            Create your first shot
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shots.map((shot) => (
            <ShotCard
              key={shot.id}
              shot={shot}
              onEdit={openEditor}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      {/* Editor */}
      <ShotEditor
        shot={editingShot}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false)
          setEditingShot(null)
        }}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  )
}

export default function ShotsPage() {
  return (
    <AdminAuthGuard>
      <ShotsContent />
    </AdminAuthGuard>
  )
}
