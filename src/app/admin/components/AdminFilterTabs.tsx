'use client'

import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface AdminFilterTabsProps {
  filters: FilterOption[]
  activeFilter: string
  onFilterChange: (value: string) => void
}

export function AdminFilterTabs({ filters, activeFilter, onFilterChange }: AdminFilterTabsProps) {
  return (
    <div className="flex gap-1">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onFilterChange(value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm transition-colors',
            activeFilter === value
              ? 'bg-elevated text-primary font-medium'
              : 'text-secondary hover:bg-hover'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
