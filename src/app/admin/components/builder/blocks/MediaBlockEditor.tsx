'use client'

import { MediaUploader } from '@/app/admin/components/MediaUploader'
import type { MediaBlockContent } from '@/types/content'

interface MediaBlockEditorProps {
  content: MediaBlockContent
  onChange: (content: MediaBlockContent) => void
}

export function MediaBlockEditor({ content, onChange }: MediaBlockEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <MediaUploader
        value={content.url || undefined}
        folder="projects"
        onUpload={(url) => onChange({ ...content, url })}
        onRemove={() => onChange({ ...content, url: '' })}
      />

      <input
        type="text"
        value={content.alt}
        onChange={(e) => onChange({ ...content, alt: e.target.value })}
        placeholder="Alt text"
        className="rounded-lg border border-border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
      />

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
