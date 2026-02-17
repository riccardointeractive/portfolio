'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { API } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { AdminFilterTabs } from '@/app/admin/components/AdminFilterTabs'
import { AdminSearchBar } from '@/app/admin/components/AdminSearchBar'
import { EmptyState } from '@/app/admin/components/EmptyState'
import { AdminLoadingSpinner } from '@/app/admin/components/AdminLoadingSpinner'
import { AdminPagination } from '@/app/admin/components/AdminPagination'
import { ShotCard } from '@/app/admin/components/ShotCard'
import { ShotEditor, type ShotFormData } from '@/app/admin/components/ShotEditor'
import type { Shot } from '@/types/content'

const typeFilters = [
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
      const res = await fetch(`${API.admin.shots}?${params}`)
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
        ? API.admin.shot(editingShot.id)
        : API.admin.shots
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

    await fetch(API.admin.shot(shot.id), { method: 'DELETE' })
    fetchShots()
  }

  const handleTogglePublish = async (shot: Shot) => {
    await fetch(API.admin.shot(shot.id), {
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
        <Button onClick={() => openEditor()}>
          <Plus size={16} />
          New Shot
        </Button>
      </div>

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
          placeholder="Search shots..."
        />
      </div>

      {/* Grid */}
      {loading ? (
        <AdminLoadingSpinner />
      ) : shots.length === 0 ? (
        <EmptyState
          title="No shots yet"
          action={
            <Button variant="ghost" onClick={() => openEditor()}>
              Create your first shot
            </Button>
          }
          className="rounded-xl border border-dashed border-border-default"
        />
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

      <AdminPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

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
  return <ShotsContent />
}
