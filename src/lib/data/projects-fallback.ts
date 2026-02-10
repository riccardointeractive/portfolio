import { getFeaturedProjects as getDbProjects } from '@/lib/data/projects'
import { projects as staticProjects } from '@/config/projects'
import type { Project } from '@/types/content'

/**
 * Returns featured projects from DB, falling back to static data
 * during the migration period. Remove this once DB is populated.
 */
export async function getFeaturedProjectsWithFallback(): Promise<Project[]> {
  try {
    const dbProjects = await getDbProjects()
    if (dbProjects.length > 0) return dbProjects
  } catch {
    // DB not configured yet — fall through to static data
  }

  // Fallback: map static projects to the new shape
  return staticProjects.map((p, i) => ({
    id: p.id,
    slug: p.id,
    title: p.title,
    client: null,
    year: null,
    role: null,
    description: p.description,
    cover_image: p.image,
    tags: p.tags,
    status: 'published' as const,
    featured: true,
    sort_order: i,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
}
