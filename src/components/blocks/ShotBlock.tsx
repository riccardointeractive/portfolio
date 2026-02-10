import { getShotById } from '@/lib/data/projects'
import type { ShotBlockContent } from '@/types/content'

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
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={shot.media_url}
            alt={shot.title}
            className="w-full"
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
