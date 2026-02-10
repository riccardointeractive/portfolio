import { NextRequest, NextResponse } from 'next/server'
import { getSession, removeSession } from '../sessionStore'

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
        { status: 400 }
      )
    }

    const existed = (await getSession(token)) !== undefined
    await removeSession(token)

    const response = NextResponse.json({
      success: true,
      message: existed ? 'Session invalidated' : 'Session already expired',
    })

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
