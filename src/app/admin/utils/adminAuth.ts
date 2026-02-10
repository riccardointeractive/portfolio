/**
 * Client-side Admin Auth Utilities
 *
 * Handles session management, rate limiting, and authentication
 * against the server-side API routes.
 */

import { type SessionData, type AuthResult } from '../types/admin.types'

// ============================================================================
// Configuration
// ============================================================================

export const SESSION_DURATION = 24 * 60 * 60 * 1000
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_DURATION = 15 * 60 * 1000

const STORAGE_KEYS = {
  SESSION: 'portfolio_admin_session',
  ATTEMPTS: 'portfolio_admin_attempts',
  LOCKOUT_UNTIL: 'portfolio_admin_lockout',
} as const

// ============================================================================
// Session Management
// ============================================================================

export async function isSessionValid(): Promise<boolean> {
  const session = getLocalSession()
  if (!session) return false
  if (Date.now() > session.expiresAt) {
    clearSession()
    return false
  }

  try {
    const response = await fetch('/api/admin/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: session.token }),
    })

    if (response.status === 401) {
      clearSession()
      return false
    }

    if (!response.ok) return false

    const data = await response.json()
    return data.valid === true
  } catch {
    return false
  }
}

export function isSessionValidSync(): boolean {
  const session = getLocalSession()
  if (!session) return false
  return Date.now() < session.expiresAt
}

function getLocalSession(): SessionData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (!stored) return null
    const session = JSON.parse(stored) as SessionData
    if (!session.token || !session.createdAt || !session.expiresAt) return null
    return session
  } catch {
    return null
  }
}

export function saveSession(sessionToken: string): void {
  const session: SessionData = {
    token: sessionToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  }
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS)
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL)
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSION)
}

export function getSessionToken(): string | null {
  return getLocalSession()?.token ?? null
}

// ============================================================================
// Rate Limiting (Client-Side)
// ============================================================================

export function isLockedOut(): boolean {
  const lockoutUntil = localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL)
  if (!lockoutUntil) return false
  const until = parseInt(lockoutUntil, 10)
  if (Date.now() > until) {
    localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL)
    localStorage.removeItem(STORAGE_KEYS.ATTEMPTS)
    return false
  }
  return true
}

export function getLockoutRemaining(): number {
  const lockoutUntil = localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL)
  if (!lockoutUntil) return 0
  return Math.max(0, Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000))
}

export function getAttemptCount(): number {
  const attempts = localStorage.getItem(STORAGE_KEYS.ATTEMPTS)
  return attempts ? parseInt(attempts, 10) : 0
}

export function recordFailedAttempt(): { isLocked: boolean; attemptsRemaining: number } {
  const currentAttempts = getAttemptCount() + 1
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, currentAttempts.toString())

  if (currentAttempts >= MAX_LOGIN_ATTEMPTS) {
    localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, (Date.now() + LOCKOUT_DURATION).toString())
    return { isLocked: true, attemptsRemaining: 0 }
  }

  return { isLocked: false, attemptsRemaining: MAX_LOGIN_ATTEMPTS - currentAttempts }
}

export function resetAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.ATTEMPTS)
  localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL)
}

// ============================================================================
// Authentication
// ============================================================================

export async function authenticate(password: string): Promise<AuthResult> {
  if (isLockedOut()) {
    const remaining = getLockoutRemaining()
    return {
      success: false,
      message: `Too many failed attempts. Wait ${Math.ceil(remaining / 60)} minutes.`,
    }
  }

  if (!password) return { success: false, message: 'Password is required' }

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      const { isLocked, attemptsRemaining } = recordFailedAttempt()
      if (isLocked) {
        return { success: false, message: 'Too many failed attempts. Locked for 15 minutes.' }
      }
      return {
        success: false,
        message: `Incorrect password. ${attemptsRemaining} attempts remaining.`,
      }
    }

    if (data.sessionToken) {
      saveSession(data.sessionToken)
      resetAttempts()
      return { success: true, message: 'Authentication successful', sessionToken: data.sessionToken }
    }

    return { success: false, message: 'Invalid server response' }
  } catch {
    return { success: false, message: 'Network error. Please try again.' }
  }
}

export async function logout(): Promise<void> {
  const token = getSessionToken()
  clearSession()

  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    } catch {
      // Ignore — local session is already cleared
    }
  }
}
