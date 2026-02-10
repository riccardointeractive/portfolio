'use client'

import { cn } from '@/lib/utils'

interface AdminPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className={cn(
          'rounded-lg px-3 py-1.5 text-sm transition-colors',
          page === 1 ? 'cursor-not-allowed text-tertiary' : 'text-secondary hover:bg-hover'
        )}
      >
        Previous
      </button>
      <span className="text-sm text-secondary">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className={cn(
          'rounded-lg px-3 py-1.5 text-sm transition-colors',
          page === totalPages ? 'cursor-not-allowed text-tertiary' : 'text-secondary hover:bg-hover'
        )}
      >
        Next
      </button>
    </div>
  )
}
