import type { VideoEmbedBlockContent } from '@/types/content'

interface VideoEmbedBlockProps {
  content: VideoEmbedBlockContent
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

export function VideoEmbedBlock({ content }: VideoEmbedBlockProps) {
  const embedUrl = getEmbedUrl(content.url, content.provider)
  if (!embedUrl) return null

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ aspectRatio: content.aspect_ratio || '16/9' }}
    >
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
