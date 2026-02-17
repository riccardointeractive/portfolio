import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { HTTP_STATUS } from '@/config/http'
import type { ProjectBlockInsert } from '@/types/content'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/projects/[id]/blocks
 *
 * List all blocks for a project, ordered by sort_order.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('project_blocks')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json({ items: data })
}

/**
 * POST /api/admin/projects/[id]/blocks
 *
 * Add a new block to a project. Auto-assigns next sort_order.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const body = await request.json()

  const supabase = createAdminClient()

  // Get the current max sort_order
  const { data: existing } = await supabase
    .from('project_blocks')
    .select('sort_order')
    .eq('project_id', id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  const insert: ProjectBlockInsert = {
    project_id: id,
    sort_order: body.sort_order ?? nextOrder,
    type: body.type,
    content: body.content || {},
  }

  const { data, error } = await supabase
    .from('project_blocks')
    .insert(insert)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json(data, { status: HTTP_STATUS.CREATED })
}
