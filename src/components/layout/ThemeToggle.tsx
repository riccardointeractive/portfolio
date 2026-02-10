'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

const emptySubscribe = () => () => {}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-md text-secondary transition-colors duration-200 hover:text-primary hover:bg-hover"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
