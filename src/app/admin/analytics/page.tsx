'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { AdminAuthGuard } from '@/app/admin/components/AdminAuthGuard'
import { AdminPageHeader } from '@/app/admin/components/AdminPageHeader'
import { SettingsSection } from '@/app/admin/components/SettingsSection'
import { EnvIndicator } from '@/app/admin/components/EnvIndicator'
import { AdminLoadingSpinner } from '@/app/admin/components/AdminLoadingSpinner'

interface AnalyticsData {
  r2: {
    available: boolean
    error?: string
    storage?: {
      payloadSize: number
      metadataSize: number
      objectCount: number
    }
  }
  supabase: {
    available: boolean
    error?: string
    tables?: {
      projects: { total: number; published: number; draft: number }
      shots: { total: number }
      media: { total: number; images: number; videos: number; totalSizeBytes: number }
      project_blocks: { total: number }
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function StatRow({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-default px-4 py-3">
      <span className="text-sm text-secondary">{label}</span>
      <div className="text-right">
        <span className="text-sm font-medium text-primary font-mono">{value}</span>
        {detail && (
          <p className="text-xs text-tertiary">{detail}</p>
        )}
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-3">
      <p className="text-sm text-error">{message}</p>
    </div>
  )
}

function AnalyticsContent() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/analytics')

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const json: AnalyticsData = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Analytics"
        description="Infrastructure usage and content overview."
        action={{
          label: 'Refresh',
          icon: <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />,
          onClick: fetchAnalytics,
        }}
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* Loading */}
        {loading && !data && <AdminLoadingSpinner />}

        {/* Global error */}
        {error && !data && <ErrorBanner message={error} />}

        {data && (
          <>
            {/* Infrastructure Status */}
            <SettingsSection
              title="Infrastructure"
              description="Service connection status"
            >
              <div className="grid grid-cols-2 gap-3">
                <EnvIndicator
                  label="Supabase"
                  connected={data.supabase.available}
                />
                <EnvIndicator
                  label="Cloudflare R2"
                  connected={!!process.env.NEXT_PUBLIC_R2_PUBLIC_URL}
                />
                <EnvIndicator
                  label="R2 Analytics"
                  connected={data.r2.available && !data.r2.error}
                />
              </div>
            </SettingsSection>

            {/* R2 Storage */}
            <SettingsSection
              title="R2 Storage"
              description="Cloudflare R2 bucket usage"
            >
              {data.r2.error ? (
                <ErrorBanner message={data.r2.error} />
              ) : data.r2.storage ? (
                <>
                  <StatRow
                    label="Storage Used"
                    value={formatBytes(data.r2.storage.payloadSize)}
                  />
                  <StatRow
                    label="Objects"
                    value={data.r2.storage.objectCount.toLocaleString()}
                  />
                  <StatRow
                    label="Metadata"
                    value={formatBytes(data.r2.storage.metadataSize)}
                  />
                </>
              ) : (
                <p className="text-sm text-tertiary">
                  Add <code className="rounded bg-elevated px-1 py-0.5 font-mono text-xs">CLOUDFLARE_API_TOKEN</code> to enable R2 analytics.
                </p>
              )}
            </SettingsSection>

            {/* Content Overview */}
            {data.supabase.tables && (
              <SettingsSection
                title="Content"
                description="Database content overview"
              >
                <StatRow
                  label="Projects"
                  value={data.supabase.tables.projects.total}
                  detail={`${data.supabase.tables.projects.published} published, ${data.supabase.tables.projects.draft} draft`}
                />
                <StatRow
                  label="Shots"
                  value={data.supabase.tables.shots.total}
                />
                <StatRow
                  label="Media Files"
                  value={data.supabase.tables.media.total}
                  detail={`${data.supabase.tables.media.images} images, ${data.supabase.tables.media.videos} videos`}
                />
                <StatRow
                  label="Media Size"
                  value={formatBytes(data.supabase.tables.media.totalSizeBytes)}
                  detail="Total uploaded size"
                />
                <StatRow
                  label="Content Blocks"
                  value={data.supabase.tables.project_blocks.total}
                />
              </SettingsSection>
            )}

            {data.supabase.error && (
              <ErrorBanner message={data.supabase.error} />
            )}

            {/* Last Updated */}
            {lastUpdated && (
              <p className="text-center text-xs text-tertiary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <AdminAuthGuard>
      <AnalyticsContent />
    </AdminAuthGuard>
  )
}
