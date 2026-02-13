'use client'

import { useState } from 'react'
import { GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockType } from '@/types/content'

interface BlockWrapperProps {
  type: BlockType
  children: React.ReactNode
  onDelete: () => void
  dragHandleProps?: Record<string, unknown>
}

const typeLabels: Record<BlockType, string> = {
  text: 'Text',
  shot: 'Shot',
  media: 'Media',
  compare: 'Compare',
  'design-system': 'Design System',
  quote: 'Quote',
  'video-embed': 'Video Embed',
}

export function BlockWrapper({ type, children, onDelete, dragHandleProps }: BlockWrapperProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="rounded-xl border border-border-default bg-surface transition-colors hover:border-border-hover">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border-default px-3 py-2">
        {/* Drag handle */}
        <button
          className="cursor-grab rounded p-0.5 text-tertiary transition-colors hover:text-secondary active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical size={16} />
        </button>

        {/* Type label */}
        <span className="text-xs font-medium uppercase tracking-wider text-tertiary">
          {typeLabels[type]}
        </span>

        <div className="flex-1" />

        {/* Collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-0.5 text-tertiary transition-colors hover:text-secondary"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="rounded p-0.5 text-tertiary transition-colors hover:text-error"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className={cn('p-4', collapsed && 'hidden')}>{children}</div>
    </div>
  )
}
