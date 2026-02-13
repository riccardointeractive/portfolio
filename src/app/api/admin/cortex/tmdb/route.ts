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
  genres: string[]       // Genre names in Italian
  duration: number | null // Runtime in minutes (movies only)
  seasons: number | null  // Number of seasons (TV only)
  director: string | null // Director (movies) or Creator (TV)
}

// TMDB genre ID → Italian name mapping (combined movie + TV)
const GENRE_MAP: Record<number, string> = {
  28: 'Azione', 12: 'Avventura', 16: 'Animazione', 35: 'Commedia',
  80: 'Crime', 99: 'Documentario', 18: 'Dramma', 10751: 'Famiglia',
  14: 'Fantasy', 36: 'Storia', 27: 'Horror', 10402: 'Musica',
  9648: 'Mistero', 10749: 'Romance', 878: 'Fantascienza',
  53: 'Thriller', 10752: 'Guerra', 37: 'Western',
  // TV-specific genre IDs mapped to closest equivalents
  10759: 'Azione',      // Action & Adventure
  10765: 'Fantascienza', // Sci-Fi & Fantasy
  10768: 'Guerra',       // War & Politics
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
    // Step 1: Search
    const endpoint = type === 'tv' ? 'search/tv' : 'search/movie'
    const searchUrl = `${TMDB_BASE}/${endpoint}?query=${encodeURIComponent(query)}&language=it&page=1`

    const searchRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!searchRes.ok) {
      const text = await searchRes.text()
      console.error('TMDB API error:', searchRes.status, text)
      return NextResponse.json(
        { success: false, error: `TMDB API error: ${searchRes.status}` },
        { status: 502 }
      )
    }

    const searchData = await searchRes.json()
    const searchResults = (searchData.results || []).slice(0, 10)

    // Step 2: Fetch details for each result in parallel (includes credits)
    const detailPromises = searchResults.map(async (item: Record<string, unknown>) => {
      const itemId = item.id as number
      const detailType = type === 'tv' ? 'tv' : 'movie'
      const detailUrl = `${TMDB_BASE}/${detailType}/${itemId}?language=it&append_to_response=credits`

      try {
        const detailRes = await fetch(detailUrl, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        if (detailRes.ok) return await detailRes.json()
      } catch {
        // Fall back to search data only
      }
      return null
    })

    const details = await Promise.all(detailPromises)

    // Step 3: Merge search + detail data
    const results: TMDBResult[] = searchResults.map((item: Record<string, unknown>, i: number) => {
      const detail = details[i]
      const title = (type === 'tv' ? item.name : item.title) as string || ''
      const dateStr = (type === 'tv' ? item.first_air_date : item.release_date) as string || ''
      const year = dateStr ? dateStr.substring(0, 4) : ''
      const posterPath = item.poster_path as string | null

      // Genres: from detail (full names) or fallback to search genre_ids
      let genres: string[] = []
      if (detail?.genres) {
        genres = (detail.genres as { id: number; name: string }[])
          .map(g => GENRE_MAP[g.id] || g.name)
          .filter((v, idx, arr) => arr.indexOf(v) === idx) // dedupe
      } else if (item.genre_ids) {
        genres = (item.genre_ids as number[])
          .map(id => GENRE_MAP[id])
          .filter(Boolean)
      }

      // Duration (movies) or Seasons (TV)
      let duration: number | null = null
      let seasons: number | null = null
      if (type === 'tv' && detail) {
        seasons = (detail.number_of_seasons as number) || null
      } else if (detail) {
        duration = (detail.runtime as number) || null
      }

      // Director (movies) or Creator (TV)
      let director: string | null = null
      if (type === 'tv' && detail?.created_by) {
        const creators = detail.created_by as { name: string }[]
        if (creators.length > 0) {
          director = creators.map(c => c.name).slice(0, 2).join(', ')
        }
      } else if (detail?.credits?.crew) {
        const crew = detail.credits.crew as { job: string; name: string }[]
        const dir = crew.find(c => c.job === 'Director')
        if (dir) director = dir.name
      }

      return {
        id: item.id as number,
        title,
        year,
        overview: (item.overview as string) || '',
        rating: Math.round(((item.vote_average as number) || 0) * 10) / 10,
        posterUrl: posterPath ? `${TMDB_IMG}/w342${posterPath}` : null,
        genres,
        duration,
        seasons,
        director,
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
