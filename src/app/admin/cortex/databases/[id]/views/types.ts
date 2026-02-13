import type { ReactNode } from 'react'
import type { Database, DatabaseRecord, DatabaseView, Field, FieldType } from '@/app/admin/cortex/lib/types'

/** Shared props for all database view components */
export interface BaseViewProps {
  database: Database
  allDatabases: Database[]
  activeView: DatabaseView
  filteredRecords: DatabaseRecord[]
  databaseId: string

  // Drag and drop
  canDragRecords: boolean
  draggedRecordId: string | null
  onDragStart: (e: React.DragEvent, recordId: string) => void
  onDragEnd: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, targetRecordId: string) => void

  // Record operations
  onOpenEditRecord: (record: DatabaseRecord) => void
  onOpenNewRecord: () => void
  onDeleteRecord: (recordId: string) => void
  onRefreshDatabase: () => Promise<void>
}

/** TableView-specific props */
export interface TableViewProps extends BaseViewProps {
  visibleFields: Field[]
  fieldTypeIcons: Record<FieldType, string>
  renderCellValue: (field: Field, value: unknown, recordId: string) => ReactNode
  onDeleteField: (fieldId: string) => void
  onNavigateToRecord: (recordId: string) => void
}

/** CardsView-specific props */
export interface CardsViewProps extends BaseViewProps {
  onNavigateToSourceRecord: (sourceDatabaseId: string, recordId: string) => void
}
