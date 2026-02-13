interface SettingsSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="rounded-xl border border-default bg-surface">
      <div className="border-b border-default px-5 py-4">
        <h2 className="text-sm font-medium text-primary">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-tertiary">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-4 px-5 py-4">{children}</div>
    </div>
  )
}
