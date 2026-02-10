'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMounted } from '@/hooks/useMounted'
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { navigationItems } from '../config/admin.config'
import { siteConfig } from '@/config/site'

interface AdminSidebarProps {
  onLogout: () => void
}

const STORAGE_KEY = 'portfolio-admin-sidebar-collapsed'

export function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname()
  const mounted = useMounted()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  if (!mounted) return null

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname?.startsWith(href)
  }

  const showLabel = isMobileOpen || !isCollapsed

  return (
    <>
      {/* Mobile burger */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed left-4 top-4 z-60 flex h-10 w-10 items-center justify-center rounded-xl border border-border-default bg-surface text-primary lg:hidden"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border-default bg-surface
          transition-all duration-300
          w-64 lg:w-auto
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}
        `}
      >
        {/* Header */}
        <div className="flex min-h-16 items-center justify-between border-b border-border-default p-4">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap font-display text-xl font-semibold tracking-tight text-primary">
              {isCollapsed && !isMobileOpen ? siteConfig.name.charAt(0) : siteConfig.name.split(' ')[0]}
            </span>
            {showLabel && (
              <span className="hidden rounded-md border border-border-default bg-elevated px-1.5 py-0.5 text-xs font-medium text-secondary lg:inline-block">
                Admin
              </span>
            )}
            {isMobileOpen && (
              <span className="rounded-md border border-border-default bg-elevated px-1.5 py-0.5 text-xs font-medium text-secondary lg:hidden">
                Admin
              </span>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="hidden rounded-lg p-1.5 text-secondary transition-colors hover:bg-hover hover:text-primary lg:flex"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Expand button (collapsed) */}
        {isCollapsed && (
          <div className="hidden justify-center border-b border-border-default py-3 lg:flex">
            <button
              onClick={toggleCollapse}
              className="rounded-lg p-2 text-secondary transition-colors hover:bg-hover hover:text-primary"
              aria-label="Expand sidebar"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                ${isActive(item.href)
                  ? 'bg-elevated text-primary'
                  : 'text-secondary hover:bg-hover hover:text-primary'
                }
                ${isCollapsed ? 'lg:justify-center' : ''}
              `}
              title={!showLabel ? item.label : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              {showLabel && (
                <span className="hidden whitespace-nowrap text-sm font-medium lg:block">
                  {item.label}
                </span>
              )}
              {isMobileOpen && (
                <span className="whitespace-nowrap text-sm font-medium lg:hidden">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-border-default p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-secondary transition-all hover:bg-hover hover:text-primary
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
            title={!showLabel ? 'Go to Site' : undefined}
          >
            <ExternalLink size={20} className="shrink-0" />
            {showLabel && <span className="hidden text-sm font-medium lg:block">Go to Site</span>}
            {isMobileOpen && <span className="text-sm font-medium lg:hidden">Go to Site</span>}
          </a>

          <button
            onClick={() => {
              onLogout()
              setIsMobileOpen(false)
            }}
            className={`
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-secondary transition-all hover:bg-hover hover:text-primary
              ${isCollapsed ? 'lg:justify-center' : ''}
            `}
            title={!showLabel ? 'Sign Out' : undefined}
          >
            <LogOut size={20} className="shrink-0" />
            {showLabel && <span className="hidden text-sm font-medium lg:block">Sign Out</span>}
            {isMobileOpen && <span className="text-sm font-medium lg:hidden">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
