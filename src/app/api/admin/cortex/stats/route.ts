import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { HTTP_STATUS } from '@/config/http'
import { getDashboardStats } from '@/app/admin/cortex/lib/db'

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const stats = await getDashboardStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
