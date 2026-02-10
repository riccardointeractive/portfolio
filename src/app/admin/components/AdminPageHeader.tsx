import { cn } from '@/lib/utils'

interface AdminPageHeaderAction {
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: AdminPageHeaderAction
}

export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl text-primary">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-secondary">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'flex items-center gap-1.5 rounded-lg bg-interactive px-4 py-2',
            'text-sm font-medium text-white transition-colors hover:bg-interactive-hover'
          )}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  )
}
