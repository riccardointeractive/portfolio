'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  size?: 'sm' | 'md'
}

const sizes = {
  sm: 'px-2 py-1 text-xs rounded-md pr-7',
  md: 'px-4 py-2.5 rounded-lg pr-10',
}

const iconSizes = {
  sm: 'w-3 h-3 right-2',
  md: 'w-4 h-4 right-3',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, size = 'md', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            autoComplete="off"
            className={cn(
              'w-full bg-surface text-primary',
              'border border-border-default placeholder-tertiary',
              'focus:outline-none focus:border-border-active focus:ring-1 focus:ring-border-active',
              'transition-all duration-150 appearance-none',
              sizes[size],
              className
            )}
            {...props}
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 text-tertiary pointer-events-none',
              iconSizes[size]
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
