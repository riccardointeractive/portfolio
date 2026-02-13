'use client'

import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'custom'
  customColor?: string
}

export function Badge({
  className,
  variant = 'default',
  customColor,
  children,
  style,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-elevated text-secondary border-border-default',
    primary: 'bg-info/10 text-info border-info/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-error/10 text-error border-error/20',
    info: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20',
    custom: '',
  }

  const customStyles = variant === 'custom' && customColor ? {
    backgroundColor: `${customColor}15`,
    color: customColor,
    borderColor: `${customColor}30`,
    ...style,
  } : style

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
      style={customStyles}
      {...props}
    >
      {children}
    </span>
  )
}
