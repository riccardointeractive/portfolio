import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { HTTP_STATUS } from '@/config/http'
import type { ShotUpdate } from '@/types/content'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * GET /api/admin/shots/[id]
 */
export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('shots')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Shot not found' }, { status: HTTP_STATUS.NOT_FOUND })
  }

  return NextResponse.json(data)
}

/**
 * PATCH /api/admin/shots/[id]
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const body = (await request.json()) as ShotUpdate

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('shots')
    .update(body)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: HTTP_STATUS.CONFLICT })
    }
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json(data)
}

/**
 * DELETE /api/admin/shots/[id]
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { id } = await context.params
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('shots')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json({ success: true })
}
