'use client'

import Link from 'next/link'
import {
  Wrench,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { tools, quickLinks, getQuickLinkIcon } from './config/admin.config'
import { AdminAuthGuard } from './components/AdminAuthGuard'
import { siteConfig } from '@/config/site'

export default function AdminPage() {
  // Stats
  const totalTools = tools.reduce((acc, cat) => acc + cat.items.length, 0)
  const activeTools = tools.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.status === 'active').length,
    0
  )
  const comingTools = tools.reduce(
    (acc, cat) => acc + cat.items.filter((i) => i.status === 'coming').length,
    0
  )

  return (
    <AdminAuthGuard>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 font-display text-4xl text-primary">Admin Dashboard</h1>
        <p className="text-secondary">Manage portfolio content, projects, and settings</p>
      </div>

      {/* Quick Stats */}
      <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Tools" value={totalTools} icon={<Wrench size={20} />} />
        <StatCard label="Active" value={activeTools} icon={<CheckCircle2 size={20} />} />
        <StatCard label="Coming Soon" value={comingTools} icon={<Clock size={20} />} />
        <StatCard label="Sections" value={4} icon={<Wrench size={20} />} />
      </div>

      {/* Tools by Category */}
      <div className="mb-12 space-y-12">
        {tools.map((category) => (
          <div key={category.category}>
            <h2 className="mb-6 font-display text-lg text-primary">
              {category.category}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {category.items.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className={tool.status === 'coming' ? 'pointer-events-none' : ''}
                  onClick={(e) => tool.status === 'coming' && e.preventDefault()}
                >
                  <div
                    className={`
                      rounded-xl border border-border-default bg-surface p-6 transition-all duration-200
                      ${tool.status === 'coming' ? 'opacity-50' : 'hover:-translate-y-0.5 hover:border-border-hover hover:shadow-md'}
                    `}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-secondary">
                        {tool.icon}
                      </div>
                      <span className="rounded-full border border-border-default bg-elevated px-2 py-0.5 text-xs font-medium text-tertiary">
                        {tool.badge}
                      </span>
                    </div>
                    <h3 className="mb-1 font-display text-base text-primary">
                      {tool.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-secondary">{tool.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-12 rounded-xl border border-border-default bg-surface p-6">
        <h3 className="mb-4 font-display text-lg text-primary">Quick Links</h3>
        <div className="space-y-2">
          {quickLinks.map((link, idx) =>
            link.url.startsWith('http') || link.url.startsWith('mailto') ? (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg border border-border-default bg-elevated px-4 py-3 transition-all hover:border-border-hover"
              >
                <span className="text-sm font-medium text-primary">{link.title}</span>
                {getQuickLinkIcon(link.url)}
              </a>
            ) : (
              <Link
                key={idx}
                href={link.url}
                className="flex items-center justify-between rounded-lg border border-border-default bg-elevated px-4 py-3 transition-all hover:border-border-hover"
              >
                <span className="text-sm font-medium text-primary">{link.title}</span>
                <ChevronRight size={16} className="text-tertiary" />
              </Link>
            )
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl border border-border-default bg-surface p-6">
        <h3 className="mb-6 font-display text-lg text-primary">
          System Information
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <InfoRow label="Site" value={siteConfig.name} />
            <InfoRow label="URL" value={siteConfig.url} />
            <InfoRow label="Framework" value="Next.js 15" />
          </div>
          <div className="space-y-4">
            <InfoRow label="Styling" value="Tailwind CSS 4" />
            <InfoRow label="Deploy" value="Vercel" />
            <InfoRow label="Theme" value="Dark + Light" />
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  )
}

// ============================================================================
// Local components (admin-specific, not shared)
// ============================================================================

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border-default bg-surface p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-elevated text-secondary">
        {icon}
      </div>
      <div className="font-display text-2xl text-primary">{value}</div>
      <div className="mt-1 text-sm text-tertiary">{label}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 text-sm text-tertiary">{label}</div>
      <div className="text-primary">{value}</div>
    </div>
  )
}
