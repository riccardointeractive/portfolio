import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { addSession, checkRateLimit, resetRateLimit } from '../sessionStore'

/**
 * POST /api/admin/login
 *
 * PBKDF2 password hashing + timing-safe comparison + rate limiting.
 *
 * Required env:
 *   ADMIN_PASSWORD_HASH  — PBKDF2 hex hash
 *   ADMIN_PASSWORD_SALT  — salt string
 */

const MAX_ATTEMPTS_PER_IP = 10
const RATE_LIMIT_WINDOW = 15 * 60 * 1000
const SESSION_DURATION = 24 * 60 * 60 * 1000

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Rate limit
    const rateLimit = await checkRateLimit(ip, MAX_ATTEMPTS_PER_IP, RATE_LIMIT_WINDOW)
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.retryAfterMs || 0) / 1000)
      return NextResponse.json(
        { success: false, message: `Too many attempts. Try again in ${retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      )
    }

    const storedHash = process.env.ADMIN_PASSWORD_HASH
    const salt = process.env.ADMIN_PASSWORD_SALT || 'portfolio-default-salt-change-me'

    if (!storedHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable not set!')
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      )
    }

    const inputHash = hashPassword(password, salt)

    // Timing-safe comparison
    const storedBuffer = Buffer.from(storedHash, 'hex')
    const inputBuffer = Buffer.from(inputHash, 'hex')

    if (storedBuffer.length !== inputBuffer.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValid = crypto.timingSafeEqual(storedBuffer, inputBuffer)

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate session
    const sessionToken = generateSessionToken()
    const now = Date.now()

    await addSession(sessionToken, {
      createdAt: now,
      expiresAt: now + SESSION_DURATION,
      ip,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    await resetRateLimit(ip)

    const response = NextResponse.json({
      success: true,
      sessionToken,
      expiresAt: now + SESSION_DURATION,
    })

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION / 1000,
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
