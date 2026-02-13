import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { getAllData } from '@/app/admin/cortex/lib/db'

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const data = await getAllData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
