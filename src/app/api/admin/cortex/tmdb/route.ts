import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/api/auth'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMG = 'https://image.tmdb.org/t/p'

interface TMDBResult {
  id: number
  title: string
  year: string
  overview: string
  rating: number
  posterUrl: string | null
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'TMDB_API_KEY not configured' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.trim()
  const type = searchParams.get('type') || 'movie' // 'movie' or 'tv'

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter required' },
      { status: 400 }
    )
  }

  try {
    const endpoint = type === 'tv' ? 'search/tv' : 'search/movie'
    const url = `${TMDB_BASE}/${endpoint}?query=${encodeURIComponent(query)}&language=it&page=1`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('TMDB API error:', res.status, text)
      return NextResponse.json(
        { success: false, error: `TMDB API error: ${res.status}` },
        { status: 502 }
      )
    }

    const data = await res.json()

    const results: TMDBResult[] = (data.results || [])
      .slice(0, 10)
      .map((item: Record<string, unknown>) => {
        const title = (type === 'tv' ? item.name : item.title) as string || ''
        const dateStr = (type === 'tv' ? item.first_air_date : item.release_date) as string || ''
        const year = dateStr ? dateStr.substring(0, 4) : ''
        const posterPath = item.poster_path as string | null

        return {
          id: item.id as number,
          title,
          year,
          overview: (item.overview as string) || '',
          rating: Math.round(((item.vote_average as number) || 0) * 10) / 10,
          posterUrl: posterPath ? `${TMDB_IMG}/w342${posterPath}` : null,
        }
      })

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('TMDB search error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search TMDB' },
      { status: 500 }
    )
  }
}
