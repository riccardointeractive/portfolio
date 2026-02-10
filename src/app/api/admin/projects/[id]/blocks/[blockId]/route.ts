import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import type { ProjectBlockUpdate } from '@/types/content'

interface RouteContext {
  params: Promise<{ id: string; blockId: string }>
}

/**
 * PATCH /api/admin/projects/[id]/blocks/[blockId]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id, blockId } = await context.params
  const body = (await request.json()) as ProjectBlockUpdate

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('project_blocks')
    .update(body)
    .eq('id', blockId)
    .eq('project_id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * DELETE /api/admin/projects/[id]/blocks/[blockId]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id, blockId } = await context.params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('project_blocks')
    .delete()
    .eq('id', blockId)
    .eq('project_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
