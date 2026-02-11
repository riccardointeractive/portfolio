import type { Metadata } from 'next'
import { AdminShell } from './components/AdminShell'

export const metadata: Metadata = {
  title: 'Admin — Portfolio',
  description: 'Portfolio Admin Dashboard',
}

/**
 * Admin Layout
 *
 * Wraps all /admin/* routes with AdminShell (auth + sidebar + header).
 * The shell persists across navigations — only the page content re-renders.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-base">
      <AdminShell>{children}</AdminShell>
    </div>
  )
}
