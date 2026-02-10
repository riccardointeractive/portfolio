/**
 * Design Tokens — JS mirror of CSS custom properties
 * Sync changes with: src/app/globals.css
 *
 * Use these for programmatic access (canvas, dynamic styles, etc.)
 * For component styling, prefer Tailwind classes with semantic tokens.
 */

export const colors = {
  light: {
    bg: {
      base: '#fafafa',
      surface: '#ffffff',
      elevated: '#f4f4f5',
      hover: '#e4e4e7',
      active: '#d4d4d8',
    },
    text: {
      primary: '#09090b',
      secondary: '#52525b',
      tertiary: '#a1a1aa',
    },
    border: {
      default: '#e4e4e7',
      hover: '#d4d4d8',
      active: '#a1a1aa',
    },
    interactive: {
      default: '#3f3f46',
      hover: '#27272a',
    },
    status: {
      error: '#dc2626',
      success: '#16a34a',
      warning: '#d97706',
      info: '#2563eb',
    },
    accent: {
      blue: '#2563eb',
      purple: '#7c3aed',
      green: '#16a34a',
      orange: '#d97706',
    },
  },
  dark: {
    bg: {
      base: '#09090b',
      surface: '#0f0f11',
      elevated: '#18181b',
      hover: '#27272a',
      active: '#3f3f46',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      tertiary: '#52525b',
    },
    border: {
      default: '#27272a',
      hover: '#3f3f46',
      active: '#52525b',
    },
    interactive: {
      default: '#d4d4d8',
      hover: '#fafafa',
    },
    status: {
      error: '#f87171',
      success: '#4ade80',
      warning: '#fbbf24',
      info: '#60a5fa',
    },
    accent: {
      blue: '#60a5fa',
      purple: '#a78bfa',
      green: '#4ade80',
      orange: '#fbbf24',
    },
  },
} as const

export const typography = {
  fontFamily: {
    display: '"Clash Display", system-ui, sans-serif',
    sans: '"Switzer", system-ui, sans-serif',
    mono: '"Geist Mono", ui-monospace, monospace',
  },
  fontWeight: {
    display: '400',
  },
} as const

export const spacing = {
  sectionPadding: 'clamp(80px, 12vw, 160px)',
  containerMax: '1200px',
  containerPadding: 'clamp(20px, 5vw, 80px)',
} as const

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
} as const

export const transitions = {
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  duration: {
    fast: '100ms',
    base: '200ms',
    slow: '400ms',
    slower: '800ms',
  },
} as const

export const shadows = {
  light: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
  },
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 12px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
} as const
