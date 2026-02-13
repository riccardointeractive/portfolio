'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { MediaUploader } from './MediaUploader'
import { cn } from '@/lib/utils'
import type { Shot, ShotType } from '@/types/content'

interface ShotEditorProps {
  shot?: Shot | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: ShotFormData) => void
  isSaving?: boolean
}

export interface ShotFormData {
  title: string
  slug: string
  type: ShotType
  description: string
  tags: string[]
  media_url: string | null
  thumbnail_url: string | null
  aspect_ratio: string
  published: boolean
  project_id: string | null
}

const shotTypes: { value: ShotType; label: string }[] = [
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'code', label: 'Code' },
  { value: 'animation', label: 'Animation' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function ShotEditor({ shot, isOpen, onClose, onSave, isSaving }: ShotEditorProps) {
  const [form, setForm] = useState<ShotFormData>({
    title: '',
    slug: '',
    type: 'image',
    description: '',
    tags: [],
    media_url: null,
    thumbnail_url: null,
    aspect_ratio: '16/9',
    published: false,
    project_id: null,
  })
  const [tagInput, setTagInput] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  useEffect(() => {
    if (shot) {
      setForm({
        title: shot.title,
        slug: shot.slug,
        type: shot.type,
        description: shot.description || '',
        tags: shot.tags,
        media_url: shot.media_url,
        thumbnail_url: shot.thumbnail_url,
        aspect_ratio: shot.aspect_ratio,
        published: shot.published,
        project_id: shot.project_id,
      })
      setSlugEdited(true)
    } else {
      setForm({
        title: '',
        slug: '',
        type: 'image',
        description: '',
        tags: [],
        media_url: null,
        thumbnail_url: null,
        aspect_ratio: '16/9',
        published: false,
        project_id: null,
      })
      setSlugEdited(false)
    }
  }, [shot, isOpen])

  const updateField = <K extends keyof ShotFormData>(key: K, value: ShotFormData[K]) => {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col overflow-y-auto bg-surface shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-surface px-5 py-4">
          <h3 className="font-display text-lg text-primary">
            {shot ? 'Edit Shot' : 'New Shot'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-hover">
            <X size={18} className="text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 p-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Shot title"
              required
              className="rounded-lg border border-border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
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
              placeholder="shot-slug"
              required
              className="rounded-lg border border-border-default bg-base px-3 py-2 text-sm font-mono text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Type</label>
            <div className="flex gap-2">
              {shotTypes.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('type', value)}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                    form.type === value
                      ? 'border-interactive bg-interactive text-white'
                      : 'border-default text-secondary hover:bg-hover'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Media */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Media</label>
            <MediaUploader
              value={form.media_url || undefined}
              folder="shots"
              onUpload={(url) => updateField('media_url', url)}
              onRemove={() => updateField('media_url', null)}
            />
          </div>

          {/* Thumbnail */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">
              Thumbnail <span className="text-tertiary">(optional)</span>
            </label>
            <MediaUploader
              value={form.thumbnail_url || undefined}
              folder="shots"
              accept="image/jpeg,image/png,image/webp"
              onUpload={(url) => updateField('thumbnail_url', url)}
              onRemove={() => updateField('thumbnail_url', null)}
            />
          </div>

          {/* Aspect Ratio */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Aspect Ratio</label>
            <select
              value={form.aspect_ratio}
              onChange={(e) => updateField('aspect_ratio', e.target.value)}
              className="rounded-lg border border-border-default bg-base px-3 py-2 text-sm text-primary focus:border-border-hover focus:outline-none"
            >
              <option value="16/9">16:9</option>
              <option value="4/3">4:3</option>
              <option value="1/1">1:1</option>
              <option value="3/4">3:4</option>
              <option value="9/16">9:16</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description..."
              rows={3}
              className="rounded-lg border border-border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-primary">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-md border border-border-default bg-elevated px-2 py-0.5 text-xs text-secondary"
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
                className="flex-1 rounded-lg border border-border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-lg border border-border-default px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-hover"
              >
                Add
              </button>
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateField('published', !form.published)}
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                form.published ? 'bg-interactive' : 'bg-elevated'
              )}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-toggle-knob transition-transform',
                  form.published && 'translate-x-4'
                )}
              />
            </button>
            <span className="text-sm text-primary">Published</span>
          </div>

          {/* Submit */}
          <div className="mt-auto sticky bottom-0 border-t border-border-default bg-surface pt-4 pb-1">
            <button
              type="submit"
              disabled={isSaving || !form.title || !form.slug}
              className={cn(
                'w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                isSaving || !form.title || !form.slug
                  ? 'cursor-not-allowed bg-elevated text-tertiary'
                  : 'bg-interactive text-white hover:bg-interactive-hover'
              )}
            >
              {isSaving ? 'Saving...' : shot ? 'Update Shot' : 'Create Shot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
