import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createR2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2/client'
import { verifyAdminRequest } from '@/lib/api/auth'

/**
 * POST /api/admin/upload
 *
 * Generates a presigned PUT URL for direct browser-to-R2 upload.
 * The server never handles file bytes — Vercel-friendly.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const body = await request.json()
  const { filename, contentType, folder = 'media' } = body as {
    filename: string
    contentType: string
    folder?: string
  }

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: 'filename and contentType are required' },
      { status: 400 }
    )
  }

  const sanitized = filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')

  const key = `${folder}/${crypto.randomUUID()}-${sanitized}`

  const r2 = createR2Client()
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 })
  const publicUrl = `${R2_PUBLIC_URL}/${key}`

  return NextResponse.json({ uploadUrl, publicUrl, key })
}
