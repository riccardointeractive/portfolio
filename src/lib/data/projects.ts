import { createPublicClient } from '@/lib/supabase/server'
import type { Project, ProjectWithBlocks, Shot } from '@/types/content'

export async function getPublishedProjects(): Promise<Project[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  return data ?? []
}

export async function getFeaturedProjects(): Promise<Project[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('sort_order', { ascending: true })

  return data ?? []
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithBlocks | null> {
  const supabase = createPublicClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!project) return null

  const { data: blocks } = await supabase
    .from('project_blocks')
    .select('*')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  return { ...project, blocks: blocks ?? [] }
}

export async function getAllProjectSlugs(): Promise<string[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('projects')
    .select('slug')
    .eq('status', 'published')

  return data?.map((p) => p.slug) ?? []
}

export async function getPublishedShots(): Promise<Shot[]> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('shots')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  return data ?? []
}

export async function getShotById(id: string): Promise<Shot | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('shots')
    .select('*')
    .eq('id', id)
    .single()

  return data
}
