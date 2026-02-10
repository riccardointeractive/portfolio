import { NextRequest, NextResponse } from 'next/server'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createAdminClient } from '@/lib/supabase/server'
import { createR2Client, R2_BUCKET } from '@/lib/r2/client'
import { verifyAdminRequest } from '@/lib/api/auth'

/**
 * GET /api/admin/media
 *
 * List all media records (paginated, filterable).
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '24')
  const type = searchParams.get('type') // e.g. 'image', 'video'
  const q = searchParams.get('q')

  const offset = (page - 1) * limit
  const supabase = createAdminClient()

  let query = supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.like('mime_type', `${type}/%`)
  }

  if (q) {
    query = query.or(`original_name.ilike.%${q}%,alt_text.ilike.%${q}%`)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
 * POST /api/admin/media
 *
 * Register a completed upload in the database.
 * Called after the browser finishes uploading to R2.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const body = await request.json()
  const { filename, original_name, mime_type, size_bytes, url, width, height, alt_text } = body as {
    filename: string
    original_name: string
    mime_type: string
    size_bytes: number
    url: string
    width?: number
    height?: number
    alt_text?: string
  }

  if (!filename || !original_name || !mime_type || !size_bytes || !url) {
    return NextResponse.json(
      { error: 'Missing required fields: filename, original_name, mime_type, size_bytes, url' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('media')
    .insert({
      filename,
      original_name,
      mime_type,
      size_bytes,
      url,
      width: width ?? null,
      height: height ?? null,
      alt_text: alt_text ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

/**
 * DELETE /api/admin/media
 *
 * Delete a media record and its R2 object.
 * Expects ?id=<uuid> query parameter.
 */
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Get the media record to find the R2 key
  const { data: media, error: fetchError } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !media) {
    return NextResponse.json({ error: 'Media not found' }, { status: 404 })
  }

  // Extract key from URL
  const r2PublicUrl = process.env.R2_PUBLIC_URL!
  const key = media.url.replace(`${r2PublicUrl}/`, '')

  // Delete from R2
  try {
    const r2 = createR2Client()
    await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  } catch {
    // Log but don't fail — the DB record should still be cleaned up
    console.error(`Failed to delete R2 object: ${key}`)
  }

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('media')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
