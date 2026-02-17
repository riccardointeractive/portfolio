import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { HTTP_STATUS } from '@/config/http'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PUT /api/admin/projects/[id]/blocks/reorder
 *
 * Reorder blocks. Body: { blockIds: string[] } (ordered array).
 * Updates sort_order for each block.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const { blockIds } = (await request.json()) as { blockIds: string[] }

  if (!Array.isArray(blockIds) || blockIds.length === 0) {
    return NextResponse.json({ error: 'blockIds array is required' }, { status: HTTP_STATUS.BAD_REQUEST })
  }

  const supabase = createAdminClient()

  // Update each block's sort_order
  const updates = blockIds.map((blockId, index) =>
    supabase
      .from('project_blocks')
      .update({ sort_order: index })
      .eq('id', blockId)
      .eq('project_id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)

  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json({ success: true })
}
