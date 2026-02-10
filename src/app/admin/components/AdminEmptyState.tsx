interface AdminEmptyStateProps {
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function AdminEmptyState({ message, actionLabel, onAction }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-default py-20">
      <p className="text-sm text-secondary">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 text-sm text-interactive hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
