# CLAUDE.md — Portfolio Project Guidelines

## Project Overview

Personal portfolio for Riccardo Marconato (riccardomarconato.com). Single-page site with Hero, Projects, About, and Contact sections.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
**Deploy:** Vercel
**Typography:** Clash Display (headings) + Switzer (body) + Geist Mono (code)
**Theme:** Neutral/minimal — dark + light mode, no strong accent colors

---

## Critical Rules

### 1. No Hardcoding

If something is repeated, it should not be hardcoded. **If you're typing the same value twice, you're doing it wrong.**

| What | Where |
|------|-------|
| Site metadata | `src/config/site.ts` |
| Project data | `src/config/projects.ts` |
| Design tokens (JS) | `src/config/design-tokens.ts` |
| CSS Variables | `src/app/globals.css` |

### 2. Design System — Single Source of Truth

Two sources of truth that MUST stay in sync:

| Source | Purpose | Location |
|--------|---------|----------|
| CSS Variables | Tailwind classes, CSS animations | `src/app/globals.css` |
| JS Tokens | Programmatic styles, dynamic values | `src/config/design-tokens.ts` |

### 3. Absolute Prohibitions

These are **non-negotiable**. Never write code that contains:

```tsx
// ❌ FORBIDDEN — Hardcoded colors
className="text-blue-500"
className="bg-emerald-400"
style={{ color: '#0070F3' }}

// ✅ REQUIRED — Use semantic tokens
className="text-primary"
className="bg-surface"

// ❌ FORBIDDEN — Arbitrary values (magic numbers)
className="max-w-[1200px]"
className="text-[14px]"
className="p-[22px]"

// ✅ REQUIRED — Use tokens or standard Tailwind
className="max-w-container"
className="text-sm"
className="p-5"

// ❌ FORBIDDEN — Inline color styles
style={{ boxShadow: '0 0 60px rgba(0, 112, 243, 0.4)' }}

// ✅ REQUIRED — Use CSS variables
className="shadow-elevated"
```

### 4. Light/Dark Mode Support

The app supports light, dark, and system themes via `next-themes`. Always use theme-aware tokens:

```tsx
// Colors automatically adapt to theme
className="bg-surface text-primary border-default"

// Never hardcode dark-only or light-only colors
```

### 5. Code Integrity

Don't remove existing functionality without explicit confirmation.

---

## Project Architecture

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout (fonts, metadata, providers)
│   ├── page.tsx            # Homepage (assembles sections)
│   └── globals.css         # Design tokens (CSS custom properties)
├── components/
│   ├── ui/                 # Primitives (Button, Badge, Card)
│   ├── sections/           # Page sections (Hero, Projects, About, Contact)
│   └── layout/             # Header, Footer, Container, ThemeToggle
├── config/
│   ├── design-tokens.ts    # JS tokens (mirrors CSS vars)
│   ├── projects.ts         # Project data
│   └── site.ts             # Site metadata, social links
├── hooks/                  # Custom hooks
├── lib/
│   └── utils.ts            # cn() helper
└── types/
    └── index.ts            # Shared types
```

### Naming Conventions

```typescript
// Components: PascalCase
Hero, ProjectCard, ThemeToggle

// Hooks: useXxx pattern
useTheme, useScrollReveal

// Utils: camelCase
cn, formatDate

// Files: match export name
Hero.tsx, ProjectCard.tsx, useScrollReveal.ts
```

### Import Alias

Always use the `@/` alias for imports:

```typescript
import { Button } from '@/components/ui/Button'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
```

---

## Styling Guidelines

### Semantic Color Tokens

```css
/* Backgrounds */
bg-base            /* Page background */
bg-surface         /* Card/section background */
bg-elevated        /* Elevated elements */
bg-hover           /* Hover states */

/* Text — ALWAYS use these for text content */
text-primary       /* Main content — highest contrast */
text-secondary     /* Supporting content */
text-tertiary      /* Hints, metadata — lowest contrast */

/* Borders */
border-default     /* Standard border */
border-hover       /* Hover state border */

/* Interactive */
text-interactive   /* Links, clickable text */
```

### Spacing & Layout

Use standard Tailwind spacing. For custom responsive values, use `clamp()` in CSS vars:

```css
--section-padding: clamp(80px, 12vw, 160px);
--container-padding: clamp(20px, 5vw, 80px);
```

---

## Commit Convention

```
feat: Add new feature
fix: Bug fix
style: Styling changes (no logic change)
refactor: Code refactoring
docs: Documentation changes
chore: Build, deps, config changes
```

---

## Quick Reference

```
Project folder: ~/Projects/portfolio/
Dev server:     npm run dev (localhost:3000)
Build:          npm run build
Lint:           npm run lint
```
