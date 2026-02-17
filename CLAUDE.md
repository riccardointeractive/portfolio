# CLAUDE.md — Portfolio Project Guidelines

## Project Overview

Personal portfolio for Riccardo Marconato (riccardomarconato.com). Single-page site with Hero, Projects, About, and Contact sections. Full admin CMS with project builder, media library, and Cortex database manager.

**Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4
**Deploy:** Vercel
**Typography:** Clash Display (headings) + Switzer (body) + Geist Mono (code)
**Theme:** Neutral/minimal — dark + light mode, no strong accent colors
**Services:** Supabase (DB), Cloudflare R2 (media), Upstash Redis (sessions)

---

## Critical Rules

### 1. No Hardcoding — The Config Dictionary

If something is repeated, it should not be hardcoded. **If you're typing the same value twice, you're doing it wrong.**

Every literal value in the codebase has a home in `src/config/`. **A perfect file has zero magic values — every number, string, path, timing, and message is an import from `@/config/*`.**

#### Config Directory (10 files)

| File | What belongs here | Example import |
|------|-------------------|----------------|
| `site.ts` | Name, role, bio, tagline, email, social links, skills, nav | `siteConfig.name`, `siteConfig.skills` |
| `copy.ts` | All user-facing strings (section titles, CTAs, error messages, validation) | `COPY.sections.hero.ctaPrimary`, `COPY.auth.invalidCredentials` |
| `routes.ts` | All page paths + API endpoints | `ROUTES.admin.projects`, `API.admin.login` |
| `auth.ts` | Session duration, rate limits, PBKDF2 params, cookie name, storage keys | `AUTH.session.duration`, `STORAGE_KEYS.session` |
| `http.ts` | HTTP status codes | `HTTP_STATUS.UNAUTHORIZED` |
| `env.ts` | Typed environment variables (server + public) | `ENV_SERVER.adminPasswordHash`, `ENV_PUBLIC.supabaseUrl` |
| `redis.ts` | Redis key patterns with namespace | `REDIS_KEYS.session(token)` |
| `design-tokens.ts` | JS mirror of CSS custom properties | `colors.dark.bg.surface` |
| `image.ts` | Responsive image `sizes` strings | `imageSizes.card` |
| `projects.ts` | Static project fallback data | `projects` |

#### Perfect File Checklist

When editing or migrating any file, verify **every** item:

| Rule | Bad | Good |
|------|-----|------|
| No user strings | `'View Projects'` | `COPY.sections.hero.ctaPrimary` |
| No section titles | `'Selected Projects'` | `COPY.sections.projects.title` |
| No error messages | `'Invalid credentials'` | `COPY.auth.invalidCredentials` |
| No validation msgs | `'title and slug are required'` | `COPY.validation.titleAndSlugRequired` |
| No route paths | `href="/admin/projects"` | `href={ROUTES.admin.projects}` |
| No API URLs | `fetch('/api/admin/login')` | `fetch(API.admin.login)` |
| No anchor links | `href="#projects"` | `href={ROUTES.anchors.projects}` |
| No `process.env` | `process.env.ADMIN_PASSWORD_HASH` | `ENV_SERVER.adminPasswordHash` |
| No magic numbers | `SESSION_DURATION = 24 * 60 * 60 * 1000` | `AUTH.session.duration` |
| No PBKDF2 config | `100000` iterations, `64` key length | `AUTH.pbkdf2.iterations` |
| No cookie names | `'admin_session'` | `AUTH.session.cookieName` |
| No HTTP status | `{ status: 401 }` | `{ status: HTTP_STATUS.UNAUTHORIZED }` |
| No Redis keys | `` `portfolio:session:${token}` `` | `REDIS_KEYS.session(token)` |
| No storage keys | `localStorage.getItem('portfolio_admin_session')` | `localStorage.getItem(STORAGE_KEYS.session)` |
| No skills inline | `const skills = ['React', ...]` | `siteConfig.skills` |

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
│   ├── globals.css         # Design tokens (CSS custom properties)
│   ├── projects/[slug]/    # Dynamic project detail pages
│   ├── admin/              # Admin CMS (projects, shots, media, cortex)
│   └── api/admin/          # API routes (auth, CRUD, upload)
├── components/
│   ├── ui/                 # Primitives (Button, Badge, Card, Input)
│   ├── sections/           # Page sections (Hero, Projects, About, Contact)
│   ├── blocks/             # Content blocks (Text, Media, Compare, Quote)
│   └── layout/             # Header, Footer, Container, ThemeToggle
├── config/                 # ⭐ All configuration (10 files — see Config Dictionary)
│   ├── site.ts             # Metadata, social, skills, nav
│   ├── copy.ts             # All user-facing strings
│   ├── routes.ts           # Page paths + API endpoints
│   ├── auth.ts             # Session, rate limits, PBKDF2, storage keys
│   ├── http.ts             # HTTP status codes
│   ├── env.ts              # Typed environment variables
│   ├── redis.ts            # Redis key patterns
│   ├── design-tokens.ts    # JS tokens (mirrors CSS vars)
│   ├── image.ts            # Responsive image sizes
│   └── projects.ts         # Static project fallback
├── hooks/                  # Custom hooks
├── lib/
│   ├── utils.ts            # cn() helper
│   ├── supabase/           # Supabase clients (admin + public)
│   ├── r2/                 # Cloudflare R2 client
│   └── api/auth.ts         # Admin request verification
└── types/
    ├── index.ts            # Shared types
    └── content.ts          # CMS content types
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
import { ROUTES } from '@/config/routes'
import { COPY } from '@/config/copy'
import { AUTH } from '@/config/auth'
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
Project folder: ~/Projects/riccardo/
Dev server:     npm run dev (localhost:3000)
Build:          npm run build
Lint:           npm run lint
```
