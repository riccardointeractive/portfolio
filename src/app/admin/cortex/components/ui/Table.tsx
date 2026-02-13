'use client'

import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, ReactNode, useState } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'
import { Checkbox } from '@/components/ui/Checkbox'

// ============================================================================
// TABLE WRAPPER
// ============================================================================

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Enable sticky header */
  stickyHeader?: boolean
  /** Add outer border and rounded corners */
  bordered?: boolean
}

export function Table({
  className,
  stickyHeader = false,
  bordered = true,
  children,
  ...props
}: TableProps) {
  return (
    <div className={cn(
      'w-full overflow-auto',
      bordered && 'border border-border-default rounded-xl'
    )}>
      <table
        className={cn(
          'w-full border-collapse text-sm',
          stickyHeader && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

// ============================================================================
// TABLE HEADER
// ============================================================================

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead
      className={cn('bg-elevated border-b border-border-default', className)}
      {...props}
    >
      {children}
    </thead>
  )
}

// ============================================================================
// TABLE BODY
// ============================================================================

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

// ============================================================================
// TABLE ROW
// ============================================================================

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Highlight row on hover */
  hoverable?: boolean
  /** Selected state for selectable rows */
  selected?: boolean
}

export function TableRow({
  className,
  hoverable = true,
  selected = false,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-border-default transition-colors',
        hoverable && 'hover:bg-elevated/50',
        selected && 'bg-info/10',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

// ============================================================================
// TABLE HEAD CELL
// ============================================================================

export type SortDirection = 'asc' | 'desc' | null

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Enable sorting on this column */
  sortable?: boolean
  /** Current sort direction */
  sortDirection?: SortDirection
  /** Callback when sort is clicked */
  onSort?: () => void
}

export function TableHead({
  className,
  align = 'left',
  sortable = false,
  sortDirection = null,
  onSort,
  children,
  ...props
}: TableHeadProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  const content = sortable ? (
    <button
      type="button"
      onClick={onSort}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        'hover:text-primary',
        sortDirection && 'text-primary'
      )}
    >
      {children}
      <span className="flex flex-col -space-y-1">
        <Icon
          name="chevron-down"
          size={12}
          className={cn(
            'rotate-180 transition-opacity',
            sortDirection === 'asc' ? 'opacity-100' : 'opacity-30'
          )}
        />
        <Icon
          name="chevron-down"
          size={12}
          className={cn(
            'transition-opacity',
            sortDirection === 'desc' ? 'opacity-100' : 'opacity-30'
          )}
        />
      </span>
    </button>
  ) : children

  return (
    <th
      className={cn(
        'h-11 px-4 text-xs font-medium text-tertiary uppercase tracking-wider',
        alignClasses[align],
        className
      )}
      {...props}
    >
      {content}
    </th>
  )
}

// ============================================================================
// TABLE CELL
// ============================================================================

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
  /** Muted text style */
  muted?: boolean
  /** Truncate text with ellipsis */
  truncate?: boolean
}

export function TableCell({
  className,
  align = 'left',
  muted = false,
  truncate = false,
  children,
  ...props
}: TableCellProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <td
      className={cn(
        'h-14 px-4',
        alignClasses[align],
        muted ? 'text-tertiary' : 'text-primary',
        truncate && 'max-w-48 truncate',
        className
      )}
      {...props}
    >
      {children}
    </td>
  )
}

// ============================================================================
// TABLE FOOTER
// ============================================================================

export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {}

export function TableFooter({ className, children, ...props }: TableFooterProps) {
  return (
    <tfoot
      className={cn('bg-elevated border-t border-border-default font-medium', className)}
      {...props}
    >
      {children}
    </tfoot>
  )
}

// ============================================================================
// TABLE CAPTION
// ============================================================================

export interface TableCaptionProps extends HTMLAttributes<HTMLTableCaptionElement> {}

export function TableCaption({ className, children, ...props }: TableCaptionProps) {
  return (
    <caption
      className={cn('mt-4 text-sm text-tertiary', className)}
      {...props}
    >
      {children}
    </caption>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

export interface TableEmptyProps {
  /** Number of columns to span */
  colSpan: number
  /** Icon name */
  icon?: string
  /** Title text */
  title?: string
  /** Description text */
  description?: string
  /** Action element (button, etc) */
  action?: ReactNode
}

export function TableEmpty({
  colSpan,
  icon = 'folder',
  title = 'No data',
  description = 'There are no items to display.',
  action
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="h-64">
        <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
          <div className="w-12 h-12 rounded-full bg-elevated flex items-center justify-center">
            <Icon name={icon} size={24} className="text-tertiary" />
          </div>
          <div>
            <p className="font-medium text-primary">{title}</p>
            <p className="text-sm text-tertiary mt-1">{description}</p>
          </div>
          {action}
        </div>
      </td>
    </tr>
  )
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

export interface TableSkeletonProps {
  /** Number of columns */
  columns: number
  /** Number of rows */
  rows?: number
}

export function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border-default">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="h-14 px-4">
              <div className="h-4 bg-elevated rounded animate-pulse"
                   style={{ width: `${60 + Math.random() * 30}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface TablePaginationProps {
  /** Current page (1-indexed) */
  page: number
  /** Total number of pages */
  totalPages: number
  /** Total number of items */
  totalItems: number
  /** Items per page */
  pageSize: number
  /** Callback when page changes */
  onPageChange: (page: number) => void
  /** Show page size selector */
  showPageSize?: boolean
  /** Available page sizes */
  pageSizes?: number[]
  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  showPageSize = false,
  pageSizes = [10, 20, 50, 100],
  onPageSizeChange,
}: TablePaginationProps) {
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border-default bg-elevated/50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-tertiary">
          Showing <span className="font-medium text-primary">{startItem}</span> to{' '}
          <span className="font-medium text-primary">{endItem}</span> of{' '}
          <span className="font-medium text-primary">{totalItems}</span> results
        </span>

        {showPageSize && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-tertiary">Show</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-base border border-border-default rounded-lg px-2 py-1 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-info/50"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === 1
              ? 'text-tertiary cursor-not-allowed'
              : 'text-secondary hover:text-primary hover:bg-elevated'
          )}
          aria-label="First page"
        >
          <Icon name="arrow-left" size={16} />
          <Icon name="arrow-left" size={16} className="-ml-2" />
        </button>

        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === 1
              ? 'text-tertiary cursor-not-allowed'
              : 'text-secondary hover:text-primary hover:bg-elevated'
          )}
          aria-label="Previous page"
        >
          <Icon name="arrow-left" size={16} />
        </button>

        <div className="flex items-center gap-1 mx-2">
          {generatePageNumbers(page, totalPages).map((pageNum, index) => (
            pageNum === '...' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-tertiary">...</span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum as number)}
                className={cn(
                  'min-w-8 h-8 px-2 rounded-lg text-sm font-medium transition-colors',
                  page === pageNum
                    ? 'bg-info text-toggle-knob'
                    : 'text-secondary hover:text-primary hover:bg-elevated'
                )}
              >
                {pageNum}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === totalPages
              ? 'text-tertiary cursor-not-allowed'
              : 'text-secondary hover:text-primary hover:bg-elevated'
          )}
          aria-label="Next page"
        >
          <Icon name="arrow-left" size={16} className="rotate-180" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === totalPages
              ? 'text-tertiary cursor-not-allowed'
              : 'text-secondary hover:text-primary hover:bg-elevated'
          )}
          aria-label="Last page"
        >
          <Icon name="arrow-left" size={16} className="rotate-180" />
          <Icon name="arrow-left" size={16} className="rotate-180 -ml-2" />
        </button>
      </div>
    </div>
  )
}

// Helper to generate page numbers with ellipsis
function generatePageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, '...', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
}

// ============================================================================
// SELECTABLE TABLE HELPERS
// ============================================================================

export interface TableSelectAllProps {
  /** Whether all rows are selected */
  checked: boolean
  /** Whether some but not all rows are selected */
  indeterminate?: boolean
  /** Callback when selection changes */
  onChange: (checked: boolean) => void
}

export function TableSelectAll({ checked, indeterminate = false, onChange }: TableSelectAllProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={checked || indeterminate}
        onChange={(e) => onChange(e.target.checked)}
        className={indeterminate ? 'opacity-50' : ''}
      />
    </div>
  )
}

export interface TableSelectRowProps {
  /** Whether the row is selected */
  checked: boolean
  /** Callback when selection changes */
  onChange: (checked: boolean) => void
}

export function TableSelectRow({ checked, onChange }: TableSelectRowProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  )
}

// ============================================================================
// ACTION CELL
// ============================================================================

export interface TableActionsProps {
  children: ReactNode
}

export function TableActions({ children }: TableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {children}
    </div>
  )
}

export interface TableActionButtonProps extends HTMLAttributes<HTMLButtonElement> {
  icon: string
  label: string
  variant?: 'default' | 'danger'
}

export function TableActionButton({
  icon,
  label,
  variant = 'default',
  className,
  ...props
}: TableActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'p-1.5 rounded-lg transition-colors',
        variant === 'default' && 'text-tertiary hover:text-primary hover:bg-elevated',
        variant === 'danger' && 'text-tertiary hover:text-error hover:bg-error/10',
        className
      )}
      title={label}
      aria-label={label}
      {...props}
    >
      <Icon name={icon} size={16} />
    </button>
  )
}
