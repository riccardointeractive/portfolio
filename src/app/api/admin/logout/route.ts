import { NextRequest, NextResponse } from 'next/server'
import { getSession, removeSession } from '../sessionStore'
import { AUTH } from '@/config/auth'
import { HTTP_STATUS } from '@/config/http'
import { ENV_SERVER } from '@/config/env'

/**
 * POST /api/admin/logout
 * Invalidate a session token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const existed = (await getSession(token)) !== undefined
    await removeSession(token)

    const response = NextResponse.json({
      success: true,
      message: existed ? 'Session invalidated' : 'Session already expired',
    })

    response.cookies.set(AUTH.session.cookieName, '', {
      httpOnly: true,
      secure: ENV_SERVER.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
