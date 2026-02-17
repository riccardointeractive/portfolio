import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { HTTP_STATUS } from '@/config/http'
import { clearAllData } from '@/app/admin/cortex/lib/db'

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    await clearAllData()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}
