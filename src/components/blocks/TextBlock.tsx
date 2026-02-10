import ReactMarkdown from 'react-markdown'
import type { TextBlockContent } from '@/types/content'

interface TextBlockProps {
  content: TextBlockContent
}

export function TextBlock({ content }: TextBlockProps) {
  if (!content.markdown) return null

  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-p:text-secondary prose-a:text-interactive prose-a:no-underline hover:prose-a:underline prose-strong:text-primary prose-code:font-mono prose-code:text-sm">
      <ReactMarkdown>{content.markdown}</ReactMarkdown>
    </div>
  )
}
