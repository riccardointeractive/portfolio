'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  RefreshCw,
  FolderOpen,
  Camera,
  Upload,
  Layers,
  HardDrive,
  Database,
  FileImage,
  FileVideo,
  Server,
} from 'lucide-react'
import { PageHeader } from '@/app/admin/components/PageHeader'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
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

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ============================================================================
// Local components
// ============================================================================

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface">
      <div className="border-b border-border-default px-5 py-4">
        <h2 className="text-sm font-medium text-primary">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-tertiary">{description}</p>
        )}
      </div>
      <div className="flex flex-col gap-3 px-5 py-4">{children}</div>
    </div>
  )
}

function StorageRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-default px-4 py-3">
      <span className="text-tertiary">{icon}</span>
      <span className="flex-1 text-sm text-secondary">{label}</span>
      <span className="text-sm font-medium text-primary font-mono">{value}</span>
    </div>
  )
}

const R2_FREE_TIER_BYTES = 10 * 1024 * 1024 * 1024 // 10 GB

function StorageUsageCard({
  r2Bytes,
  dbBytes,
}: {
  r2Bytes: number
  dbBytes: number
}) {
  // R2 and DB track the same files — use the larger value to avoid double-counting
  const totalUsed = Math.max(r2Bytes, dbBytes)
  const percentage = Math.min((totalUsed / R2_FREE_TIER_BYTES) * 100, 100)
  const usedWidth = R2_FREE_TIER_BYTES > 0 ? (totalUsed / R2_FREE_TIER_BYTES) * 100 : 0
  const source = r2Bytes >= dbBytes ? 'R2' : 'DB'

  return (
    <div className="rounded-xl border border-border-default bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-blue-subtle">
            <HardDrive size={18} className="text-accent-blue" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-primary">Storage Usage</h2>
            <p className="text-xs text-tertiary">R2 free tier — 10 GB included</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-primary">
            {formatBytes(totalUsed)}
          </div>
          <p className="text-xs text-tertiary">
            of {formatBytes(R2_FREE_TIER_BYTES)} ({percentage.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-elevated">
        <div
          className="h-full rounded-full bg-accent-blue transition-all duration-500"
          style={{ width: `${Math.min(usedWidth, 100)}%` }}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-blue" />
          <span className="text-xs text-secondary">
            Used — {formatBytes(totalUsed)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-tertiary">
            (via {source}: {r2Bytes > 0 && dbBytes > 0 ? `R2 ${formatBytes(r2Bytes)} / DB ${formatBytes(dbBytes)}` : formatBytes(totalUsed)})
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-elevated" />
          <span className="text-xs text-tertiary">
            Available — {formatBytes(R2_FREE_TIER_BYTES - totalUsed)}
          </span>
        </div>
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

// ============================================================================
// Page
// ============================================================================

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

  const tables = data?.supabase.tables
  const storage = data?.r2.storage

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Infrastructure usage and content overview."
        action={
          <Button variant="secondary" onClick={fetchAnalytics}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        }
      />

      {/* Loading */}
      {loading && !data && <AdminLoadingSpinner />}

      {/* Global error */}
      {error && !data && <ErrorBanner message={error} />}

      {data && (
        <>
          {/* Content Metrics — Top Grid */}
          {tables && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard
                icon={<FolderOpen size={18} />}
                label="Projects"
                value={tables.projects.total ?? 0}
                detail={`${tables.projects.published ?? 0} published, ${tables.projects.draft ?? 0} draft`}
              />
              <StatCard
                icon={<Camera size={18} />}
                label="Shots"
                value={tables.shots.total ?? 0}
              />
              <StatCard
                icon={<Upload size={18} />}
                label="Media Files"
                value={tables.media.total ?? 0}
                detail={`${tables.media.images ?? 0} images, ${tables.media.videos ?? 0} videos`}
              />
              <StatCard
                icon={<Layers size={18} />}
                label="Content Blocks"
                value={tables.project_blocks.total ?? 0}
              />
            </div>
          )}

          {/* Storage Usage — Full Width */}
          <StorageUsageCard
            r2Bytes={storage?.payloadSize ?? 0}
            dbBytes={tables?.media.totalSizeBytes ?? 0}
          />

          {/* Bottom Grid — Storage + Infrastructure side by side */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Storage */}
            <SectionCard
              title="Storage"
              description="File storage across R2 and database"
            >
              {storage && (
                <StorageRow
                  icon={<HardDrive size={14} />}
                  label="R2 Storage Used"
                  value={formatBytes(storage.payloadSize)}
                />
              )}
              {storage && (
                <StorageRow
                  icon={<Server size={14} />}
                  label="R2 Objects"
                  value={(storage.objectCount ?? 0).toLocaleString()}
                />
              )}
              {tables && (
                <StorageRow
                  icon={<FileImage size={14} />}
                  label="Media Size (DB)"
                  value={formatBytes(tables.media.totalSizeBytes)}
                />
              )}
              {tables && (
                <StorageRow
                  icon={<FileVideo size={14} />}
                  label="Media Breakdown"
                  value={`${tables.media.images ?? 0} img / ${tables.media.videos ?? 0} vid`}
                />
              )}
              {storage && (
                <StorageRow
                  icon={<Database size={14} />}
                  label="R2 Metadata"
                  value={formatBytes(storage.metadataSize)}
                />
              )}
              {data.r2.error && (
                <ErrorBanner message={data.r2.error} />
              )}
              {!data.r2.available && !data.r2.error && (
                <p className="text-xs text-tertiary">
                  Add <code className="rounded bg-elevated px-1 py-0.5 font-mono text-xs">CLOUDFLARE_API_TOKEN</code> to enable R2 stats.
                </p>
              )}
            </SectionCard>

            {/* Infrastructure */}
            <SectionCard
              title="Infrastructure"
              description="Service connection status"
            >
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
            </SectionCard>
          </div>

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
  )
}

export default function AnalyticsPage() {
  return <AnalyticsContent />
}
