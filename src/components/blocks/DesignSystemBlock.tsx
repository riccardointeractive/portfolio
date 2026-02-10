import type { DesignSystemBlockContent } from '@/types/content'

interface DesignSystemBlockProps {
  content: DesignSystemBlockContent
}

export function DesignSystemBlock({ content }: DesignSystemBlockProps) {
  if (!content.title) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-display text-xl text-primary tracking-tight">{content.title}</h3>
        {content.description && (
          <p className="mt-1 text-sm text-secondary">{content.description}</p>
        )}
      </div>

      {content.tokens.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {content.tokens.map((token, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-lg border border-border-default bg-surface p-3"
            >
              {/* Preview */}
              {token.preview_type === 'color' && (
                <div
                  className="h-10 rounded-md border border-border-default"
                  style={{ backgroundColor: token.value }}
                />
              )}
              {token.preview_type === 'text' && (
                <p className="text-lg text-primary" style={{ fontFamily: token.value }}>
                  Aa
                </p>
              )}
              {token.preview_type === 'spacing' && (
                <div className="flex items-end gap-1">
                  <div
                    className="rounded bg-interactive"
                    style={{ width: token.value, height: '24px' }}
                  />
                </div>
              )}

              {/* Label */}
              <div>
                <p className="text-xs font-medium text-primary">{token.name}</p>
                <p className="text-xs font-mono text-tertiary">{token.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
