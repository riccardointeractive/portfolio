'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  size?: 'sm' | 'md'
}

const sizes = {
  sm: 'px-2 py-1 text-xs rounded-md',
  md: 'px-4 py-2.5 rounded-lg',
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, size = 'md', ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          autoComplete="off"
          className={cn(
            'w-full bg-surface text-primary',
            'border placeholder-tertiary',
            'focus:outline-none focus:ring-1 transition-all duration-150',
            error
              ? 'border-error focus:border-error focus:ring-error'
              : 'border-border-default focus:border-border-active focus:ring-border-active',
            sizes[size],
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-tertiary">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
