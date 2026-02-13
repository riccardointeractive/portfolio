'use client'

import { Search } from 'lucide-react'

interface AdminSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function AdminSearchBar({ value, onChange, placeholder = 'Search...' }: AdminSearchBarProps) {
  return (
    <div className="relative w-full sm:w-64">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border-default bg-base pl-9 pr-3 py-2 text-sm text-primary placeholder:text-tertiary focus:border-border-hover focus:outline-none"
      />
    </div>
  )
}
