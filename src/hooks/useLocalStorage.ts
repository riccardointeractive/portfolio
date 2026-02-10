'use client'

import { useSyncExternalStore, useCallback } from 'react'

/**
 * Subscribe to a localStorage key reactively.
 * Uses useSyncExternalStore for lint-clean hydration.
 */
export function useLocalStorage(key: string, fallback: string = ''): string {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      // Listen for storage events (cross-tab)
      const handler = (e: StorageEvent) => {
        if (e.key === key) onStoreChange()
      }
      window.addEventListener('storage', handler)

      // Also poll for same-tab changes (localStorage doesn't fire events in same tab)
      const interval = setInterval(onStoreChange, 200)

      return () => {
        window.removeEventListener('storage', handler)
        clearInterval(interval)
      }
    },
    [key]
  )

  const getSnapshot = useCallback(() => {
    return localStorage.getItem(key) ?? fallback
  }, [key, fallback])

  const getServerSnapshot = useCallback(() => fallback, [fallback])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
