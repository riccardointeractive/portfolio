'use client'

import { type ReactNode } from 'react'
import { AdminAuthGuard } from './AdminAuthGuard'

/**
 * AdminShell
 *
 * Client component that wraps all admin pages with auth + layout.
 * Placed in the admin layout.tsx so the sidebar/header persist
 * across page navigations without remounting.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>
}
