'use client'

import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Shot } from '@/types/content'

interface ShotCardProps {
  shot: Shot
  onEdit: (shot: Shot) => void
  onDelete: (shot: Shot) => void
  onTogglePublish: (shot: Shot) => void
}

const typeColors: Record<string, string> = {
  image: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  video: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  code: 'bg-green-500/10 text-green-600 dark:text-green-400',
  animation: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
}

export function ShotCard({ shot, onEdit, onDelete, onTogglePublish }: ShotCardProps) {
  const isImage = shot.media_url?.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)

  return (
    <div className="group overflow-hidden rounded-xl border border-border-default bg-surface transition-all hover:border-border-hover hover:shadow-sm">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-elevated">
        {shot.thumbnail_url || (shot.media_url && isImage) ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={shot.thumbnail_url || shot.media_url!}
            alt={shot.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-lg text-tertiary">{shot.title}</span>
          </div>
        )}

        {/* Type badge */}
        <span
          className={cn(
            'absolute left-2 top-2 rounded-md px-2 py-0.5 text-xs font-medium capitalize',
            typeColors[shot.type] || 'bg-elevated text-secondary'
          )}
        >
          {shot.type}
        </span>

        {/* Published indicator */}
        {!shot.published && (
          <span className="absolute right-2 top-2 rounded-md bg-elevated px-2 py-0.5 text-xs text-tertiary">
            Draft
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h4 className="text-sm font-medium text-primary truncate">{shot.title}</h4>
        {shot.description && (
          <p className="mt-1 text-xs text-secondary line-clamp-2">{shot.description}</p>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-1">
          <button
            onClick={() => onEdit(shot)}
            className="rounded-lg p-1.5 text-tertiary transition-colors hover:bg-hover hover:text-secondary"
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onTogglePublish(shot)}
            className="rounded-lg p-1.5 text-tertiary transition-colors hover:bg-hover hover:text-secondary"
            title={shot.published ? 'Unpublish' : 'Publish'}
          >
            {shot.published ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={() => onDelete(shot)}
            className="rounded-lg p-1.5 text-tertiary transition-colors hover:bg-hover hover:text-red-500"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
