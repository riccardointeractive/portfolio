'use client'

import { MediaUploader } from '@/app/admin/components/MediaUploader'
import type { CompareBlockContent } from '@/types/content'

interface CompareBlockEditorProps {
  content: CompareBlockContent
  onChange: (content: CompareBlockContent) => void
}

export function CompareBlockEditor({ content, onChange }: CompareBlockEditorProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-tertiary uppercase tracking-wider">Before</span>
          <MediaUploader
            value={content.before_url || undefined}
            folder="projects"
            accept="image/jpeg,image/png,image/webp"
            onUpload={(url) => onChange({ ...content, before_url: url })}
            onRemove={() => onChange({ ...content, before_url: '' })}
          />
          <input
            type="text"
            value={content.before_label || ''}
            onChange={(e) => onChange({ ...content, before_label: e.target.value })}
            placeholder="Before label"
            className="rounded-lg border border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
        </div>

        {/* After */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-tertiary uppercase tracking-wider">After</span>
          <MediaUploader
            value={content.after_url || undefined}
            folder="projects"
            accept="image/jpeg,image/png,image/webp"
            onUpload={(url) => onChange({ ...content, after_url: url })}
            onRemove={() => onChange({ ...content, after_url: '' })}
          />
          <input
            type="text"
            value={content.after_label || ''}
            onChange={(e) => onChange({ ...content, after_label: e.target.value })}
            placeholder="After label"
            className="rounded-lg border border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
