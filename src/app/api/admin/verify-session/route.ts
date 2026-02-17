import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '../sessionStore'
import { HTTP_STATUS } from '@/config/http'

/**
 * POST /api/admin/verify-session
 * Verify that a session token is valid
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const session = await getSession(token)

    if (!session) {
      return NextResponse.json(
        { valid: false, message: 'Session not found or expired' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    return NextResponse.json({
      valid: true,
      expiresAt: session.expiresAt,
      remainingMs: session.expiresAt - Date.now(),
    })
  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { valid: false, message: 'Server error' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
