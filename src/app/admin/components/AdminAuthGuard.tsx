'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useMounted } from '@/hooks/useMounted'
import { isSessionValidSync, isSessionValid, logout } from '../utils/adminAuth'
import { LoginForm } from './LoginForm'
import { AdminLayout } from './AdminLayout'

/**
 * AdminAuthGuard
 *
 * Wraps admin sub-pages with authentication check + AdminLayout.
 * Handles:
 *  - SSR hydration (shows loading spinner)
 *  - localStorage quick-check + Redis server verification
 *  - Login form when unauthenticated
 *  - Logout handler passed to AdminLayout
 */
interface AdminAuthGuardProps {
  children: ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const mounted = useMounted()
  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')

  useEffect(() => {
    if (!mounted) return

    const checkSession = async () => {
      if (!isSessionValidSync()) return 'unauthenticated' as const
      const valid = await isSessionValid()
      return valid ? ('authenticated' as const) : ('unauthenticated' as const)
    }

    checkSession().then(setAuthState)
  }, [mounted])

  const handleLogout = async () => {
    await logout()
    setAuthState('unauthenticated')
  }

  // Loading (SSR or verifying session)
  if (!mounted || authState === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface px-6 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="font-medium text-primary">Loading...</span>
        </div>
      </div>
    )
  }

  // Login
  if (authState !== 'authenticated') {
    return <LoginForm onSuccess={() => setAuthState('authenticated')} />
  }

  return <AdminLayout onLogout={handleLogout}>{children}</AdminLayout>
}
