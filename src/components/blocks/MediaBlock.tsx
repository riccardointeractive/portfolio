import Image from 'next/image'
import type { MediaBlockContent } from '@/types/content'
import { imageSizes } from '@/config/image'

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
        ) : content.width && content.height ? (
          <Image
            src={content.url}
            alt={content.alt}
            width={content.width}
            height={content.height}
            sizes={imageSizes.content}
            className="w-full"
          />
        ) : (
          <div className="relative aspect-video">
            <Image
              src={content.url}
              alt={content.alt}
              fill
              sizes={imageSizes.content}
              className="object-cover"
            />
          </div>
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
