import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/api/admin/sessionStore'
import { AUTH } from '@/config/auth'
import { HTTP_STATUS } from '@/config/http'
import { COPY } from '@/config/copy'

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
    request.cookies.get(AUTH.session.cookieName)?.value ||
    request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: COPY.auth.unauthorized },
        { status: HTTP_STATUS.UNAUTHORIZED }
      ),
    }
  }

  const session = await getSession(token)
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: COPY.auth.sessionExpired },
        { status: HTTP_STATUS.UNAUTHORIZED }
      ),
    }
  }

  return { authorized: true, token }
}
