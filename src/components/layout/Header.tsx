'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Container } from './Container'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils'

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nav-bg border-b border-nav-border backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex h-16 items-center justify-between">
        <a
          href="#"
          className="font-display text-lg font-semibold text-primary tracking-tight"
        >
          {siteConfig.name}
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-secondary transition-colors duration-200 hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-secondary transition-colors hover:text-primary hover:bg-hover"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </Container>

      {/* Mobile nav */}
      <div
        className={cn(
          'overflow-hidden border-b border-nav-border bg-nav-bg backdrop-blur-xl transition-all duration-300 md:hidden',
          mobileOpen ? 'max-h-48' : 'max-h-0 border-b-0'
        )}
      >
        <Container className="flex flex-col gap-4 py-4">
          {siteConfig.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-secondary transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </Container>
      </div>
    </header>
  )
}
