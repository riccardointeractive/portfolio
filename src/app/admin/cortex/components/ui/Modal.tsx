'use client'

import { ReactNode, useEffect } from 'react'
import { Icon } from './Icon'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open?: boolean
  isOpen?: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, isOpen, onClose, title, description, children, className }: ModalProps) {
  const isModalOpen = open ?? isOpen ?? false

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-surface border border-border-default rounded-xl shadow-2xl',
          'w-full max-w-md mx-4 max-h-dvh overflow-y-auto',
          className
        )}
      >
        <div className="flex items-start justify-between p-4 border-b border-border-default">
          <div>
            {title && <h2 className="font-display text-lg text-primary">{title}</h2>}
            {description && <p className="text-sm text-tertiary mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-tertiary hover:text-primary transition-colors p-1"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
