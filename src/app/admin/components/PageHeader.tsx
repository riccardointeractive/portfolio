'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between', className)}>
      <div>
        <h1 className="font-display text-2xl text-primary">{title}</h1>
        {description && (
          <p className="text-sm text-tertiary mt-1">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  )
}
