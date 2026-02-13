export { cn } from '@/lib/utils'

// Generate a short, URL-safe ID
export function generateId(): string {
  return Math.random().toString(36).slice(2, 14)
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function sortByDate<T extends { createdAt: string }>(items: T[], order: 'asc' | 'desc' = 'desc'): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

export function groupBy<T, K extends string | number>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const groupKey = key(item)
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {} as Record<K, T[]>)
}

// Priority badge variants
export function getPriorityColor(priority: 'low' | 'medium' | 'high'): 'danger' | 'warning' | 'default' {
  switch (priority) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warning'
    case 'low':
      return 'default'
  }
}

// Status badge variants
export function getStatusColor(status: 'active' | 'completed' | 'archived'): 'info' | 'success' | 'default' {
  switch (status) {
    case 'active':
      return 'info'
    case 'completed':
      return 'success'
    case 'archived':
      return 'default'
  }
}

// Custom color styles — for user-defined colors (database icons, select options, etc.)
export function customColorBg(color: string, opacity: string = '20'): React.CSSProperties {
  return { backgroundColor: `${color}${opacity}` }
}

export function customColorStyle(color: string, opacity?: string): React.CSSProperties {
  if (opacity) {
    return { backgroundColor: `${color}${opacity}`, color }
  }
  return { backgroundColor: color }
}

// Download JSON helper
export function downloadJson(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
