'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, Button } from '@/app/admin/cortex/components/ui'
import { StatCard } from '@/components/ui/StatCard'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { dashboardApi } from '@/app/admin/cortex/lib/api'
import { formatRelativeDate, customColorBg } from '@/app/admin/cortex/lib/utils'
import { ROUTES } from '@/config/routes'
import type { DashboardStats } from '@/app/admin/cortex/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await dashboardApi.stats()
      if (res.data) {
        setStats(res.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-tertiary">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href={ROUTES.admin.cortexDatabases}>
          <StatCard
            label="Databases"
            value={stats?.totalDatabases || 0}
            icon={<Icon name="layers" size={20} className="text-secondary" />}
            accentClass="bg-elevated text-secondary"
          />
        </Link>

        <StatCard
          label="Total Records"
          value={stats?.totalRecords || 0}
          icon={<Icon name="list" size={20} className="text-secondary" />}
          accentClass="bg-elevated text-secondary"
        />

        <Card>
          <Link href={ROUTES.admin.cortexDatabases} className="block p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-tertiary">Quick Action</p>
                <p className="font-display text-lg text-primary mt-1">Create Database</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center">
                <Icon name="plus" size={20} className="text-secondary" />
              </div>
            </div>
          </Link>
        </Card>
      </div>

      {/* Recent Databases */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-primary">Recent Databases</h2>
            <Link href={ROUTES.admin.cortexDatabases}>
              <Button variant="ghost" size="sm">
                View All
                <Icon name="chevron-right" size={16} />
              </Button>
            </Link>
          </div>

          {stats?.recentDatabases && stats.recentDatabases.length > 0 ? (
            <div className="space-y-3">
              {stats.recentDatabases.map(db => (
                <Link
                  key={db.id}
                  href={ROUTES.admin.cortexDatabase(db.id)}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-elevated transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={customColorBg(db.color)}
                  >
                    <Icon name={db.icon} size={20} color={db.color} weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-primary truncate">{db.name}</p>
                    <p className="text-sm text-tertiary">
                      {db.recordCount} records • Updated {formatRelativeDate(db.updatedAt)}
                    </p>
                  </div>
                  <Icon name="chevron-right" size={16} className="text-tertiary" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon name="layers" size={48} className="text-tertiary mx-auto mb-3" />
              <p className="text-tertiary mb-4">No databases yet</p>
              <Link href={ROUTES.admin.cortexDatabases}>
                <Button>
                  <Icon name="plus" size={18} />
                  Create Your First Database
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Card>

      {/* Getting Started */}
      {stats?.totalDatabases === 0 && (
        <Card>
          <div className="p-6">
            <h2 className="font-display text-lg text-primary mb-4">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-elevated">
                <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center mb-3">
                  <Icon name="world" size={20} className="text-secondary" />
                </div>
                <h3 className="font-display text-base text-primary mb-1">1. Create Spheres</h3>
                <p className="text-sm text-tertiary">Create a &quot;Spheres&quot; database to organize your life areas</p>
              </div>
              <div className="p-4 rounded-lg bg-elevated">
                <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center mb-3">
                  <Icon name="folder" size={20} className="text-secondary" />
                </div>
                <h3 className="font-display text-base text-primary mb-1">2. Add Projects</h3>
                <p className="text-sm text-tertiary">Create a &quot;Projects&quot; database and link to Spheres</p>
              </div>
              <div className="p-4 rounded-lg bg-elevated">
                <div className="w-10 h-10 rounded-lg bg-elevated flex items-center justify-center mb-3">
                  <Icon name="check-square" size={20} className="text-secondary" />
                </div>
                <h3 className="font-display text-base text-primary mb-1">3. Track Tasks</h3>
                <p className="text-sm text-tertiary">Create a &quot;Tasks&quot; database and link to Projects</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
