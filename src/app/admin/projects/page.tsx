'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Star, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AdminAuthGuard } from '@/app/admin/components/AdminAuthGuard'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/content'

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
]

function ProjectsContent() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (search) params.set('q', search)

    try {
      const res = await fetch(`/api/admin/projects?${params}`)
      const data = await res.json()
      setProjects(data.items ?? [])
    } catch {
      console.error('Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.title}" and all its blocks?`)) return

    await fetch(`/api/admin/projects/${project.id}`, { method: 'DELETE' })
    fetchProjects()
  }

  const handleToggleFeatured = async (project: Project) => {
    await fetch(`/api/admin/projects/${project.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !project.featured }),
    })
    fetchProjects()
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-primary">Projects</h1>
          <p className="mt-1 text-sm text-secondary">
            Study cases — create and manage your portfolio projects.
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/projects/new')}
          className="flex items-center gap-1.5 rounded-lg bg-interactive px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-interactive-hover"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm transition-colors',
                statusFilter === value
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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-base pl-9 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border-default border-t-interactive" />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default py-20">
          <p className="text-sm text-secondary">No projects yet</p>
          <button
            onClick={() => router.push('/admin/projects/new')}
            className="mt-3 text-sm text-interactive hover:underline"
          >
            Create your first project
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-default">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-elevated">
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                  Title
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider sm:table-cell">
                  Client
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider md:table-cell">
                  Year
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="transition-colors hover:bg-hover cursor-pointer"
                  onClick={() => router.push(`/admin/projects/${project.id}/builder`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{project.title}</span>
                      {project.featured && (
                        <Star size={12} className="fill-current text-warning" />
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-secondary sm:table-cell">
                    {project.client || '—'}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-secondary md:table-cell">
                    {project.year || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                        project.status === 'published'
                          ? 'bg-success-subtle text-success'
                          : 'bg-elevated text-tertiary'
                      )}
                    >
                      {project.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className="rounded-lg p-1.5 text-tertiary transition-colors hover:bg-elevated hover:text-secondary"
                        title={project.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star size={14} className={project.featured ? 'fill-current text-warning' : ''} />
                      </button>
                      <button
                        onClick={() => router.push(`/admin/projects/${project.id}/builder`)}
                        className="rounded-lg p-1.5 text-tertiary transition-colors hover:bg-elevated hover:text-secondary"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(project)}
                        className="rounded-lg p-1.5 text-tertiary transition-colors hover:bg-elevated hover:text-error"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <AdminAuthGuard>
      <ProjectsContent />
    </AdminAuthGuard>
  )
}
