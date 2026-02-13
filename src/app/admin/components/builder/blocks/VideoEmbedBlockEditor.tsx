'use client'

import type { VideoEmbedBlockContent } from '@/types/content'

interface VideoEmbedBlockEditorProps {
  content: VideoEmbedBlockContent
  onChange: (content: VideoEmbedBlockContent) => void
}

function detectProvider(url: string): VideoEmbedBlockContent['provider'] {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('vimeo.com')) return 'vimeo'
  if (url.includes('loom.com')) return 'loom'
  return 'other'
}

function getEmbedUrl(url: string, provider: string): string | null {
  try {
    if (provider === 'youtube') {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?]+)/)
      return match ? `https://www.youtube.com/embed/${match[1]}` : null
    }
    if (provider === 'vimeo') {
      const match = url.match(/vimeo\.com\/(\d+)/)
      return match ? `https://player.vimeo.com/video/${match[1]}` : null
    }
    if (provider === 'loom') {
      const match = url.match(/loom\.com\/share\/([a-z0-9]+)/i)
      return match ? `https://www.loom.com/embed/${match[1]}` : null
    }
  } catch {
    return null
  }
  return null
}

export function VideoEmbedBlockEditor({ content, onChange }: VideoEmbedBlockEditorProps) {
  const embedUrl = content.url ? getEmbedUrl(content.url, content.provider) : null

  return (
    <div className="flex flex-col gap-3">
      <input
        type="url"
        value={content.url}
        onChange={(e) => {
          const url = e.target.value
          onChange({ ...content, url, provider: detectProvider(url) })
        }}
        placeholder="Paste video URL (YouTube, Vimeo, Loom)"
        className="rounded-lg border border-default bg-base px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
      />

      {content.url && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary">Provider:</span>
          <span className="rounded-md bg-elevated px-2 py-0.5 text-xs font-medium text-secondary capitalize">
            {content.provider}
          </span>
        </div>
      )}

      {embedUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-default">
          <iframe
            src={embedUrl}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
