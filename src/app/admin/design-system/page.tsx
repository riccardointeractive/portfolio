'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { AdminPageHeader } from '../components/AdminPageHeader'
import { Badge } from '@/components/ui/Badge'
import { colors, typography, spacing, radius, transitions, shadows } from '@/config/design-tokens'

export default function DesignSystemPage() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-10">
        <AdminPageHeader
          title="Design System"
          description="Live preview of all design tokens, typography, and components. Everything here is rendered from the actual CSS variables and Tailwind classes."
        />
      </div>

      <div className="space-y-16">
        <ColorsSection />
        <TypographySection />
        <SpacingSection />
        <RadiusSection />
        <ShadowsSection />
        <TransitionsSection />
        <ComponentsSection />
      </div>
    </>
  )
}

// ============================================================================
// Section wrapper
// ============================================================================

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-1 font-display text-2xl text-primary">{title}</h2>
        <p className="text-sm text-secondary">{description}</p>
      </div>
      {children}
    </section>
  )
}

// ============================================================================
// Copy button helper
// ============================================================================

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className="rounded p-1 text-tertiary transition-colors hover:bg-hover hover:text-primary"
      title={`Copy: ${value}`}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  )
}

// ============================================================================
// Colors Section
// ============================================================================

function ColorsSection() {
  const bgTokens = [
    { name: 'bg-base', css: '--bg-base', tw: 'bg-base', light: colors.light.bg.base, dark: colors.dark.bg.base },
    { name: 'bg-surface', css: '--bg-surface', tw: 'bg-surface', light: colors.light.bg.surface, dark: colors.dark.bg.surface },
    { name: 'bg-elevated', css: '--bg-elevated', tw: 'bg-elevated', light: colors.light.bg.elevated, dark: colors.dark.bg.elevated },
    { name: 'bg-hover', css: '--bg-hover', tw: 'bg-hover', light: colors.light.bg.hover, dark: colors.dark.bg.hover },
    { name: 'bg-active', css: '--bg-active', tw: 'bg-active', light: colors.light.bg.active, dark: colors.dark.bg.active },
  ]

  const textTokens = [
    { name: 'text-primary', css: '--text-primary', tw: 'text-primary', light: colors.light.text.primary, dark: colors.dark.text.primary },
    { name: 'text-secondary', css: '--text-secondary', tw: 'text-secondary', light: colors.light.text.secondary, dark: colors.dark.text.secondary },
    { name: 'text-tertiary', css: '--text-tertiary', tw: 'text-tertiary', light: colors.light.text.tertiary, dark: colors.dark.text.tertiary },
  ]

  const borderTokens = [
    { name: 'border-default', css: '--border-default', tw: 'border-default', light: colors.light.border.default, dark: colors.dark.border.default },
    { name: 'border-hover', css: '--border-hover', tw: 'border-border-hover', light: colors.light.border.hover, dark: colors.dark.border.hover },
    { name: 'border-active', css: '--border-active', tw: 'border-border-active', light: colors.light.border.active, dark: colors.dark.border.active },
  ]

  const interactiveTokens = [
    { name: 'interactive', css: '--interactive', tw: 'text-interactive', light: colors.light.interactive.default, dark: colors.dark.interactive.default },
    { name: 'interactive-hover', css: '--interactive-hover', tw: 'text-interactive-hover', light: colors.light.interactive.hover, dark: colors.dark.interactive.hover },
  ]

  return (
    <Section title="Colors" description="Semantic color tokens. All adapt automatically to light/dark mode.">
      <div className="space-y-8">
        <ColorGroup title="Backgrounds" tokens={bgTokens} type="bg" />
        <ColorGroup title="Text" tokens={textTokens} type="text" />
        <ColorGroup title="Borders" tokens={borderTokens} type="border" />
        <ColorGroup title="Interactive" tokens={interactiveTokens} type="text" />
      </div>
    </Section>
  )
}

interface ColorToken {
  name: string
  css: string
  tw: string
  light: string
  dark: string
}

function ColorGroup({ title, tokens, type }: { title: string; tokens: ColorToken[]; type: 'bg' | 'text' | 'border' }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-secondary">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tokens.map((token) => (
          <div
            key={token.name}
            className="flex items-center gap-3 rounded-xl border border-default bg-surface p-3"
          >
            {/* Swatch */}
            <div className="flex gap-1">
              <div
                className="h-10 w-10 rounded-lg border border-default"
                style={{
                  backgroundColor: type === 'bg' ? `var(${token.css})` : undefined,
                  borderColor: type === 'border' ? `var(${token.css})` : undefined,
                  borderWidth: type === 'border' ? '2px' : undefined,
                }}
              >
                {type === 'text' && (
                  <div
                    className="flex h-full items-center justify-center font-display text-lg"
                    style={{ color: `var(${token.css})` }}
                  >
                    Aa
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary">{token.name}</span>
                <CopyButton value={token.tw} />
              </div>
              <div className="flex gap-2 text-xs text-tertiary">
                <span className="font-mono">{token.light}</span>
                <span>/</span>
                <span className="font-mono">{token.dark}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Typography Section
// ============================================================================

function TypographySection() {
  const fonts = [
    { name: 'Display', family: typography.fontFamily.display, tw: 'font-display', sample: 'Clash Display' },
    { name: 'Sans', family: typography.fontFamily.sans, tw: 'font-sans', sample: 'Switzer' },
    { name: 'Mono', family: typography.fontFamily.mono, tw: 'font-mono', sample: 'Geist Mono' },
  ]

  const sizes = [
    { name: 'text-xs', size: '12px', leading: '16px' },
    { name: 'text-sm', size: '14px', leading: '20px' },
    { name: 'text-base', size: '16px', leading: '24px' },
    { name: 'text-lg', size: '18px', leading: '28px' },
    { name: 'text-xl', size: '20px', leading: '28px' },
    { name: 'text-2xl', size: '24px', leading: '32px' },
    { name: 'text-3xl', size: '30px', leading: '36px' },
    { name: 'text-4xl', size: '36px', leading: '40px' },
  ]

  return (
    <Section title="Typography" description="Font families and size scale used across the portfolio.">
      <div className="space-y-8">
        {/* Font families */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Font Families</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            {fonts.map((font) => (
              <div
                key={font.name}
                className="rounded-xl border border-default bg-surface p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <Badge>{font.tw}</Badge>
                  <CopyButton value={font.tw} />
                </div>
                <div
                  className="mb-2 text-3xl text-primary"
                  style={{ fontFamily: font.family }}
                >
                  {font.sample}
                </div>
                <p className="font-mono text-xs text-tertiary">{font.family}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Size scale */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Size Scale</h3>
          <div className="rounded-xl border border-default bg-surface">
            {sizes.map((s, i) => (
              <div
                key={s.name}
                className={`flex items-center gap-4 px-5 py-3 ${i < sizes.length - 1 ? 'border-b border-default' : ''}`}
              >
                <div className="flex w-20 items-center gap-1">
                  <span className="font-mono text-xs text-tertiary">{s.name}</span>
                  <CopyButton value={s.name} />
                </div>
                <span className="w-20 font-mono text-xs text-tertiary">{s.size}</span>
                <span
                  className="flex-1 truncate text-primary"
                  style={{ fontSize: s.size, lineHeight: s.leading }}
                >
                  The quick brown fox jumps over the lazy dog
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Heading hierarchy */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Heading Hierarchy (Clash Display)</h3>
          <div className="space-y-4 rounded-xl border border-default bg-surface p-6">
            <div className="font-display text-5xl tracking-tight text-primary">Heading 1</div>
            <div className="font-display text-4xl tracking-tight text-primary">Heading 2</div>
            <div className="font-display text-3xl text-primary">Heading 3</div>
            <div className="font-display text-2xl text-primary">Heading 4</div>
            <div className="font-display text-xl text-primary">Heading 5</div>
            <div className="font-display text-lg text-primary">Heading 6</div>
          </div>
        </div>

        {/* Body text */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Body Text (Switzer)</h3>
          <div className="rounded-xl border border-default bg-surface p-6">
            <p className="mb-4 text-base leading-relaxed text-primary">
              This is body text using Switzer at the base size. It&apos;s designed for readability
              and comfortable scanning across all screen sizes. The font features clean lines and
              a modern geometric character.
            </p>
            <p className="mb-4 text-sm leading-relaxed text-secondary">
              This is secondary body text at small size. Used for supporting information,
              descriptions, and metadata that doesn&apos;t need primary emphasis.
            </p>
            <p className="text-xs text-tertiary">
              This is tertiary text at extra-small size. Used for hints, timestamps, and the lowest
              priority information.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ============================================================================
// Spacing Section
// ============================================================================

function SpacingSection() {
  const spacingTokens = [
    { name: '--section-padding', value: spacing.sectionPadding, tw: 'py-[var(--section-padding)]' },
    { name: '--container-max', value: spacing.containerMax, tw: 'max-w-container' },
    { name: '--container-padding', value: spacing.containerPadding, tw: 'px-[var(--container-padding)]' },
  ]

  const tailwindScale = [
    { name: '0', value: '0px' },
    { name: '0.5', value: '2px' },
    { name: '1', value: '4px' },
    { name: '2', value: '8px' },
    { name: '3', value: '12px' },
    { name: '4', value: '16px' },
    { name: '5', value: '20px' },
    { name: '6', value: '24px' },
    { name: '8', value: '32px' },
    { name: '10', value: '40px' },
    { name: '12', value: '48px' },
    { name: '16', value: '64px' },
  ]

  return (
    <Section title="Spacing" description="Custom responsive tokens + standard Tailwind spacing scale.">
      <div className="space-y-8">
        {/* Custom tokens */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Custom Tokens</h3>
          <div className="grid gap-3 lg:grid-cols-3">
            {spacingTokens.map((token) => (
              <div
                key={token.name}
                className="flex items-center justify-between rounded-xl border border-default bg-surface p-4"
              >
                <div>
                  <div className="text-sm font-medium text-primary">{token.name}</div>
                  <div className="font-mono text-xs text-tertiary">{token.value}</div>
                </div>
                <CopyButton value={token.name} />
              </div>
            ))}
          </div>
        </div>

        {/* Tailwind scale visual */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Tailwind Scale</h3>
          <div className="rounded-xl border border-default bg-surface p-5">
            <div className="space-y-2">
              {tailwindScale.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-8 text-right font-mono text-xs text-tertiary">{s.name}</span>
                  <div
                    className="h-3 rounded-sm bg-interactive"
                    style={{ width: s.value === '0px' ? '2px' : s.value }}
                  />
                  <span className="font-mono text-xs text-tertiary">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

// ============================================================================
// Radius Section
// ============================================================================

function RadiusSection() {
  const radiusTokens = [
    { name: 'radius-sm', value: radius.sm, tw: 'rounded-sm' },
    { name: 'radius-md', value: radius.md, tw: 'rounded-md' },
    { name: 'radius-lg', value: radius.lg, tw: 'rounded-lg' },
    { name: 'radius-xl', value: radius.xl, tw: 'rounded-xl' },
    { name: 'radius-full', value: radius.full, tw: 'rounded-full' },
  ]

  return (
    <Section title="Border Radius" description="Radius tokens used across all components.">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {radiusTokens.map((token) => (
          <div
            key={token.name}
            className="flex flex-col items-center gap-3 rounded-xl border border-default bg-surface p-5"
          >
            <div
              className="h-16 w-16 border-2 border-interactive bg-elevated"
              style={{ borderRadius: token.value }}
            />
            <div className="text-center">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-primary">{token.tw}</span>
                <CopyButton value={token.tw} />
              </div>
              <span className="font-mono text-xs text-tertiary">{token.value}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ============================================================================
// Shadows Section
// ============================================================================

function ShadowsSection() {
  const shadowTokens = [
    { name: 'shadow-sm', tw: 'shadow-sm', light: shadows.light.sm, dark: shadows.dark.sm },
    { name: 'shadow-md', tw: 'shadow-md', light: shadows.light.md, dark: shadows.dark.md },
    { name: 'shadow-lg', tw: 'shadow-lg', light: shadows.light.lg, dark: shadows.dark.lg },
  ]

  return (
    <Section title="Shadows" description="Elevation levels. Shadows adapt to light/dark mode.">
      <div className="grid gap-6 lg:grid-cols-3">
        {shadowTokens.map((token) => (
          <div key={token.name} className="flex flex-col items-center gap-4">
            <div
              className="flex h-24 w-full items-center justify-center rounded-xl border border-default bg-surface"
              style={{ boxShadow: `var(--${token.name})` }}
            >
              <span className="text-sm font-medium text-secondary">{token.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-tertiary">{token.tw}</span>
              <CopyButton value={token.tw} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

// ============================================================================
// Transitions Section
// ============================================================================

function TransitionsSection() {
  const durations = [
    { name: 'duration-fast', value: transitions.duration.fast, css: '--duration-fast' },
    { name: 'duration-base', value: transitions.duration.base, css: '--duration-base' },
    { name: 'duration-slow', value: transitions.duration.slow, css: '--duration-slow' },
    { name: 'duration-slower', value: transitions.duration.slower, css: '--duration-slower' },
  ]

  return (
    <Section title="Transitions" description="Timing tokens for animations and hover effects.">
      <div className="space-y-6">
        {/* Easing */}
        <div className="rounded-xl border border-default bg-surface p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium text-primary">Easing</span>
            <CopyButton value="var(--ease-out-expo)" />
          </div>
          <div className="font-mono text-xs text-tertiary">{transitions.easeOutExpo}</div>
          <div className="mt-1 font-mono text-xs text-tertiary">var(--ease-out-expo)</div>
        </div>

        {/* Durations */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {durations.map((d) => (
            <div
              key={d.name}
              className="rounded-xl border border-default bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-primary">{d.name}</span>
                <CopyButton value={d.css} />
              </div>
              <span className="font-mono text-xs text-tertiary">{d.value}</span>
              {/* Visual indicator */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-interactive"
                  style={{ width: `${(parseInt(d.value) / 800) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ============================================================================
// Components Section
// ============================================================================

function ComponentsSection() {
  return (
    <Section title="Components" description="Live preview of UI primitives used across the portfolio.">
      <div className="space-y-8">
        {/* Badges */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Badge</h3>
          <div className="flex flex-wrap gap-2 rounded-xl border border-default bg-surface p-5">
            <Badge>React</Badge>
            <Badge>TypeScript</Badge>
            <Badge>Next.js</Badge>
            <Badge>Tailwind CSS</Badge>
            <Badge>Vercel</Badge>
          </div>
        </div>

        {/* Cards */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Card</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-default bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover hover:shadow-md">
              <h4 className="mb-1 font-display text-base text-primary">Default Card</h4>
              <p className="text-sm text-secondary">A card with hover effect, border, and surface background.</p>
            </div>
            <div className="rounded-xl border border-default bg-elevated p-6">
              <h4 className="mb-1 font-display text-base text-primary">Elevated Card</h4>
              <p className="text-sm text-secondary">A card with elevated background for nested content.</p>
            </div>
            <div className="rounded-xl border border-border-hover bg-surface p-6 shadow-md">
              <h4 className="mb-1 font-display text-base text-primary">Shadow Card</h4>
              <p className="text-sm text-secondary">A card with medium shadow and hover border.</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Buttons</h3>
          <div className="flex flex-wrap gap-3 rounded-xl border border-default bg-surface p-5">
            <button className="rounded-lg bg-interactive px-4 py-2 text-sm font-medium text-base transition-colors hover:bg-interactive-hover">
              Primary
            </button>
            <button className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-hover">
              Secondary
            </button>
            <button className="rounded-lg px-4 py-2 text-sm font-medium text-secondary transition-colors hover:bg-hover hover:text-primary">
              Ghost
            </button>
          </div>
        </div>

        {/* Text hierarchy */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Text Hierarchy</h3>
          <div className="rounded-xl border border-default bg-surface p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge>text-primary</Badge>
                <span className="text-primary">Primary text — highest contrast, main content</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>text-secondary</Badge>
                <span className="text-secondary">Secondary text — supporting information</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>text-tertiary</Badge>
                <span className="text-tertiary">Tertiary text — hints, metadata, timestamps</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge>text-interactive</Badge>
                <span className="text-interactive">Interactive text — links, clickable elements</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-secondary">Form Elements</h3>
          <div className="max-w-md rounded-xl border border-default bg-surface p-5">
            <label className="mb-1 block text-sm font-medium text-primary">Label</label>
            <input
              type="text"
              placeholder="Placeholder text..."
              className="mb-3 w-full rounded-lg border border-default bg-elevated px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-active focus:outline-none"
              readOnly
            />
            <label className="mb-1 block text-sm font-medium text-primary">Textarea</label>
            <textarea
              placeholder="Write something..."
              rows={3}
              className="w-full resize-none rounded-lg border border-default bg-elevated px-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-active focus:outline-none"
              readOnly
            />
          </div>
        </div>
      </div>
    </Section>
  )
}
