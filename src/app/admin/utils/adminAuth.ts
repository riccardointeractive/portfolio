/**
 * Client-side Admin Auth Utilities
 *
 * Handles session management, rate limiting, and authentication
 * against the server-side API routes.
 */

import { type SessionData, type AuthResult } from '../types/admin.types'
import { AUTH, STORAGE_KEYS } from '@/config/auth'
import { COPY } from '@/config/copy'
import { API } from '@/config/routes'
import { HTTP_STATUS } from '@/config/http'

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
    const response = await fetch(API.admin.verifySession, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: session.token }),
    })

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
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
    const stored = localStorage.getItem(STORAGE_KEYS.session)
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
    expiresAt: Date.now() + AUTH.session.duration,
  }
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session))
  localStorage.removeItem(STORAGE_KEYS.attempts)
  localStorage.removeItem(STORAGE_KEYS.lockoutUntil)
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.session)
}

export function getSessionToken(): string | null {
  return getLocalSession()?.token ?? null
}

// ============================================================================
// Rate Limiting (Client-Side)
// ============================================================================

export function isLockedOut(): boolean {
  const lockoutUntil = localStorage.getItem(STORAGE_KEYS.lockoutUntil)
  if (!lockoutUntil) return false
  const until = parseInt(lockoutUntil, 10)
  if (Date.now() > until) {
    localStorage.removeItem(STORAGE_KEYS.lockoutUntil)
    localStorage.removeItem(STORAGE_KEYS.attempts)
    return false
  }
  return true
}

export function getLockoutRemaining(): number {
  const lockoutUntil = localStorage.getItem(STORAGE_KEYS.lockoutUntil)
  if (!lockoutUntil) return 0
  return Math.max(0, Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000))
}

export function getAttemptCount(): number {
  const attempts = localStorage.getItem(STORAGE_KEYS.attempts)
  return attempts ? parseInt(attempts, 10) : 0
}

export function recordFailedAttempt(): { isLocked: boolean; attemptsRemaining: number } {
  const currentAttempts = getAttemptCount() + 1
  localStorage.setItem(STORAGE_KEYS.attempts, currentAttempts.toString())

  if (currentAttempts >= AUTH.rateLimit.maxClientAttempts) {
    localStorage.setItem(
      STORAGE_KEYS.lockoutUntil,
      (Date.now() + AUTH.rateLimit.lockoutDuration).toString()
    )
    return { isLocked: true, attemptsRemaining: 0 }
  }

  return { isLocked: false, attemptsRemaining: AUTH.rateLimit.maxClientAttempts - currentAttempts }
}

export function resetAttempts(): void {
  localStorage.removeItem(STORAGE_KEYS.attempts)
  localStorage.removeItem(STORAGE_KEYS.lockoutUntil)
}

// ============================================================================
// Authentication
// ============================================================================

export async function authenticate(password: string): Promise<AuthResult> {
  if (isLockedOut()) {
    const remaining = getLockoutRemaining()
    return {
      success: false,
      message: COPY.auth.lockedOut(Math.ceil(remaining / 60)),
    }
  }

  if (!password) return { success: false, message: COPY.auth.passwordRequired }

  try {
    const response = await fetch(API.admin.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      const { isLocked, attemptsRemaining } = recordFailedAttempt()
      if (isLocked) {
        return { success: false, message: COPY.auth.lockedOutFixed }
      }
      return {
        success: false,
        message: COPY.auth.incorrectPassword(attemptsRemaining),
      }
    }

    if (data.sessionToken) {
      saveSession(data.sessionToken)
      resetAttempts()
      return { success: true, message: COPY.auth.authSuccess, sessionToken: data.sessionToken }
    }

    return { success: false, message: COPY.auth.invalidServerResponse }
  } catch {
    return { success: false, message: COPY.auth.networkError }
  }
}

export async function logout(): Promise<void> {
  const token = getSessionToken()
  clearSession()

  if (token) {
    try {
      await fetch(API.admin.logout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    } catch {
      // Ignore — local session is already cleared
    }
  }
}
