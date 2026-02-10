import Image from 'next/image'
import { getShotById } from '@/lib/data/projects'
import type { ShotBlockContent } from '@/types/content'
import { imageSizes } from '@/config/image'

interface ShotBlockProps {
  content: ShotBlockContent
}

export async function ShotBlock({ content }: ShotBlockProps) {
  if (!content.shot_id) return null

  const shot = await getShotById(content.shot_id)
  if (!shot || !shot.media_url) return null

  const isVideo = shot.media_url.match(/\.(mp4|webm)(\?|$)/i)

  return (
    <figure className="flex flex-col gap-3">
      <div className="overflow-hidden rounded-xl">
        {isVideo ? (
          <video
            src={shot.media_url}
            className="w-full"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="relative aspect-video">
            <Image
              src={shot.media_url}
              alt={shot.title}
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
