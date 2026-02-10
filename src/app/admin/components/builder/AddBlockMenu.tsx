'use client'

import { useState } from 'react'
import {
  Plus,
  Type,
  Image,
  Upload,
  Columns,
  Quote,
  Play,
  Palette,
} from 'lucide-react'
import type { BlockType, BlockContent } from '@/types/content'

interface AddBlockMenuProps {
  onAdd: (type: BlockType, content: BlockContent) => void
}

const blockOptions: {
  type: BlockType
  label: string
  icon: React.ReactNode
  defaultContent: BlockContent
}[] = [
  {
    type: 'text',
    label: 'Text',
    icon: <Type size={16} />,
    defaultContent: { markdown: '' },
  },
  {
    type: 'shot',
    label: 'Shot Reference',
    icon: <Image size={16} />,
    defaultContent: { shot_id: '' },
  },
  {
    type: 'media',
    label: 'Media',
    icon: <Upload size={16} />,
    defaultContent: { url: '', alt: '' },
  },
  {
    type: 'compare',
    label: 'Before / After',
    icon: <Columns size={16} />,
    defaultContent: { before_url: '', after_url: '' },
  },
  {
    type: 'quote',
    label: 'Quote',
    icon: <Quote size={16} />,
    defaultContent: { text: '' },
  },
  {
    type: 'video-embed',
    label: 'Video Embed',
    icon: <Play size={16} />,
    defaultContent: { url: '', provider: 'youtube' as const },
  },
  {
    type: 'design-system',
    label: 'Design System',
    icon: <Palette size={16} />,
    defaultContent: { title: '', tokens: [] },
  },
]

export function AddBlockMenu({ onAdd }: AddBlockMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative flex justify-center py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-border-default px-3 py-1.5 text-sm text-tertiary transition-colors hover:border-border-hover hover:text-secondary"
      >
        <Plus size={14} />
        Add Block
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-default bg-surface shadow-lg">
            {blockOptions.map(({ type, label, icon, defaultContent }) => (
              <button
                key={type}
                onClick={() => {
                  onAdd(type, defaultContent)
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-secondary transition-colors hover:bg-hover hover:text-primary"
              >
                <span className="text-tertiary">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
