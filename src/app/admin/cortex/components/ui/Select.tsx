'use client'

import { forwardRef, SelectHTMLAttributes } from 'react'
import { Icon } from './Icon'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
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
              'w-full px-4 py-2.5 bg-surface text-primary rounded-lg',
              'border border-default placeholder-tertiary',
              'focus:outline-none focus:border-info focus:ring-1 focus:ring-info',
              'transition-all duration-150 appearance-none pr-10',
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
          <Icon
            name="chevron-down"
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
