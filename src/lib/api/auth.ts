import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/api/admin/sessionStore'

type AuthSuccess = { authorized: true; token: string }
type AuthFailure = { authorized: false; response: NextResponse }

/**
 * Verify admin session from cookie or Authorization header.
 * Reuses the existing PBKDF2 + Redis session system.
 */
export async function verifyAdminRequest(
  request: NextRequest
): Promise<AuthSuccess | AuthFailure> {
  const token =
    request.cookies.get('admin_session')?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const session = await getSession(token)
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Session expired' }, { status: 401 }),
    }
  }

  return { authorized: true, token }
}
