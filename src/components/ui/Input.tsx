'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
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
            'w-full px-4 py-2.5 bg-surface text-primary rounded-lg',
            'border placeholder-tertiary',
            'focus:outline-none focus:ring-1 transition-all duration-150',
            error
              ? 'border-error focus:border-error focus:ring-error'
              : 'border-border-default focus:border-info focus:ring-info',
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
