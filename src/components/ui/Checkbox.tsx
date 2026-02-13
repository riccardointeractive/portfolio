'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    return (
      <label className="flex items-center gap-2 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            ref={ref}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />
          <div
            className={cn(
              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
              'border-border-hover peer-focus:ring-2 peer-focus:ring-border-active/50',
              checked
                ? 'bg-inverted border-inverted'
                : 'bg-transparent hover:border-border-active'
            )}
          >
            {checked && (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="text-toggle-knob">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>
        {label && (
          <span className="text-sm text-primary">{label}</span>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
