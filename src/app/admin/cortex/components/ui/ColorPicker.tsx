'use client'

import { DATABASE_COLORS } from '@/app/admin/cortex/lib/types'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'

export interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-9 gap-2">
        {DATABASE_COLORS.map(color => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150',
              'hover:scale-110 focus:outline-none'
            )}
            style={{
              backgroundColor: color.value,
              boxShadow: value === color.value ? `0 0 0 2px var(--bg-base), 0 0 0 4px ${color.value}` : undefined
            }}
            title={color.name}
          >
            {value === color.value && (
              <Icon name="check" size={14} weight="bold" color="white" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
