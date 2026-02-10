/**
 * Session Store for Admin Authentication
 *
 * Uses Upstash Redis for persistent session storage.
 * All keys are namespaced with `portfolio:` to avoid conflicts
 * with other projects (e.g. Digiko) sharing the same Redis instance.
 *
 * Key patterns:
 *   portfolio:session:<token>     — session data (auto-expires via TTL)
 *   portfolio:ratelimit:<key>     — rate limit counters (auto-expires via TTL)
 */

import { Redis } from '@upstash/redis'
import { type Session } from '@/app/admin/types/admin.types'

// ============================================================================
// Redis Client
// ============================================================================

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// ============================================================================
// Key Prefixes
// ============================================================================

const PREFIX = 'portfolio:'
const sessionKey = (token: string) => `${PREFIX}session:${token}`
const rateLimitKey = (key: string) => `${PREFIX}ratelimit:${key}`

// ============================================================================
// Session Management
// ============================================================================

export async function addSession(token: string, session: Session): Promise<void> {
  const ttlMs = session.expiresAt - Date.now()
  const ttlSeconds = Math.max(Math.ceil(ttlMs / 1000), 1)

  await redis.set(sessionKey(token), JSON.stringify(session), {
    ex: ttlSeconds,
  })
}

export async function getSession(token: string): Promise<Session | undefined> {
  const data = await redis.get<string>(sessionKey(token))

  if (!data) return undefined

  const session: Session = typeof data === 'string' ? JSON.parse(data) : data

  // Double-check expiry (Redis TTL should handle this, but be safe)
  if (Date.now() > session.expiresAt) {
    await redis.del(sessionKey(token))
    return undefined
  }

  return session
}

export async function removeSession(token: string): Promise<boolean> {
  const result = await redis.del(sessionKey(token))
  return result > 0
}

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitEntry {
  count: number
  resetAt: number
}

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
  const redisKey = rateLimitKey(key)

  const data = await redis.get<string>(redisKey)
  let entry: RateLimitEntry | null = null

  if (data) {
    entry = typeof data === 'string' ? JSON.parse(data) : data

    // Window expired — reset
    if (entry && now > entry.resetAt) {
      entry = null
    }
  }

  if (!entry) {
    const newEntry: RateLimitEntry = { count: 1, resetAt: now + windowMs }
    const ttlSeconds = Math.ceil(windowMs / 1000)
    await redis.set(redisKey, JSON.stringify(newEntry), { ex: ttlSeconds })
    return { allowed: true, remaining: maxAttempts - 1 }
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    }
  }

  entry.count++
  const remainingTtlMs = entry.resetAt - now
  const ttlSeconds = Math.max(Math.ceil(remainingTtlMs / 1000), 1)
  await redis.set(redisKey, JSON.stringify(entry), { ex: ttlSeconds })

  return { allowed: true, remaining: maxAttempts - entry.count }
}

export async function resetRateLimit(key: string): Promise<void> {
  await redis.del(rateLimitKey(key))
}
