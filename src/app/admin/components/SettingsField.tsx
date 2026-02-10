interface SettingsFieldProps {
  label: string
  value: string
  mono?: boolean
}

export function SettingsField({ label, value, mono }: SettingsFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-tertiary uppercase tracking-wider">
        {label}
      </span>
      <p className={`text-sm text-primary ${mono ? 'font-mono' : ''}`}>
        {value}
      </p>
    </div>
  )
}
