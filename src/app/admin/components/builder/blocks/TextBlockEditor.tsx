'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { TextBlockContent } from '@/types/content'

interface TextBlockEditorProps {
  content: TextBlockContent
  onChange: (content: TextBlockContent) => void
}

export function TextBlockEditor({ content, onChange }: TextBlockEditorProps) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <button
          onClick={() => setPreview(false)}
          className={cn(
            'rounded-md px-2 py-1 text-xs transition-colors',
            !preview ? 'bg-elevated text-primary' : 'text-tertiary hover:text-secondary'
          )}
        >
          Write
        </button>
        <button
          onClick={() => setPreview(true)}
          className={cn(
            'rounded-md px-2 py-1 text-xs transition-colors',
            preview ? 'bg-elevated text-primary' : 'text-tertiary hover:text-secondary'
          )}
        >
          Preview
        </button>
      </div>

      {preview ? (
        <div className="min-h-[120px] rounded-lg border border-default bg-base p-3 text-sm text-primary prose prose-sm max-w-none">
          {content.markdown || (
            <span className="text-tertiary">Nothing to preview</span>
          )}
        </div>
      ) : (
        <textarea
          value={content.markdown}
          onChange={(e) => onChange({ markdown: e.target.value })}
          placeholder="Write markdown content..."
          rows={6}
          className="rounded-lg border border-default bg-base px-3 py-2 text-sm font-mono text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none resize-y"
        />
      )}
    </div>
  )
}
