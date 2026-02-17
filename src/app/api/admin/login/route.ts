import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { addSession, checkRateLimit, resetRateLimit } from '../sessionStore'
import { AUTH } from '@/config/auth'
import { HTTP_STATUS } from '@/config/http'
import { COPY } from '@/config/copy'
import { ENV_SERVER } from '@/config/env'

/**
 * POST /api/admin/login
 *
 * PBKDF2 password hashing + timing-safe comparison + rate limiting.
 *
 * Required env:
 *   ADMIN_PASSWORD_HASH  — PBKDF2 hex hash
 *   ADMIN_PASSWORD_SALT  — salt string
 */

function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, AUTH.pbkdf2.iterations, AUTH.pbkdf2.keyLength, AUTH.pbkdf2.digest)
    .toString('hex')
}

function generateSessionToken(): string {
  return crypto.randomBytes(AUTH.tokenBytes).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Rate limit
    const rateLimit = await checkRateLimit(
      ip,
      AUTH.rateLimit.maxAttemptsPerIp,
      AUTH.rateLimit.windowMs
    )
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.retryAfterMs || 0) / 1000)
      return NextResponse.json(
        { success: false, message: COPY.auth.tooManyAttempts(retryAfter) },
        { status: HTTP_STATUS.TOO_MANY_REQUESTS, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: COPY.auth.passwordRequired },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const storedHash = ENV_SERVER.adminPasswordHash
    const salt = ENV_SERVER.adminPasswordSalt

    if (!storedHash) {
      console.error(COPY.envErrors.adminPasswordHash)
      return NextResponse.json(
        { success: false, message: COPY.auth.serverConfigError },
        { status: HTTP_STATUS.INTERNAL_ERROR }
      )
    }

    const inputHash = hashPassword(password, salt)

    // Timing-safe comparison
    const storedBuffer = Buffer.from(storedHash, 'hex')
    const inputBuffer = Buffer.from(inputHash, 'hex')

    if (storedBuffer.length !== inputBuffer.length) {
      return NextResponse.json(
        { success: false, message: COPY.auth.invalidCredentials },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    const isValid = crypto.timingSafeEqual(storedBuffer, inputBuffer)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: COPY.auth.invalidCredentials },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    // Generate session
    const sessionToken = generateSessionToken()
    const now = Date.now()

    await addSession(sessionToken, {
      createdAt: now,
      expiresAt: now + AUTH.session.duration,
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    await resetRateLimit(ip)

    const response = NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: now + AUTH.session.duration,
    })

    response.cookies.set(AUTH.session.cookieName, sessionToken, {
      httpOnly: true,
      secure: ENV_SERVER.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH.session.duration / 1000,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: COPY.auth.serverError },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
