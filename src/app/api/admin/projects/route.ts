import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'
import type { ProjectInsert } from '@/types/content'

/**
 * GET /api/admin/projects
 *
 * List all projects (including drafts) with optional filters.
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const featured = searchParams.get('featured')
  const q = searchParams.get('q')

  const supabase = createAdminClient()

  let query = supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (featured === 'true') query = query.eq('featured', true)
  if (q) query = query.or(`title.ilike.%${q}%,client.ilike.%${q}%,description.ilike.%${q}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ items: data })
}

/**
 * POST /api/admin/projects
 *
 * Create a new project.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const body = (await request.json()) as ProjectInsert

  if (!body.title || !body.slug) {
    return NextResponse.json(
      { error: 'title and slug are required' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(body)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
