import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin — Portfolio',
  description: 'Portfolio Admin Dashboard',
}

/**
 * Admin Layout
 *
 * Wraps all /admin/* routes.
 * Does NOT include html/body — the root layout provides those.
 * Individual admin pages add AdminSidebar + AdminHeader via AdminLayout component.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-base">{children}</div>
}
