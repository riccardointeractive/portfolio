'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { MediaUploader } from './MediaUploader'
import { cn } from '@/lib/utils'
import type { Project, ProjectStatus } from '@/types/content'

interface ProjectMetadataFormProps {
  project?: Project | null
  onSave: (data: ProjectFormData) => void
  onCancel: () => void
  isSaving?: boolean
}

export interface ProjectFormData {
  title: string
  slug: string
  client: string
  year: number | null
  role: string
  description: string
  tags: string[]
  cover_image: string | null
  featured: boolean
  status: ProjectStatus
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ProjectMetadataForm({
  project,
  onSave,
  onCancel,
  isSaving,
}: ProjectMetadataFormProps) {
  const [form, setForm] = useState<ProjectFormData>({
    title: '',
    slug: '',
    client: '',
    year: new Date().getFullYear(),
    role: '',
    description: '',
    tags: [],
    cover_image: null,
    featured: false,
    status: 'draft',
  })
  const [tagInput, setTagInput] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title,
        slug: project.slug,
        client: project.client || '',
        year: project.year,
        role: project.role || '',
        description: project.description || '',
        tags: project.tags,
        cover_image: project.cover_image,
        featured: project.featured,
        status: project.status,
      })
      setSlugEdited(true)
    }
  }, [project])

  const updateField = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && !slugEdited) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    updateField('tags', form.tags.filter((t) => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="Project title"
          required
          className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
        />
      </div>

      {/* Slug */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">Slug</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => {
            setSlugEdited(true)
            updateField('slug', e.target.value)
          }}
          placeholder="project-slug"
          required
          className="rounded-lg border border-default bg-base px-3 py-2 text-sm font-mono text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
        />
      </div>

      {/* Client + Year row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Client</label>
          <input
            type="text"
            value={form.client}
            onChange={(e) => updateField('client', e.target.value)}
            placeholder="Client name"
            className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Year</label>
          <input
            type="number"
            value={form.year ?? ''}
            onChange={(e) => updateField('year', e.target.value ? parseInt(e.target.value) : null)}
            placeholder="2024"
            className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
        </div>
      </div>

      {/* Role */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">Role</label>
        <input
          type="text"
          value={form.role}
          onChange={(e) => updateField('role', e.target.value)}
          placeholder="Design & Development"
          className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="Brief project description..."
          rows={3}
          className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none resize-none"
        />
      </div>

      {/* Cover Image */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">Cover Image</label>
        <MediaUploader
          value={form.cover_image || undefined}
          folder="projects"
          accept="image/jpeg,image/png,image/webp"
          onUpload={(url) => updateField('cover_image', url)}
          onRemove={() => updateField('cover_image', null)}
        />
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-primary">Tags</label>
        <div className="flex flex-wrap gap-1.5">
          {form.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-md border border-default bg-elevated px-2 py-0.5 text-xs text-secondary"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Add tag..."
            className="flex-1 rounded-lg border border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-lg border border-default px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-hover"
          >
            Add
          </button>
        </div>
      </div>

      {/* Status + Featured row */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-primary">Status</label>
          <select
            value={form.status}
            onChange={(e) => updateField('status', e.target.value as ProjectStatus)}
            className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary focus:border-border-hover focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => updateField('featured', !form.featured)}
            className={cn(
              'relative h-5 w-9 rounded-full transition-colors',
              form.featured ? 'bg-interactive' : 'bg-elevated'
            )}
          >
            <span
              className={cn(
                'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-toggle-knob transition-transform',
                form.featured && 'translate-x-4'
              )}
            />
          </button>
          <span className="text-sm text-primary">Featured</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving || !form.title || !form.slug}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            isSaving || !form.title || !form.slug
              ? 'cursor-not-allowed bg-elevated text-tertiary'
              : 'bg-interactive text-white hover:bg-interactive-hover'
          )}
        >
          {isSaving ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-default px-4 py-2 text-sm text-secondary transition-colors hover:bg-hover"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
