'use client'

import { Plus, X } from 'lucide-react'
import type { DesignSystemBlockContent } from '@/types/content'

interface DesignSystemBlockEditorProps {
  content: DesignSystemBlockContent
  onChange: (content: DesignSystemBlockContent) => void
}

export function DesignSystemBlockEditor({ content, onChange }: DesignSystemBlockEditorProps) {
  const addToken = () => {
    onChange({
      ...content,
      tokens: [...content.tokens, { name: '', value: '', preview_type: 'color' }],
    })
  }

  const updateToken = (index: number, field: string, value: string) => {
    const tokens = [...content.tokens]
    tokens[index] = { ...tokens[index], [field]: value }
    onChange({ ...content, tokens })
  }

  const removeToken = (index: number) => {
    onChange({
      ...content,
      tokens: content.tokens.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={content.title}
        onChange={(e) => onChange({ ...content, title: e.target.value })}
        placeholder="Section title"
        className="rounded-lg border border-border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
      />

      <textarea
        value={content.description || ''}
        onChange={(e) => onChange({ ...content, description: e.target.value })}
        placeholder="Description (optional)"
        rows={2}
        className="rounded-lg border border-border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none resize-none"
      />

      {/* Tokens */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-tertiary uppercase tracking-wider">Tokens</span>
        {content.tokens.map((token, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={token.name}
              onChange={(e) => updateToken(i, 'name', e.target.value)}
              placeholder="Name"
              className="flex-1 rounded-lg border border-border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
            />
            <input
              type="text"
              value={token.value}
              onChange={(e) => updateToken(i, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1 rounded-lg border border-border-default bg-base px-3 py-1.5 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
            />
            <select
              value={token.preview_type}
              onChange={(e) => updateToken(i, 'preview_type', e.target.value)}
              className="rounded-lg border border-border-default bg-base px-2 py-1.5 text-sm text-primary focus:border-border-hover focus:outline-none"
            >
              <option value="color">Color</option>
              <option value="text">Text</option>
              <option value="spacing">Spacing</option>
            </select>
            <button
              onClick={() => removeToken(i)}
              className="rounded p-1 text-tertiary transition-colors hover:text-error"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <button
          onClick={addToken}
          className="flex items-center gap-1 rounded-lg border border-dashed border-border-default px-3 py-1.5 text-xs text-tertiary transition-colors hover:border-border-hover hover:text-secondary"
        >
          <Plus size={12} />
          Add Token
        </button>
      </div>
    </div>
  )
}
