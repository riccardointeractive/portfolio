import { TextBlock } from './TextBlock'
import { ShotBlock } from './ShotBlock'
import { MediaBlock } from './MediaBlock'
import { CompareBlock } from './CompareBlock'
import { QuoteBlock } from './QuoteBlock'
import { VideoEmbedBlock } from './VideoEmbedBlock'
import { DesignSystemBlock } from './DesignSystemBlock'
import type {
  ProjectBlock,
  TextBlockContent,
  ShotBlockContent,
  MediaBlockContent,
  CompareBlockContent,
  QuoteBlockContent,
  VideoEmbedBlockContent,
  DesignSystemBlockContent,
} from '@/types/content'

interface BlockRendererProps {
  block: ProjectBlock
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case 'text':
      return <TextBlock content={block.content as TextBlockContent} />
    case 'shot':
      return <ShotBlock content={block.content as ShotBlockContent} />
    case 'media':
      return <MediaBlock content={block.content as MediaBlockContent} />
    case 'compare':
      return <CompareBlock content={block.content as CompareBlockContent} />
    case 'quote':
      return <QuoteBlock content={block.content as QuoteBlockContent} />
    case 'video-embed':
      return <VideoEmbedBlock content={block.content as VideoEmbedBlockContent} />
    case 'design-system':
      return <DesignSystemBlock content={block.content as DesignSystemBlockContent} />
    default:
      return null
  }
}
