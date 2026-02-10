// ============================================================================
// Content Types — Study Case Builder
//
// Central type definitions for all CMS content entities.
// These types match the Supabase database schema.
// ============================================================================

// ============================================================================
// Enums
// ============================================================================

export type ShotType = 'image' | 'video' | 'code' | 'animation'
export type ProjectStatus = 'draft' | 'published'
export type BlockType =
  | 'text'
  | 'shot'
  | 'media'
  | 'compare'
  | 'design-system'
  | 'quote'
  | 'video-embed'

// ============================================================================
// Database Row Types
// ============================================================================

export interface Shot {
  id: string
  slug: string
  title: string
  type: ShotType
  media_url: string | null
  thumbnail_url: string | null
  aspect_ratio: string
  description: string | null
  tags: string[]
  project_id: string | null
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  slug: string
  title: string
  client: string | null
  year: number | null
  role: string | null
  description: string | null
  cover_image: string | null
  tags: string[]
  status: ProjectStatus
  featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProjectBlock {
  id: string
  project_id: string
  sort_order: number
  type: BlockType
  content: BlockContent
  created_at: string
  updated_at: string
}

export interface MediaRecord {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  width: number | null
  height: number | null
  alt_text: string | null
  created_at: string
}

// ============================================================================
// Block Content Types (JSONB — discriminated by BlockType)
// ============================================================================

export type BlockContent =
  | TextBlockContent
  | ShotBlockContent
  | MediaBlockContent
  | CompareBlockContent
  | DesignSystemBlockContent
  | QuoteBlockContent
  | VideoEmbedBlockContent

export interface TextBlockContent {
  markdown: string
}

export interface ShotBlockContent {
  shot_id: string
  caption?: string
}

export interface MediaBlockContent {
  url: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export interface CompareBlockContent {
  before_url: string
  after_url: string
  before_label?: string
  after_label?: string
}

export interface DesignSystemBlockContent {
  title: string
  description?: string
  tokens: Array<{
    name: string
    value: string
    preview_type: 'color' | 'text' | 'spacing'
  }>
}

export interface QuoteBlockContent {
  text: string
  attribution?: string
  role?: string
}

export interface VideoEmbedBlockContent {
  url: string
  provider: 'youtube' | 'vimeo' | 'loom' | 'other'
  aspect_ratio?: string
}

// ============================================================================
// Insert / Update Types (omit auto-generated fields)
// ============================================================================

export type ShotInsert = Omit<Shot, 'id' | 'created_at' | 'updated_at'>
export type ShotUpdate = Partial<Omit<Shot, 'id' | 'created_at' | 'updated_at'>>

export type ProjectInsert = Omit<Project, 'id' | 'created_at' | 'updated_at'>
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>

export type ProjectBlockInsert = Omit<ProjectBlock, 'id' | 'created_at' | 'updated_at'>
export type ProjectBlockUpdate = Partial<
  Omit<ProjectBlock, 'id' | 'project_id' | 'created_at' | 'updated_at'>
>

// ============================================================================
// Joined Types
// ============================================================================

export interface ProjectWithBlocks extends Project {
  blocks: ProjectBlock[]
}
