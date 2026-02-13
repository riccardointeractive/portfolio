interface EnvIndicatorProps {
  label: string
  connected: boolean
}

export function EnvIndicator({ label, connected }: EnvIndicatorProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-default px-3 py-2">
      <span
        className={`h-2 w-2 rounded-full ${
          connected ? 'bg-success' : 'bg-error'
        }`}
      />
      <span className="text-sm text-primary">{label}</span>
      <span className="ml-auto text-xs text-tertiary">
        {connected ? 'Connected' : 'Not configured'}
      </span>
    </div>
  )
}
