import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { importData } from '@/app/admin/cortex/lib/db'
import type { CortexData } from '@/app/admin/cortex/lib/types'

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { data, merge } = body as { data: CortexData; merge?: boolean }

    // Validate data structure
    if (!data || !data.version || !Array.isArray(data.databases)) {
      return NextResponse.json(
        { success: false, error: 'Invalid data format' },
        { status: 400 }
      )
    }

    await importData(data, merge)

    return NextResponse.json({
      success: true,
      data: {
        imported: {
          databases: data.databases.length
        }
      }
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import data' },
      { status: 500 }
    )
  }
}
