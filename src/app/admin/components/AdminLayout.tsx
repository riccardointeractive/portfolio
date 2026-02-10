'use client'

import { type ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface AdminLayoutProps {
  children: ReactNode
  onLogout: () => void
}

const STORAGE_KEY = 'portfolio-admin-sidebar-collapsed'

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const collapsed = useLocalStorage(STORAGE_KEY, 'false')
  const isCollapsed = collapsed === 'true'

  return (
    <>
      <AdminSidebar onLogout={onLogout} />
      <AdminHeader />
      <main
        className={`
          pt-16 transition-all duration-300
          ml-0
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
        `}
      >
        <div className="min-h-screen px-6 py-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-screen-xl">{children}</div>
        </div>
      </main>
    </>
  )
}
