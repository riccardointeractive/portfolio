/**
 * Auth — Authentication, session, and rate limiting configuration
 *
 * All security-related constants in one place.
 * Used by both server-side API routes and client-side auth utilities.
 */

export const AUTH = {
  session: {
    /** Session duration in milliseconds (24 hours) */
    duration: 24 * 60 * 60 * 1000,
    /** Cookie name for admin session */
    cookieName: 'admin_session',
  },

  rateLimit: {
    /** Server-side: max login attempts per IP */
    maxAttemptsPerIp: 10,
    /** Server-side: rate limit window in ms (15 minutes) */
    windowMs: 15 * 60 * 1000,
    /** Client-side: max login attempts before lockout */
    maxClientAttempts: 5,
    /** Client-side: lockout duration in ms (15 minutes) */
    lockoutDuration: 15 * 60 * 1000,
  },

  pbkdf2: {
    iterations: 100_000,
    keyLength: 64,
    digest: 'sha512' as const,
  },

  /** Session token length in bytes (generates 64-char hex string) */
  tokenBytes: 32,
} as const

export const STORAGE_KEYS = {
  session: 'portfolio_admin_session',
  attempts: 'portfolio_admin_attempts',
  lockoutUntil: 'portfolio_admin_lockout',
  cortexSort: 'cortex-databases-sort',
} as const
