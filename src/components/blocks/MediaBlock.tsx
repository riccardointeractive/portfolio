import type { MediaBlockContent } from '@/types/content'

interface MediaBlockProps {
  content: MediaBlockContent
}

export function MediaBlock({ content }: MediaBlockProps) {
  if (!content.url) return null

  const isVideo = content.url.match(/\.(mp4|webm)(\?|$)/i)

  return (
    <figure className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl">
        {isVideo ? (
          <video
            src={content.url}
            className="w-full"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={content.url}
            alt={content.alt}
            className="w-full"
            width={content.width}
            height={content.height}
          />
        )}
      </div>
      {content.caption && (
        <figcaption className="text-center text-sm text-tertiary">
          {content.caption}
        </figcaption>
      )}
    </figure>
  )
}
