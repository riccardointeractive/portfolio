'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Star, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { API, ROUTES } from '@/config/routes'
import { Button } from '@/components/ui/Button'
import { AdminFilterTabs } from '@/app/admin/components/AdminFilterTabs'
import { AdminSearchBar } from '@/app/admin/components/AdminSearchBar'
import { EmptyState } from '@/app/admin/components/EmptyState'
import { AdminLoadingSpinner } from '@/app/admin/components/AdminLoadingSpinner'
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
      const res = await fetch(`${API.admin.projects}?${params}`)
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

    await fetch(API.admin.project(project.id), { method: 'DELETE' })
    fetchProjects()
  }

  const handleToggleFeatured = async (project: Project) => {
    await fetch(API.admin.project(project.id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !project.featured }),
    })
    fetchProjects()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => router.push(ROUTES.admin.projectNew)}>
          <Plus size={16} />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <AdminFilterTabs
          filters={statusFilters}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
        <AdminSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
        />
      </div>

      {/* List */}
      {loading ? (
        <AdminLoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          action={
            <Button variant="ghost" onClick={() => router.push(ROUTES.admin.projectNew)}>
              Create your first project
            </Button>
          }
          className="rounded-xl border border-dashed border-border-default"
        />
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
                  onClick={() => router.push(ROUTES.admin.projectBuilder(project.id))}
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
                        onClick={() => router.push(ROUTES.admin.projectBuilder(project.id))}
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
  return <ProjectsContent />
}
