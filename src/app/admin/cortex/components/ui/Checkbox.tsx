'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { Icon } from './Icon'
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
              'border-default peer-focus:ring-2 peer-focus:ring-info/50',
              checked
                ? 'bg-info border-info'
                : 'bg-transparent hover:border-hover'
            )}
          >
            {checked && <Icon name="check" size={14} weight="bold" color="white" />}
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
