import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import { HTTP_STATUS } from '@/config/http'
import type { ShotInsert } from '@/types/content'

/**
 * GET /api/admin/shots
 *
 * List all shots (including unpublished) with optional filters.
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const type = searchParams.get('type')
  const q = searchParams.get('q')
  const published = searchParams.get('published')

  const offset = (page - 1) * limit
  const supabase = createAdminClient()

  let query = supabase
    .from('shots')
    .select('*', { count: 'exact' })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.eq('type', type)
  if (published === 'true') query = query.eq('published', true)
  if (published === 'false') query = query.eq('published', false)
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json({
    items: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  })
}

/**
 * POST /api/admin/shots
 *
 * Create a new shot.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const body = (await request.json()) as ShotInsert

  if (!body.title || !body.slug || !body.type) {
    return NextResponse.json(
      { error: 'title, slug, and type are required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('shots')
    .insert(body)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: HTTP_STATUS.CONFLICT })
    }
    return NextResponse.json({ error: error.message }, { status: HTTP_STATUS.INTERNAL_ERROR })
  }

  return NextResponse.json(data, { status: HTTP_STATUS.CREATED })
}
