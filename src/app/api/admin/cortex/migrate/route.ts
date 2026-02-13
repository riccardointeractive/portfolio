import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { verifyAdminRequest } from '@/lib/api/auth'
import { importData } from '@/app/admin/cortex/lib/db'
import type { CortexData } from '@/app/admin/cortex/lib/types'

/**
 * One-time migration: Redis → Supabase
 *
 * POST /api/admin/cortex/migrate
 *
 * Reads all data from the `cortex-databases` Redis key
 * and inserts it into Supabase tables. Safe to run multiple times
 * (it replaces existing data).
 */
/**
 * GET /api/admin/cortex/migrate
 *
 * Debug: shows what's in Redis (without migrating)
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    const databases = await redis.get<CortexData['databases']>('cortex-databases')

    if (!databases || databases.length === 0) {
      return NextResponse.json({ success: true, data: { message: 'Redis is empty', databases: [] } })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalDatabases: databases.length,
        databases: databases.map(db => ({
          id: db.id,
          name: db.name,
          icon: db.icon,
          color: db.color,
          fieldCount: db.fields.length,
          recordCount: db.records.length,
          viewCount: db.views.length,
        })),
      },
    })
  } catch (error) {
    console.error('Redis read error:', error)
    return NextResponse.json({ success: false, error: 'Failed to read Redis' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    // Read existing data from Redis
    const databases = await redis.get<CortexData['databases']>('cortex-databases')

    if (!databases || databases.length === 0) {
      return NextResponse.json({
        success: true,
        data: { migrated: 0, message: 'No data found in Redis' },
      })
    }

    const cortexData: CortexData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      databases,
    }

    // Import into Supabase (replace mode)
    await importData(cortexData, false)

    return NextResponse.json({
      success: true,
      data: {
        migrated: databases.length,
        totalRecords: databases.reduce((sum, db) => sum + db.records.length, 0),
        totalFields: databases.reduce((sum, db) => sum + db.fields.length, 0),
        totalViews: databases.reduce((sum, db) => sum + db.views.length, 0),
      },
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}
