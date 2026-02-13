'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  detail?: string
  /** CSS classes for the icon container (e.g. "bg-accent-blue-subtle text-accent-blue") */
  accentClass?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  detail,
  accentClass = 'bg-elevated text-secondary',
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border-default bg-surface p-5', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-tertiary">{label}</p>
          <div className="font-display text-2xl text-primary mt-1">{value}</div>
          {detail && (
            <p className="mt-0.5 text-xs text-tertiary">{detail}</p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', accentClass)}>
          {icon}
        </div>
      </div>
    </div>
  )
}
