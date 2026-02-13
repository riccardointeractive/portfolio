'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Modal, Button, Input } from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import type { Database, Field } from '@/app/admin/cortex/lib/types'

interface TMDBResult {
  id: number
  title: string
  year: string
  overview: string
  rating: number
  posterUrl: string | null
  genres: string[]
  duration: number | null
  seasons: number | null
  director: string | null
}

interface TMDBImportModalProps {
  open: boolean
  onClose: () => void
  database: Database
  onImported: () => void
}

/** Find a field by name (case-insensitive) */
function findField(fields: Field[], name: string): Field | undefined {
  return fields.find(f => f.name.toLowerCase() === name.toLowerCase())
}

/** Find a select option by label (case-insensitive) */
function findOption(field: Field | undefined, label: string): string | undefined {
  if (!field || !field.options) return undefined
  return field.options.find(o => o.label.toLowerCase() === label.toLowerCase())?.id
}

export function TMDBImportModal({ open, onClose, database, onImported }: TMDBImportModalProps) {
  const [searchType, setSearchType] = useState<'movie' | 'tv'>('movie')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TMDBResult[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<number | null>(null)
  const [imported, setImported] = useState<Set<number>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Set of existing record names (lowercase) for duplicate detection
  const existingNames = useMemo(() => {
    const nameField = findField(database.fields, 'Name')
    if (!nameField) return new Set<string>()
    return new Set(
      database.records
        .map(r => (r.values[nameField.id] as string)?.toLowerCase())
        .filter(Boolean)
    )
  }, [database])

  // Debounced search
  const search = useCallback(async (q: string, type: 'movie' | 'tv') => {
    if (!q.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/admin/cortex/tmdb?query=${encodeURIComponent(q)}&type=${type}`,
        { credentials: 'same-origin' }
      )
      const data = await res.json()
      if (data.success) {
        setResults(data.data || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      return
    }
    debounceRef.current = setTimeout(() => search(query, searchType), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchType, search])

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setImported(new Set())
    }
  }, [open])

  const handleImport = async (result: TMDBResult) => {
    setImporting(result.id)

    const nameField = findField(database.fields, 'Name')
    const typeField = findField(database.fields, 'Type')
    const statusField = findField(database.fields, 'Status')
    const yearField = findField(database.fields, 'Year')
    const ratingField = findField(database.fields, 'Rating')
    const overviewField = findField(database.fields, 'Overview')
    const posterField = findField(database.fields, 'Poster')
    const genreField = findField(database.fields, 'Genre')
    const durationField = findField(database.fields, 'Duration')
    const seasonsField = findField(database.fields, 'Seasons')
    const directorField = findField(database.fields, 'Director')

    const typeOptionId = findOption(typeField, searchType === 'movie' ? 'Film' : 'Serie TV')
    const statusOptionId = findOption(statusField, 'Da Vedere')

    // Map genre names to multiselect option IDs
    const genreOptionIds = result.genres
      .map(name => findOption(genreField, name))
      .filter(Boolean) as string[]

    const values: Record<string, unknown> = {}
    if (nameField) values[nameField.id] = result.title
    if (typeField && typeOptionId) values[typeField.id] = typeOptionId
    if (statusField && statusOptionId) values[statusField.id] = statusOptionId
    if (yearField && result.year) values[yearField.id] = parseInt(result.year, 10)
    if (ratingField) values[ratingField.id] = result.rating
    if (overviewField && result.overview) values[overviewField.id] = result.overview
    if (posterField && result.posterUrl) values[posterField.id] = result.posterUrl
    if (genreField && genreOptionIds.length > 0) values[genreField.id] = genreOptionIds
    if (durationField && result.duration) values[durationField.id] = result.duration
    if (seasonsField && result.seasons) values[seasonsField.id] = result.seasons
    if (directorField && result.director) values[directorField.id] = result.director

    try {
      await databasesApi.addRecord(database.id, values)
      setImported(prev => new Set([...prev, result.id]))
      onImported()
    } catch {
      // silently fail
    } finally {
      setImporting(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import from TMDB"
      description="Search movies and TV shows in Italian"
      className="max-w-lg"
    >
      <div className="flex flex-col gap-4">
        {/* Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSearchType('movie')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'movie'
                ? 'bg-elevated text-primary'
                : 'text-tertiary hover:text-secondary'
            }`}
          >
            Film
          </button>
          <button
            onClick={() => setSearchType('tv')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchType === 'tv'
                ? 'bg-elevated text-primary'
                : 'text-tertiary hover:text-secondary'
            }`}
          >
            Serie TV
          </button>
        </div>

        {/* Search Input */}
        <Input
          placeholder={searchType === 'movie' ? 'Search movies...' : 'Search TV shows...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        {/* Results */}
        <div className="max-h-96 overflow-y-auto -mx-4 px-4">
          {loading && (
            <div className="flex items-center justify-center py-8 text-tertiary">
              <Icon name="search" size={20} className="animate-pulse" />
              <span className="ml-2 text-sm">Searching...</span>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="text-center text-sm text-tertiary py-8">No results found</p>
          )}

          {!loading && results.map((result) => {
            const alreadyExists = existingNames.has(result.title.toLowerCase())
            const isImported = imported.has(result.id) || alreadyExists
            const isImporting = importing === result.id

            return (
              <div
                key={result.id}
                className="flex gap-3 p-3 rounded-lg hover:bg-elevated transition-colors mb-2"
              >
                {/* Poster */}
                <div className="w-12 h-18 rounded-md overflow-hidden bg-elevated flex-shrink-0">
                  {result.posterUrl ? (
                    <img
                      src={result.posterUrl}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="image" size={16} className="text-tertiary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">
                        {result.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {result.year && (
                          <span className="text-xs text-tertiary">{result.year}</span>
                        )}
                        {result.rating > 0 && (
                          <span className="text-xs text-tertiary">★ {result.rating}</span>
                        )}
                        {result.duration && (
                          <span className="text-xs text-tertiary">{result.duration} min</span>
                        )}
                        {result.seasons && (
                          <span className="text-xs text-tertiary">{result.seasons} stagion{result.seasons === 1 ? 'e' : 'i'}</span>
                        )}
                        {result.director && (
                          <span className="text-xs text-tertiary">{result.director}</span>
                        )}
                      </div>
                      {result.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {result.genres.slice(0, 3).map(g => (
                            <span key={g} className="text-xs px-1.5 py-0.5 rounded bg-elevated text-secondary">
                              {g}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Import Button */}
                    {isImported ? (
                      <span className="flex-shrink-0 text-xs text-accent-green px-2 py-1 rounded-md bg-accent-green-subtle">
                        Added
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleImport(result)}
                        disabled={isImporting}
                        className="flex-shrink-0"
                      >
                        {isImporting ? '...' : '+ Add'}
                      </Button>
                    )}
                  </div>

                  {result.overview && (
                    <p className="text-xs text-secondary mt-1 line-clamp-2">
                      {result.overview}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
