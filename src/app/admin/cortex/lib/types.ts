// Core data types for Cortex - Database-centric architecture

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

// Database types
export type FieldType = 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'checkbox' | 'url' | 'email' | 'relation'

export interface FieldOption {
  id: string
  label: string
  color: string
}

export interface RelationConfig {
  databaseId: string
  multiple: boolean
}

export interface Field {
  id: string
  name: string
  type: FieldType
  options?: FieldOption[] // For select/multiselect
  relationConfig?: RelationConfig // For relation type
  required?: boolean
}

export interface DatabaseRecord {
  id: string
  values: Record<string, unknown> // fieldId -> value
  order: number // Manual sort order
  createdAt: string
  updatedAt: string
}

export interface FilterCondition {
  fieldId: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'gt' | 'lt' | 'gte' | 'lte'
  value?: unknown
}

export interface SortCondition {
  fieldId: string
  direction: 'asc' | 'desc'
}

export interface CardsViewConfig {
  sourceDatabaseId: string    // Which database to show (e.g., Tasks)
  groupByFieldId: string      // Field in source db that relates to current db
  displayFields?: string[]    // Which fields to show in the cards
}

export interface GalleryViewConfig {
  imageFieldId: string      // URL field to use as image (e.g., Poster)
}

export interface DatabaseView {
  id: string
  name: string
  type: 'table' | 'cards' | 'todo' | 'myday' | 'gallery'
  filters: FilterCondition[]
  sorts: SortCondition[]
  visibleFields: string[] // fieldIds
  cardsConfig?: CardsViewConfig // Only for cards type
  todoConfig?: TodoViewConfig // Only for todo type
  myDayConfig?: MyDayViewConfig // Only for myday type
  galleryConfig?: GalleryViewConfig // Only for gallery type
}

export interface TodoViewConfig {
  checkboxFieldId: string      // Which checkbox field to use
  showCompleted: boolean       // Show completed items
  completedCollapsed: boolean  // Collapse completed section
}

export interface MyDayViewConfig {
  dateFieldId: string          // Field to store last completed date (per habit)
  streakFieldId: string        // Field to store current streak count (per habit)
  perfectStreak?: number       // Global perfect day streak (stored in view)
  lastPerfectDay?: string      // Date of last perfect day (stored in view)
}

export interface Database {
  id: string
  name: string
  description?: string
  icon: string
  color: string
  fields: Field[]
  records: DatabaseRecord[]
  views: DatabaseView[]
  createdAt: string
  updatedAt: string
}

// Complete data structure for import/export
export interface CortexData {
  version: string
  exportedAt: string
  databases: Database[]
}

// Dashboard stats - database agnostic
export interface DashboardStats {
  totalDatabases: number
  totalRecords: number
  recentDatabases: {
    id: string
    name: string
    icon: string
    color: string
    recordCount: number
    updatedAt: string
  }[]
}

// Color palette for databases and options — canonical source in @/config/design-tokens
export { DATABASE_COLORS, DEFAULT_DATABASE_COLOR } from '@/config/design-tokens'
