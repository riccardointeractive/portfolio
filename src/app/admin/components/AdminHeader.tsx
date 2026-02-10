'use client'

import { usePathname } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

const STORAGE_KEY = 'portfolio-admin-sidebar-collapsed'

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean)
  const lastSegment = segments[segments.length - 1]

  const titles: Record<string, string> = {
    admin: 'Dashboard',
    projects: 'Projects',
    content: 'Content',
    'design-system': 'Design System',
    settings: 'Settings',
    profile: 'Profile',
  }

  return (lastSegment && titles[lastSegment]) || 'Admin'
}

export function AdminHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const collapsed = useLocalStorage(STORAGE_KEY, 'false')
  const isCollapsed = collapsed === 'true'

  const marginClass = `ml-0 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-border-default bg-nav-bg backdrop-blur-xl transition-all duration-300">
      <div
        className={`flex h-full items-center justify-between px-6 pl-16 transition-all duration-300 lg:pl-6 ${marginClass}`}
      >
        <h1 className="font-display text-lg font-semibold text-primary">{pageTitle}</h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border-default bg-elevated px-3 py-1.5">
            <ShieldCheck size={16} className="text-secondary" />
            <span className="text-xs font-medium text-secondary">Admin</span>
          </div>
        </div>
      </div>
    </header>
  )
}
