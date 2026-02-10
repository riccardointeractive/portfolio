/**
 * Session Store for Admin Authentication
 *
 * In-memory session storage for the portfolio.
 * Simple and effective for single-instance Vercel deployments.
 *
 * For multi-instance production, swap to Redis (Upstash).
 */

import { type Session } from '@/app/admin/types/admin.types'

// ============================================================================
// In-memory stores
// ============================================================================

const sessions = new Map<string, Session>()
const rateLimits = new Map<string, { count: number; resetAt: number }>()

// ============================================================================
// Session Management
// ============================================================================

export async function addSession(token: string, session: Session): Promise<void> {
  sessions.set(token, session)
  cleanupExpired()
}

export async function getSession(token: string): Promise<Session | undefined> {
  const session = sessions.get(token)
  if (session && Date.now() > session.expiresAt) {
    sessions.delete(token)
    return undefined
  }
  return session
}

export async function removeSession(token: string): Promise<boolean> {
  return sessions.delete(token)
}

export async function getSessionCount(): Promise<number> {
  cleanupExpired()
  return sessions.size
}

function cleanupExpired(): void {
  const now = Date.now()
  const expired: string[] = []
  sessions.forEach((session, token) => {
    if (now > session.expiresAt) expired.push(token)
  })
  expired.forEach((token) => sessions.delete(token))
}

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterMs?: number
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const now = Date.now()

  const entry = rateLimits.get(key)
  if (entry && now > entry.resetAt) {
    rateLimits.delete(key)
  }

  const current = rateLimits.get(key)

  if (!current) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: current.resetAt - now,
    }
  }

  current.count++
  return { allowed: true, remaining: maxAttempts - current.count }
}

export async function resetRateLimit(key: string): Promise<void> {
  rateLimits.delete(key)
}
