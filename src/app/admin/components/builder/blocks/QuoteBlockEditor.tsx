'use client'

import type { QuoteBlockContent } from '@/types/content'

interface QuoteBlockEditorProps {
  content: QuoteBlockContent
  onChange: (content: QuoteBlockContent) => void
}

export function QuoteBlockEditor({ content, onChange }: QuoteBlockEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={content.text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Quote text..."
        rows={3}
        className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none resize-none"
      />

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          value={content.attribution || ''}
          onChange={(e) => onChange({ ...content, attribution: e.target.value })}
          placeholder="Attribution"
          className="rounded-lg border border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
        />
        <input
          type="text"
          value={content.role || ''}
          onChange={(e) => onChange({ ...content, role: e.target.value })}
          placeholder="Role / Title"
          className="rounded-lg border border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
        />
      </div>
    </div>
  )
}
