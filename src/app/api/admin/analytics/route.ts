import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminRequest } from '@/lib/api/auth'

interface R2UsageResponse {
  success: boolean
  errors: Array<{ code: number; message: string }>
  result: {
    payloadSize: number
    metadataSize: number
    objectCount: number
    uploadCount: number
  }
}

interface AnalyticsResponse {
  r2: {
    available: boolean
    error?: string
    storage?: {
      payloadSize: number
      metadataSize: number
      objectCount: number
    }
  }
  supabase: {
    available: boolean
    error?: string
    tables?: {
      projects: { total: number; published: number; draft: number }
      shots: { total: number }
      media: { total: number; images: number; videos: number; totalSizeBytes: number }
      project_blocks: { total: number }
    }
  }
}

/**
 * Fetch R2 bucket usage from Cloudflare REST API.
 * Requires CLOUDFLARE_API_TOKEN with R2 read permission.
 */
async function fetchR2Usage(): Promise<AnalyticsResponse['r2']> {
  const token = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.R2_ACCOUNT_ID
  const bucketName = process.env.R2_BUCKET_NAME

  if (!token) {
    return { available: false, error: 'CLOUDFLARE_API_TOKEN not configured' }
  }

  if (!accountId || !bucketName) {
    return { available: false, error: 'R2_ACCOUNT_ID or R2_BUCKET_NAME not configured' }
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/usage`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 0 },
      }
    )

    if (!res.ok) {
      const text = await res.text()
      return { available: true, error: `Cloudflare API error (${res.status}): ${text}` }
    }

    const data: R2UsageResponse = await res.json()

    if (!data.success) {
      return {
        available: true,
        error: data.errors?.[0]?.message || 'Unknown Cloudflare API error',
      }
    }

    return {
      available: true,
      storage: {
        payloadSize: Number(data.result.payloadSize) || 0,
        metadataSize: Number(data.result.metadataSize) || 0,
        objectCount: Number(data.result.objectCount) || 0,
      },
    }
  } catch (err) {
    return {
      available: true,
      error: `Failed to fetch R2 usage: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}

/**
 * Fetch content stats from Supabase.
 */
async function fetchSupabaseStats(): Promise<AnalyticsResponse['supabase']> {
  try {
    const supabase = createAdminClient()

    const [
      projectsTotal,
      projectsPublished,
      shotsTotal,
      mediaTotal,
      mediaImages,
      mediaVideos,
      mediaSizes,
      blocksTotal,
    ] = await Promise.all([
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
      supabase.from('shots').select('*', { count: 'exact', head: true }),
      supabase.from('media').select('*', { count: 'exact', head: true }),
      supabase.from('media').select('*', { count: 'exact', head: true }).like('mime_type', 'image/%'),
      supabase.from('media').select('*', { count: 'exact', head: true }).like('mime_type', 'video/%'),
      supabase.from('media').select('size_bytes'),
      supabase.from('project_blocks').select('*', { count: 'exact', head: true }),
    ])

    const totalSizeBytes = mediaSizes.data?.reduce((sum, row) => sum + (row.size_bytes || 0), 0) ?? 0
    const totalProjects = projectsTotal.count ?? 0
    const publishedProjects = projectsPublished.count ?? 0

    return {
      available: true,
      tables: {
        projects: {
          total: totalProjects,
          published: publishedProjects,
          draft: totalProjects - publishedProjects,
        },
        shots: { total: shotsTotal.count ?? 0 },
        media: {
          total: mediaTotal.count ?? 0,
          images: mediaImages.count ?? 0,
          videos: mediaVideos.count ?? 0,
          totalSizeBytes,
        },
        project_blocks: { total: blocksTotal.count ?? 0 },
      },
    }
  } catch (err) {
    return {
      available: false,
      error: `Failed to fetch Supabase stats: ${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}

/**
 * GET /api/admin/analytics
 *
 * Returns R2 storage usage and Supabase content stats.
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const [r2Result, supabaseResult] = await Promise.allSettled([
    fetchR2Usage(),
    fetchSupabaseStats(),
  ])

  const response: AnalyticsResponse = {
    r2: r2Result.status === 'fulfilled'
      ? r2Result.value
      : { available: false, error: 'Failed to fetch R2 data' },
    supabase: supabaseResult.status === 'fulfilled'
      ? supabaseResult.value
      : { available: false, error: 'Failed to fetch Supabase data' },
  }

  return NextResponse.json(response)
}
