import type { QuoteBlockContent } from '@/types/content'

interface QuoteBlockProps {
  content: QuoteBlockContent
}

export function QuoteBlock({ content }: QuoteBlockProps) {
  if (!content.text) return null

  return (
    <blockquote className="border-l-2 border-border-default pl-6 py-2">
      <p className="text-lg text-primary italic leading-relaxed">
        &ldquo;{content.text}&rdquo;
      </p>
      {(content.attribution || content.role) && (
        <footer className="mt-3 text-sm text-secondary">
          {content.attribution && <span className="font-medium">{content.attribution}</span>}
          {content.attribution && content.role && <span> &mdash; </span>}
          {content.role && <span className="text-tertiary">{content.role}</span>}
        </footer>
      )}
    </blockquote>
  )
}
