'use client'

import { useState, useEffect, useMemo, useCallback, use } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Card, Button, Modal, Input, Select, Badge, Checkbox,
} from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { TMDBImportModal } from '@/app/admin/cortex/components/ui/TMDBImportModal'
import { TableView, CardsView, TodoView, MyDayView, GalleryView } from './views'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { cn, generateId, customColorBg } from '@/app/admin/cortex/lib/utils'
import { ROUTES } from '@/config/routes'
import {
  DATABASE_COLORS,
  type Database, type DatabaseRecord, type DatabaseView, type Field, type FieldType,
  type FilterCondition, type SortCondition, type FieldOption, type CardsViewConfig, type TodoViewConfig, type MyDayViewConfig, type GalleryViewConfig
} from '@/app/admin/cortex/lib/types'

// Field type icons
const FIELD_TYPE_ICONS: Record<FieldType, string> = {
  text: 'text',
  number: 'numbers',
  select: 'tag',
  multiselect: 'tags',
  date: 'calendar',
  checkbox: 'check-square',
  url: 'link',
  email: 'email',
  relation: 'share',
}

// Filter operators by field type
const FILTER_OPERATORS: Record<FieldType, { value: string; label: string }[]> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  number: [
    { value: 'equals', label: '=' },
    { value: 'not_equals', label: '≠' },
    { value: 'gt', label: '>' },
    { value: 'lt', label: '<' },
    { value: 'gte', label: '≥' },
    { value: 'lte', label: '≤' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  multiselect: [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does not contain' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  date: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
    { value: 'gt', label: 'After' },
    { value: 'lt', label: 'Before' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  checkbox: [
    { value: 'equals', label: 'Is' },
  ],
  url: [
    { value: 'contains', label: 'Contains' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  email: [
    { value: 'contains', label: 'Contains' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  relation: [
    { value: 'equals', label: 'Is' },
    { value: 'not_equals', label: 'Is not' },
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
}

// Select option colors — reuse shared palette
const OPTION_COLORS = DATABASE_COLORS

export default function DatabaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [database, setDatabase] = useState<Database | null>(null)
  const [allDatabases, setAllDatabases] = useState<Database[]>([])
  const [loading, setLoading] = useState(true)
  const [activeViewId, setActiveViewId] = useState<string | null>(null)

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [sortModalOpen, setSortModalOpen] = useState(false)
  const [fieldModalOpen, setFieldModalOpen] = useState(false)
  const [fieldsManagerOpen, setFieldsManagerOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<DatabaseRecord | null>(null)
  const [recordModalOpen, setRecordModalOpen] = useState(false)
  const [editingField, setEditingField] = useState<Field | null>(null)
  const [editingView, setEditingView] = useState<DatabaseView | null>(null)
  const [draggedRecordId, setDraggedRecordId] = useState<string | null>(null)
  const [tmdbModalOpen, setTmdbModalOpen] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [backfillProgress, setBackfillProgress] = useState({ current: 0, total: 0 })
  const [activeCellDropdown, setActiveCellDropdown] = useState<{
    recordId: string
    fieldId: string
    rect: DOMRect
  } | null>(null)

  // Form states
  const [newViewName, setNewViewName] = useState('')
  const [newViewType, setNewViewType] = useState<'table' | 'cards' | 'todo' | 'myday' | 'gallery'>('table')
  const [newViewCardsConfig, setNewViewCardsConfig] = useState<{
    sourceDatabaseId: string
    groupByFieldId: string
  }>({ sourceDatabaseId: '', groupByFieldId: '' })
  const [newViewTodoConfig, setNewViewTodoConfig] = useState<{
    checkboxFieldId: string
    showCompleted: boolean
    completedCollapsed: boolean
  }>({ checkboxFieldId: '', showCompleted: true, completedCollapsed: false })
  const [newViewMyDayConfig, setNewViewMyDayConfig] = useState<{
    dateFieldId: string
    streakFieldId: string
  }>({ dateFieldId: '', streakFieldId: '' })
  const [newViewGalleryConfig, setNewViewGalleryConfig] = useState<{
    imageFieldId: string
  }>({ imageFieldId: '' })
  const [newField, setNewField] = useState<{
    name: string;
    type: FieldType;
    options: FieldOption[];
    relationConfig?: { databaseId: string; multiple: boolean }
  }>({
    name: '', type: 'text', options: []
  })
  const [recordValues, setRecordValues] = useState<Record<string, unknown>>({})

  // Lightweight refresh: only refetch current database (used after mutations)
  const refreshDatabase = useCallback(async () => {
    try {
      const dbRes = await databasesApi.get(id)
      if (!dbRes.data) {
        router.push(ROUTES.admin.cortexDatabases)
        return
      }
      setDatabase(dbRes.data)
      if (!activeViewId && dbRes.data.views.length > 0) {
        setActiveViewId(dbRes.data.views[0].id)
      }
    } catch (error) {
      console.error('Failed to refresh database:', error)
    }
  }, [id, activeViewId, router])

  // Full load: fetch current database + all databases (only on mount / id change)
  const loadData = useCallback(async () => {
    try {
      const [dbRes, allDbRes] = await Promise.all([
        databasesApi.get(id),
        databasesApi.list()
      ])
      if (!dbRes.data) {
        router.push(ROUTES.admin.cortexDatabases)
        return
      }
      setDatabase(dbRes.data)
      setAllDatabases(allDbRes.data || [])
      if (!activeViewId && dbRes.data.views.length > 0) {
        setActiveViewId(dbRes.data.views[0].id)
      }
    } catch (error) {
      console.error('Failed to load database:', error)
    } finally {
      setLoading(false)
    }
  }, [id, activeViewId, router])

  useEffect(() => {
    loadData()
  }, [id])

  const activeView = useMemo(() => {
    if (!database || !activeViewId) return null
    return database.views.find(v => v.id === activeViewId) || database.views[0]
  }, [database, activeViewId])

  // Detect if this is a Movies database (has Type field with Film/Serie TV options)
  const isMoviesDb = useMemo(() => {
    if (!database) return false
    const typeField = database.fields.find(f => f.name.toLowerCase() === 'type')
    if (!typeField?.options) return false
    const labels = typeField.options.map(o => o.label.toLowerCase())
    return labels.includes('film') && labels.includes('serie tv')
  }, [database])

  // Memoized: other databases (excluding current) — used in view config and field modals
  const otherDatabases = useMemo(() =>
    allDatabases.filter(db => db.id !== id).map(db => ({ value: db.id, label: db.name }))
  , [allDatabases, id])

  // Backfill: detect records missing Genre/Duration/Director
  const recordsNeedingBackfill = useMemo(() => {
    if (!database || !isMoviesDb) return []
    const genreField = database.fields.find(f => f.name.toLowerCase() === 'genre')
    const durationField = database.fields.find(f => f.name.toLowerCase() === 'duration')
    const directorField = database.fields.find(f => f.name.toLowerCase() === 'director')
    const nameField = database.fields.find(f => f.name.toLowerCase() === 'name')
    if (!nameField) return []

    return database.records.filter(record => {
      const hasName = !!record.values[nameField.id]
      if (!hasName) return false
      const needsGenre = genreField && (!record.values[genreField.id] || (Array.isArray(record.values[genreField.id]) && (record.values[genreField.id] as string[]).length === 0))
      const needsDuration = durationField && !record.values[durationField.id]
      const needsDirector = directorField && !record.values[directorField.id]
      return needsGenre || needsDuration || needsDirector
    })
  }, [database, isMoviesDb])

  // Backfill: fetch TMDB data for records missing new fields
  const handleBackfill = useCallback(async () => {
    if (!database || backfilling) return
    setBackfilling(true)
    setBackfillProgress({ current: 0, total: recordsNeedingBackfill.length })

    const nameField = database.fields.find(f => f.name.toLowerCase() === 'name')
    const yearField = database.fields.find(f => f.name.toLowerCase() === 'year')
    const typeField = database.fields.find(f => f.name.toLowerCase() === 'type')
    const genreField = database.fields.find(f => f.name.toLowerCase() === 'genre')
    const durationField = database.fields.find(f => f.name.toLowerCase() === 'duration')
    const seasonsField = database.fields.find(f => f.name.toLowerCase() === 'seasons')
    const directorField = database.fields.find(f => f.name.toLowerCase() === 'director')

    let successCount = 0

    for (let i = 0; i < recordsNeedingBackfill.length; i++) {
      const record = recordsNeedingBackfill[i]
      setBackfillProgress({ current: i + 1, total: recordsNeedingBackfill.length })

      const name = nameField ? record.values[nameField.id] as string : ''
      const year = yearField ? record.values[yearField.id] : ''
      const typeOptionId = typeField ? record.values[typeField.id] as string : ''
      const isTv = typeField?.options?.find(o => o.id === typeOptionId)?.label.toLowerCase().includes('serie')
      const searchType = isTv ? 'tv' : 'movie'

      try {
        const res = await fetch(
          `/api/admin/cortex/tmdb?query=${encodeURIComponent(name)}&type=${searchType}`,
          { credentials: 'same-origin' }
        )
        const data = await res.json()

        if (data.success && data.data?.length > 0) {
          const result = data.data[0]
          const values: Record<string, unknown> = {}

          // Genre: only if empty
          if (genreField && (!record.values[genreField.id] || (Array.isArray(record.values[genreField.id]) && (record.values[genreField.id] as string[]).length === 0))) {
            const genreOptionIds = (result.genres as string[])
              .map((gName: string) => genreField.options?.find(o => o.label.toLowerCase() === gName.toLowerCase())?.id)
              .filter(Boolean) as string[]
            if (genreOptionIds.length > 0) values[genreField.id] = genreOptionIds
          }

          // Duration: only if empty (movies only)
          if (durationField && !record.values[durationField.id] && result.duration) {
            values[durationField.id] = result.duration
          }

          // Seasons: only if empty (TV only)
          if (seasonsField && !record.values[seasonsField.id] && result.seasons) {
            values[seasonsField.id] = result.seasons
          }

          // Director: only if empty
          if (directorField && !record.values[directorField.id] && result.director) {
            values[directorField.id] = result.director
          }

          if (Object.keys(values).length > 0) {
            await databasesApi.updateRecord(id, record.id, values)
            successCount++
          }
        }
      } catch (error) {
        console.error(`Backfill failed for "${name}":`, error)
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 300))
    }

    setBackfilling(false)
    await refreshDatabase()
    console.log(`Backfilled ${successCount}/${recordsNeedingBackfill.length} records`)
  }, [database, backfilling, recordsNeedingBackfill, id, refreshDatabase])

  // Apply filters and sorts to records
  const filteredRecords = useMemo(() => {
    if (!database || !activeView) return []

    let records = [...database.records]

    // Apply filters
    for (const filter of activeView.filters) {
      const field = database.fields.find(f => f.id === filter.fieldId)
      if (!field) continue

      records = records.filter(record => {
        const value = record.values[filter.fieldId]

        switch (filter.operator) {
          case 'equals':
            return value === filter.value
          case 'not_equals':
            return value !== filter.value
          case 'contains':
            return String(value || '').toLowerCase().includes(String(filter.value || '').toLowerCase())
          case 'not_contains':
            return !String(value || '').toLowerCase().includes(String(filter.value || '').toLowerCase())
          case 'is_empty':
            return value === undefined || value === null || value === ''
          case 'is_not_empty':
            return value !== undefined && value !== null && value !== ''
          case 'gt':
            return Number(value) > Number(filter.value)
          case 'lt':
            return Number(value) < Number(filter.value)
          case 'gte':
            return Number(value) >= Number(filter.value)
          case 'lte':
            return Number(value) <= Number(filter.value)
          default:
            return true
        }
      })
    }

    // Apply sorts - if no sorts, use manual order
    if (activeView.sorts.length === 0) {
      records.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    } else {
      // Single-pass multi-sort: one comparator handles all sort conditions
      records.sort((a, b) => {
        for (const sort of activeView.sorts) {
          const aVal = a.values[sort.fieldId]
          const bVal = b.values[sort.fieldId]

          if (aVal === bVal) continue
          if (aVal === undefined || aVal === null) return 1
          if (bVal === undefined || bVal === null) return -1

          const cmp = aVal < bVal ? -1 : 1
          return sort.direction === 'asc' ? cmp : -cmp
        }
        return 0
      })
    }

    return records
  }, [database, activeView])

  // View management
  const resetViewForm = () => {
    setNewViewName('')
    setNewViewType('table')
    setNewViewCardsConfig({ sourceDatabaseId: '', groupByFieldId: '' })
    setNewViewTodoConfig({ checkboxFieldId: '', showCompleted: true, completedCollapsed: false })
    setNewViewMyDayConfig({ dateFieldId: '', streakFieldId: '' })
    setNewViewGalleryConfig({ imageFieldId: '' })
    setEditingView(null)
  }

  const openNewView = () => {
    resetViewForm()
    setViewModalOpen(true)
  }

  const openEditView = (view: DatabaseView) => {
    setEditingView(view)
    setNewViewName(view.name)
    setNewViewType(view.type)
    if (view.cardsConfig) {
      setNewViewCardsConfig({
        sourceDatabaseId: view.cardsConfig.sourceDatabaseId,
        groupByFieldId: view.cardsConfig.groupByFieldId
      })
    } else {
      setNewViewCardsConfig({ sourceDatabaseId: '', groupByFieldId: '' })
    }
    if (view.todoConfig) {
      setNewViewTodoConfig({
        checkboxFieldId: view.todoConfig.checkboxFieldId,
        showCompleted: view.todoConfig.showCompleted,
        completedCollapsed: view.todoConfig.completedCollapsed
      })
    } else {
      setNewViewTodoConfig({ checkboxFieldId: '', showCompleted: true, completedCollapsed: false })
    }
    if (view.myDayConfig) {
      setNewViewMyDayConfig({
        dateFieldId: view.myDayConfig.dateFieldId,
        streakFieldId: view.myDayConfig.streakFieldId
      })
    } else {
      setNewViewMyDayConfig({ dateFieldId: '', streakFieldId: '' })
    }
    if (view.galleryConfig) {
      setNewViewGalleryConfig({
        imageFieldId: view.galleryConfig.imageFieldId
      })
    } else {
      setNewViewGalleryConfig({ imageFieldId: '' })
    }
    setViewModalOpen(true)
  }

  const handleSaveView = async () => {
    if (!newViewName.trim()) return
    if (newViewType === 'cards' && (!newViewCardsConfig.sourceDatabaseId || !newViewCardsConfig.groupByFieldId)) {
      alert('Please configure the cards view')
      return
    }
    if (newViewType === 'todo' && !newViewTodoConfig.checkboxFieldId) {
      alert('Please select a checkbox field for the todo view')
      return
    }
    if (newViewType === 'myday' && (!newViewMyDayConfig.dateFieldId || !newViewMyDayConfig.streakFieldId)) {
      alert('Please select both date and streak fields for My Day view')
      return
    }
    if (newViewType === 'gallery' && !newViewGalleryConfig.imageFieldId) {
      alert('Please select an image field for the gallery view')
      return
    }

    try {
      if (editingView) {
        // Update existing view
        await databasesApi.updateView(id, editingView.id, {
          name: newViewName,
          type: newViewType,
          cardsConfig: newViewType === 'cards' ? newViewCardsConfig : undefined,
          todoConfig: newViewType === 'todo' ? newViewTodoConfig : undefined,
          myDayConfig: newViewType === 'myday' ? newViewMyDayConfig : undefined,
          galleryConfig: newViewType === 'gallery' ? newViewGalleryConfig : undefined
        })
      } else {
        // Add new view
        const res = await databasesApi.addView(id, {
          name: newViewName,
          type: newViewType,
          visibleFields: database?.fields.map(f => f.id) || [],
          cardsConfig: newViewType === 'cards' ? newViewCardsConfig : undefined,
          todoConfig: newViewType === 'todo' ? newViewTodoConfig : undefined,
          myDayConfig: newViewType === 'myday' ? newViewMyDayConfig : undefined,
          galleryConfig: newViewType === 'gallery' ? newViewGalleryConfig : undefined
        })
        if (res.data) {
          setActiveViewId(res.data.id)
        }
      }
      await refreshDatabase()
      setViewModalOpen(false)
      resetViewForm()
    } catch (error) {
      console.error('Failed to save view:', error)
    }
  }

  const handleDeleteView = async (viewId: string) => {
    if (!database || database.views.length <= 1) return
    if (!confirm('Delete this view?')) return
    try {
      await databasesApi.deleteView(id, viewId)
      await refreshDatabase()
      if (activeViewId === viewId) {
        setActiveViewId(database.views.find(v => v.id !== viewId)?.id || null)
      }
    } catch (error) {
      console.error('Failed to delete view:', error)
    }
  }

  // Filter management
  const handleAddFilter = async (fieldId: string) => {
    if (!activeView) return
    const field = database?.fields.find(f => f.id === fieldId)
    if (!field) return

    const defaultOp = FILTER_OPERATORS[field.type][0].value
    const newFilter: FilterCondition = {
      fieldId,
      operator: defaultOp as FilterCondition['operator'],
      value: field.type === 'checkbox' ? true : ''
    }

    try {
      await databasesApi.updateView(id, activeView.id, {
        filters: [...activeView.filters, newFilter]
      })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to add filter:', error)
    }
  }

  const handleUpdateFilter = async (index: number, updates: Partial<FilterCondition>) => {
    if (!activeView) return
    const newFilters = [...activeView.filters]
    newFilters[index] = { ...newFilters[index], ...updates }

    try {
      await databasesApi.updateView(id, activeView.id, { filters: newFilters })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to update filter:', error)
    }
  }

  const handleRemoveFilter = async (index: number) => {
    if (!activeView) return
    const newFilters = activeView.filters.filter((_, i) => i !== index)

    try {
      await databasesApi.updateView(id, activeView.id, { filters: newFilters })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to remove filter:', error)
    }
  }

  // Sort management
  const handleAddSort = async (fieldId: string) => {
    if (!activeView) return
    const newSort: SortCondition = { fieldId, direction: 'asc' }

    try {
      await databasesApi.updateView(id, activeView.id, {
        sorts: [...activeView.sorts, newSort]
      })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to add sort:', error)
    }
  }

  const handleRemoveSort = async (index: number) => {
    if (!activeView) return
    const newSorts = activeView.sorts.filter((_, i) => i !== index)

    try {
      await databasesApi.updateView(id, activeView.id, { sorts: newSorts })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to remove sort:', error)
    }
  }

  const handleToggleSortDirection = async (index: number) => {
    if (!activeView) return
    const newSorts = [...activeView.sorts]
    newSorts[index] = {
      ...newSorts[index],
      direction: newSorts[index].direction === 'asc' ? 'desc' : 'asc'
    }

    try {
      await databasesApi.updateView(id, activeView.id, { sorts: newSorts })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to toggle sort:', error)
    }
  }

  // Field management

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field? All data in this column will be lost.')) return
    try {
      await databasesApi.deleteField(id, fieldId)
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to delete field:', error)
    }
  }

  const openEditField = (field: Field) => {
    setEditingField(field)
    setNewField({
      name: field.name,
      type: field.type,
      options: field.options || [],
      relationConfig: field.relationConfig
    })
    setFieldModalOpen(true)
  }

  const openNewField = () => {
    setEditingField(null)
    setNewField({ name: '', type: 'text', options: [] })
    setFieldModalOpen(true)
  }

  const handleSaveField = async () => {
    if (!newField.name.trim()) return
    if (newField.type === 'relation' && !newField.relationConfig?.databaseId) {
      alert('Please select a related database')
      return
    }

    try {
      if (editingField) {
        // Update existing field
        await databasesApi.updateField(id, editingField.id, {
          name: newField.name,
          type: newField.type,
          options: newField.type === 'select' || newField.type === 'multiselect' ? newField.options : undefined,
          relationConfig: newField.type === 'relation' ? newField.relationConfig : undefined
        })
      } else {
        // Add new field
        await databasesApi.addField(id, {
          name: newField.name,
          type: newField.type,
          options: newField.type === 'select' || newField.type === 'multiselect' ? newField.options : undefined,
          relationConfig: newField.type === 'relation' ? newField.relationConfig : undefined
        })
      }
      await refreshDatabase()
      setFieldModalOpen(false)
      setEditingField(null)
      setNewField({ name: '', type: 'text', options: [] })
    } catch (error) {
      console.error('Failed to save field:', error)
    }
  }

  // Record management
  const openNewRecord = () => {
    setActiveCellDropdown(null)
    setEditingRecord(null)
    setRecordValues({})
    setRecordModalOpen(true)
  }

  const openEditRecord = (record: DatabaseRecord) => {
    setActiveCellDropdown(null)
    setEditingRecord(record)
    setRecordValues(record.values)
    setRecordModalOpen(true)
  }

  const handleSaveRecord = async () => {
    try {
      if (editingRecord) {
        await databasesApi.updateRecord(id, editingRecord.id, recordValues)
      } else {
        await databasesApi.addRecord(id, recordValues)
      }
      await refreshDatabase()
      setRecordModalOpen(false)
    } catch (error) {
      console.error('Failed to save record:', error)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Delete this record?')) return
    try {
      await databasesApi.deleteRecord(id, recordId)
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  // Drag and drop reordering
  const canDragRecords = activeView?.sorts.length === 0

  const handleDragStart = (e: React.DragEvent, recordId: string) => {
    if (!canDragRecords) return
    setDraggedRecordId(recordId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', recordId)
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedRecordId(null)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!canDragRecords || !draggedRecordId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, targetRecordId: string) => {
    e.preventDefault()
    if (!canDragRecords || !draggedRecordId || draggedRecordId === targetRecordId) {
      setDraggedRecordId(null)
      return
    }

    // Get current order of filtered records
    const currentOrder = filteredRecords.map(r => r.id)
    const draggedIndex = currentOrder.indexOf(draggedRecordId)
    const targetIndex = currentOrder.indexOf(targetRecordId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedRecordId(null)
      return
    }

    // Remove dragged item and insert at target position
    currentOrder.splice(draggedIndex, 1)
    currentOrder.splice(targetIndex, 0, draggedRecordId)

    // Update server with new order
    try {
      await databasesApi.reorderRecords(id, currentOrder)
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to reorder records:', error)
    }

    setDraggedRecordId(null)
  }

  // Inline cell editing
  const handleCellChange = useCallback(async (recordId: string, fieldId: string, value: unknown) => {
    try {
      await databasesApi.updateRecord(id, recordId, { [fieldId]: value })
      await refreshDatabase()
    } catch (error) {
      console.error('Failed to update cell:', error)
    }
  }, [id, refreshDatabase])

  // Inline cell dropdown for select/multiselect
  const openCellDropdown = useCallback((
    e: React.MouseEvent<HTMLElement>,
    recordId: string,
    fieldId: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setActiveCellDropdown({ recordId, fieldId, rect })
  }, [])

  // Close cell dropdown on click outside, Escape, or scroll
  useEffect(() => {
    if (!activeCellDropdown) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-cell-dropdown]')) {
        setActiveCellDropdown(null)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveCellDropdown(null)
    }

    const handleScroll = () => setActiveCellDropdown(null)

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    // Close on any scroll (table container or window)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [activeCellDropdown])

  // Cell dropdown portal for inline select/multiselect editing
  const cellDropdown = useMemo(() => {
    if (!activeCellDropdown || !database) return null

    const field = database.fields.find(f => f.id === activeCellDropdown.fieldId)
    if (!field || !field.options || (field.type !== 'select' && field.type !== 'multiselect')) return null

    const record = database.records.find(r => r.id === activeCellDropdown.recordId)
    if (!record) return null

    const currentValue = record.values[field.id]
    const { rect } = activeCellDropdown

    // Position: below cell, flip above if insufficient space
    const dropdownMaxHeight = 240
    const spaceBelow = window.innerHeight - rect.bottom
    const showAbove = spaceBelow < dropdownMaxHeight && rect.top > spaceBelow

    const positionStyle: React.CSSProperties = {
      position: 'fixed',
      left: `${rect.left}px`,
      ...(showAbove
        ? { bottom: `${window.innerHeight - rect.top + 4}px` }
        : { top: `${rect.bottom + 4}px` }),
      zIndex: 9999,
      minWidth: `${Math.max(rect.width, 180)}px`,
      maxHeight: `${dropdownMaxHeight}px`,
    }

    if (field.type === 'select') {
      return createPortal(
        <div
          data-cell-dropdown
          className="bg-surface border border-border-default rounded-lg shadow-lg overflow-y-auto"
          style={positionStyle}
        >
          {/* None option to clear */}
          <button
            type="button"
            className={cn(
              'w-full px-3 py-2 text-left text-sm transition-colors',
              'hover:bg-hover',
              !currentValue && 'bg-elevated'
            )}
            onClick={() => {
              handleCellChange(activeCellDropdown.recordId, field.id, undefined)
              setActiveCellDropdown(null)
            }}
          >
            <span className="text-tertiary italic">None</span>
          </button>
          {field.options.map(opt => {
            const isSelected = currentValue === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                  'hover:bg-hover',
                  isSelected && 'bg-elevated'
                )}
                onClick={() => {
                  handleCellChange(activeCellDropdown.recordId, field.id, opt.id)
                  setActiveCellDropdown(null)
                }}
              >
                <Badge variant="custom" customColor={opt.color} className="text-xs">
                  {opt.label}
                </Badge>
                {isSelected && (
                  <Icon name="check" size={14} className="ml-auto text-interactive" />
                )}
              </button>
            )
          })}
        </div>,
        document.body
      )
    }

    if (field.type === 'multiselect') {
      const selectedIds: string[] = Array.isArray(currentValue) ? currentValue : []
      return createPortal(
        <div
          data-cell-dropdown
          className="bg-surface border border-border-default rounded-lg shadow-lg overflow-y-auto"
          style={positionStyle}
        >
          {field.options.map(opt => {
            const isSelected = selectedIds.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                  'hover:bg-hover',
                  isSelected && 'bg-elevated'
                )}
                onClick={() => {
                  const newSelected = isSelected
                    ? selectedIds.filter(sid => sid !== opt.id)
                    : [...selectedIds, opt.id]
                  handleCellChange(activeCellDropdown.recordId, field.id, newSelected)
                }}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected ? 'border-transparent' : 'border-border-default'
                  )}
                  style={isSelected ? { backgroundColor: opt.color } : undefined}
                >
                  {isSelected && (
                    <Icon name="check" size={10} weight="bold" className="text-white" />
                  )}
                </div>
                <Badge variant="custom" customColor={opt.color} className="text-xs">
                  {opt.label}
                </Badge>
              </button>
            )
          })}
        </div>,
        document.body
      )
    }

    return null
  }, [activeCellDropdown, database, handleCellChange])

  // Render cell value
  const renderCellValue = (field: Field, value: unknown, recordId: string) => {
    switch (field.type) {
      case 'checkbox':
        return (
          <Checkbox
            checked={!!value}
            onChange={e => handleCellChange(recordId, field.id, e.target.checked)}
          />
        )
      case 'select': {
        const option = field.options?.find(o => o.id === value)
        return (
          <button
            type="button"
            data-cell-dropdown
            className="cursor-pointer rounded px-1 py-0.5 -mx-1 -my-0.5 hover:bg-hover transition-colors"
            onClick={(e) => openCellDropdown(e, recordId, field.id)}
          >
            {option ? (
              <Badge variant="custom" customColor={option.color} className="text-xs">
                {option.label}
              </Badge>
            ) : (
              <span className="text-tertiary">-</span>
            )}
          </button>
        )
      }
      case 'multiselect': {
        const selectedIds = Array.isArray(value) ? value : []
        const selectedOptions = field.options?.filter(o => selectedIds.includes(o.id)) || []
        return (
          <button
            type="button"
            data-cell-dropdown
            className="cursor-pointer rounded px-1 py-0.5 -mx-1 -my-0.5 hover:bg-hover transition-colors text-left"
            onClick={(e) => openCellDropdown(e, recordId, field.id)}
          >
            {selectedOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {selectedOptions.map(opt => (
                  <Badge key={opt.id} variant="custom" customColor={opt.color} className="text-xs">
                    {opt.label}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-tertiary">-</span>
            )}
          </button>
        )
      }
      case 'url':
        return value ? (
          <a
            href={String(value)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-interactive hover:underline truncate block max-w-48"
          >
            {String(value)}
          </a>
        ) : <span className="text-tertiary">-</span>
      case 'email':
        return value ? (
          <a href={`mailto:${value}`} className="text-interactive hover:underline">
            {String(value)}
          </a>
        ) : <span className="text-tertiary">-</span>
      case 'date':
        return value ? (
          <span>{new Date(String(value)).toLocaleDateString()}</span>
        ) : <span className="text-tertiary">-</span>
      case 'number':
        return <span>{value !== undefined && value !== null ? String(value) : '-'}</span>
      case 'relation':
        if (!field.relationConfig) return <span className="text-tertiary">-</span>
        const targetDb = allDatabases.find(db => db.id === field.relationConfig?.databaseId)
        if (!targetDb) return <span className="text-tertiary">-</span>

        // Get display name for related record(s)
        const getRecordDisplayName = (recId: string) => {
          const rec = targetDb.records.find(r => r.id === recId)
          if (!rec) return null
          // Try to find a "name" field, or use first text field
          const nameField = targetDb.fields.find(f => f.name.toLowerCase() === 'name')
          if (nameField && rec.values[nameField.id]) {
            return String(rec.values[nameField.id])
          }
          const firstTextField = targetDb.fields.find(f => f.type === 'text')
          if (firstTextField && rec.values[firstTextField.id]) {
            return String(rec.values[firstTextField.id])
          }
          return `Record ${recId.slice(0, 6)}`
        }

        if (field.relationConfig.multiple) {
          const relIds = Array.isArray(value) ? value : []
          return relIds.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {relIds.map((relId: string) => {
                const displayName = getRecordDisplayName(relId)
                return displayName ? (
                  <Badge key={relId} variant="default" className="text-xs">
                    {displayName}
                  </Badge>
                ) : null
              })}
            </div>
          ) : <span className="text-tertiary">-</span>
        } else {
          const displayName = value ? getRecordDisplayName(String(value)) : null
          return displayName ? (
            <Badge variant="default" className="text-xs">{displayName}</Badge>
          ) : <span className="text-tertiary">-</span>
        }
      default:
        return <span className="truncate max-w-48 block">{value ? String(value) : '-'}</span>
    }
  }

  // Render field input for forms
  const renderFieldInput = (field: Field, value: unknown, onChange: (v: unknown) => void) => {
    switch (field.type) {
      case 'checkbox':
        return (
          <Checkbox
            label={field.name}
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
        )
      case 'select':
        return (
          <Select
            label={field.name}
            value={String(value || '')}
            onChange={e => onChange(e.target.value || undefined)}
            options={[
              { value: '', label: 'Select...' },
              ...(field.options?.map(o => ({ value: o.id, label: o.label })) || [])
            ]}
          />
        )
      case 'multiselect':
        const selected = Array.isArray(value) ? value : []
        return (
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">{field.name}</label>
            <div className="flex flex-wrap gap-2">
              {field.options?.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    const newSelected = selected.includes(opt.id)
                      ? selected.filter(id => id !== opt.id)
                      : [...selected, opt.id]
                    onChange(newSelected)
                  }}
                  className={cn(
                    'px-3 py-1 rounded-full text-sm border transition-colors',
                    selected.includes(opt.id)
                      ? 'border-transparent text-on-inverted'
                      : 'border-default text-tertiary hover:border-hover'
                  )}
                  style={selected.includes(opt.id) ? { backgroundColor: opt.color } : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )
      case 'date':
        return (
          <Input
            label={field.name}
            type="date"
            value={value ? String(value).split('T')[0] : ''}
            onChange={e => onChange(e.target.value || undefined)}
          />
        )
      case 'number':
        return (
          <Input
            label={field.name}
            type="number"
            value={value !== undefined ? String(value) : ''}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
          />
        )
      case 'url':
        return (
          <Input
            label={field.name}
            type="url"
            value={String(value || '')}
            onChange={e => onChange(e.target.value || undefined)}
            placeholder="https://..."
          />
        )
      case 'email':
        return (
          <Input
            label={field.name}
            type="email"
            value={String(value || '')}
            onChange={e => onChange(e.target.value || undefined)}
            placeholder="email@example.com"
          />
        )
      case 'relation':
        if (!field.relationConfig) return null
        const targetDatabase = allDatabases.find(db => db.id === field.relationConfig?.databaseId)
        if (!targetDatabase) return <div className="text-tertiary text-sm">Target database not found</div>

        // Get display name for a record
        const getDisplayName = (rec: DatabaseRecord) => {
          const nameField = targetDatabase.fields.find(f => f.name.toLowerCase() === 'name')
          if (nameField && rec.values[nameField.id]) {
            return String(rec.values[nameField.id])
          }
          const firstTextField = targetDatabase.fields.find(f => f.type === 'text')
          if (firstTextField && rec.values[firstTextField.id]) {
            return String(rec.values[firstTextField.id])
          }
          return `Record ${rec.id.slice(0, 6)}`
        }

        if (field.relationConfig.multiple) {
          const selectedRelIds = Array.isArray(value) ? value as string[] : []
          return (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">{field.name}</label>
              <div className="flex flex-wrap gap-2">
                {targetDatabase.records.map(rec => {
                  const isSelected = selectedRelIds.includes(rec.id)
                  return (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => {
                        const newSelected = isSelected
                          ? selectedRelIds.filter(rid => rid !== rec.id)
                          : [...selectedRelIds, rec.id]
                        onChange(newSelected)
                      }}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm border transition-colors',
                        isSelected
                          ? 'bg-inverted border-inverted text-on-inverted'
                          : 'border-default text-tertiary hover:border-hover'
                      )}
                    >
                      {getDisplayName(rec)}
                    </button>
                  )
                })}
              </div>
              {targetDatabase.records.length === 0 && (
                <p className="text-sm text-tertiary mt-1">No records in {targetDatabase.name}</p>
              )}
            </div>
          )
        } else {
          return (
            <Select
              label={field.name}
              value={String(value || '')}
              onChange={e => onChange(e.target.value || undefined)}
              options={[
                { value: '', label: 'Select...' },
                ...targetDatabase.records.map(rec => ({
                  value: rec.id,
                  label: getDisplayName(rec)
                }))
              ]}
            />
          )
        }
      default:
        return (
          <Input
            label={field.name}
            value={String(value || '')}
            onChange={e => onChange(e.target.value || undefined)}
          />
        )
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-tertiary">Loading...</div>
  }

  if (!database) {
    return null
  }

  const visibleFields = activeView
    ? database.fields.filter(f => activeView.visibleFields.includes(f.id))
    : database.fields

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-elevated rounded-lg">
          <Icon name="arrow-left" size={20} />
        </button>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={customColorBg(database.color)}
        >
          <Icon name={database.icon} size={24} color={database.color} weight="fill" />
        </div>
        <div>
          <h1 className="font-display text-xl text-primary">{database.name}</h1>
          {database.description && (
            <p className="text-sm text-tertiary">{database.description}</p>
          )}
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default">
        {database.views.map(view => (
          <button
            key={view.id}
            onClick={() => setActiveViewId(view.id)}
            className={cn(
              'group px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2',
              activeViewId === view.id
                ? 'border-primary text-primary'
                : 'border-transparent text-tertiary hover:text-secondary'
            )}
          >
            <Icon name={view.type === 'table' ? 'list' : view.type === 'cards' ? 'layers' : view.type === 'todo' ? 'check-square' : view.type === 'myday' ? 'sun' : view.type === 'gallery' ? 'grid' : 'rows'} size={16} />
            {view.name}
            <span className="hidden group-hover:inline-flex items-center gap-1 ml-1">
              <span
                onClick={(e) => { e.stopPropagation(); openEditView(view) }}
                className="p-0.5 hover:bg-elevated hover:text-primary rounded transition-all cursor-pointer"
                title="Edit view"
              >
                <Icon name="edit" size={12} />
              </span>
              {database.views.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleDeleteView(view.id) }}
                  className="p-0.5 hover:bg-error-subtle hover:text-error rounded transition-all cursor-pointer"
                  title="Delete view"
                >
                  <Icon name="close" size={12} />
                </span>
              )}
            </span>
          </button>
        ))}
        <button
          onClick={openNewView}
          className="px-3 py-2 text-sm text-tertiary hover:text-secondary"
        >
          <Icon name="plus" size={16} />
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter Button */}
        <div className="relative">
          <Button
            variant={activeView?.filters.length ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterModalOpen(!filterModalOpen)}
          >
            <Icon name="filter" size={16} />
            Filter
            {activeView?.filters.length ? (
              <Badge variant="info" className="ml-1 text-xs">{activeView.filters.length}</Badge>
            ) : null}
          </Button>
        </div>

        {/* Sort Button */}
        <div className="relative">
          <Button
            variant={activeView?.sorts.length ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortModalOpen(!sortModalOpen)}
          >
            <Icon name="sort-ascending" size={16} />
            Sort
            {activeView?.sorts.length ? (
              <Badge variant="info" className="ml-1 text-xs">{activeView.sorts.length}</Badge>
            ) : null}
          </Button>
        </div>

        <div className="flex-1" />

        {/* Manage Fields */}
        {database.fields.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setFieldsManagerOpen(true)}>
            <Icon name="settings" size={16} />
            Fields ({database.fields.length})
          </Button>
        )}

        {/* Add Field */}
        <Button variant="ghost" size="sm" onClick={openNewField}>
          <Icon name="plus" size={16} />
          Add Field
        </Button>

        {/* TMDB Import (only for Movies databases) */}
        {isMoviesDb && (
          <Button variant="secondary" size="sm" onClick={() => setTmdbModalOpen(true)}>
            <Icon name="search" size={16} />
            TMDB
          </Button>
        )}

        {/* TMDB Backfill (only when records need updating) */}
        {isMoviesDb && recordsNeedingBackfill.length > 0 && (
          <Button variant="secondary" size="sm" onClick={handleBackfill} disabled={backfilling}>
            <Icon name="lightning" size={16} className={backfilling ? 'animate-pulse' : ''} />
            {backfilling
              ? `${backfillProgress.current}/${backfillProgress.total}`
              : `Backfill (${recordsNeedingBackfill.length})`
            }
          </Button>
        )}

        {/* Add Record */}
        <Button size="sm" onClick={openNewRecord}>
          <Icon name="plus" size={16} />
          New
        </Button>
      </div>

      {/* Active Filters Display */}
      {activeView && activeView.filters.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-elevated rounded-lg">
          {activeView.filters.map((filter, index) => {
            const field = database.fields.find(f => f.id === filter.fieldId)
            if (!field) return null
            return (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-base rounded-lg text-sm">
                <span className="text-secondary">{field.name}</span>
                <Select
                  value={filter.operator}
                  onChange={e => handleUpdateFilter(index, { operator: e.target.value as FilterCondition['operator'] })}
                  options={FILTER_OPERATORS[field.type]}
                  size="sm"
                />
                {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                  field.type === 'select' ? (
                    <Select
                      value={String(filter.value || '')}
                      onChange={e => handleUpdateFilter(index, { value: e.target.value })}
                      options={[
                        { value: '', label: 'Select...' },
                        ...(field.options?.map(o => ({ value: o.id, label: o.label })) || [])
                      ]}
                      size="sm"
                    />
                  ) : field.type === 'checkbox' ? (
                    <Select
                      value={filter.value === true ? 'true' : 'false'}
                      onChange={e => handleUpdateFilter(index, { value: e.target.value === 'true' })}
                      options={[
                        { value: 'true', label: 'Checked' },
                        { value: 'false', label: 'Unchecked' },
                      ]}
                      size="sm"
                    />
                  ) : (
                    <Input
                      value={String(filter.value || '')}
                      onChange={e => handleUpdateFilter(index, { value: e.target.value })}
                      placeholder="Value..."
                      size="sm"
                      className="w-24"
                    />
                  )
                )}
                <button onClick={() => handleRemoveFilter(index)} className="p-1 hover:bg-elevated rounded">
                  <Icon name="close" size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Active Sorts Display */}
      {activeView && activeView.sorts.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-elevated rounded-lg">
          {activeView.sorts.map((sort, index) => {
            const field = database.fields.find(f => f.id === sort.fieldId)
            if (!field) return null
            return (
              <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-base rounded-lg text-sm">
                <span className="text-secondary">{field.name}</span>
                <button
                  onClick={() => handleToggleSortDirection(index)}
                  className="p-1 hover:bg-elevated rounded"
                >
                  <Icon name={sort.direction === 'asc' ? 'sort-ascending' : 'sort-descending'} size={14} />
                </button>
                <button onClick={() => handleRemoveSort(index)} className="p-1 hover:bg-elevated rounded">
                  <Icon name="close" size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Table View */}
      {(activeView?.type === 'table' || !activeView?.type) && (
        <TableView
          database={database}
          allDatabases={allDatabases}
          activeView={activeView!}
          filteredRecords={filteredRecords}
          databaseId={id}
          canDragRecords={canDragRecords}
          draggedRecordId={draggedRecordId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onOpenEditRecord={openEditRecord}
          onOpenNewRecord={openNewRecord}
          onDeleteRecord={handleDeleteRecord}
          onRefreshDatabase={refreshDatabase}
          visibleFields={visibleFields}
          fieldTypeIcons={FIELD_TYPE_ICONS}
          renderCellValue={renderCellValue}
          onDeleteField={handleDeleteField}
          onNavigateToRecord={(recordId) => router.push(ROUTES.admin.cortexRecord(id, recordId))}
        />
      )}

      {/* Cards View */}
      {activeView?.type === 'cards' && activeView.cardsConfig && (
        <CardsView
          database={database}
          allDatabases={allDatabases}
          activeView={activeView!}
          filteredRecords={filteredRecords}
          databaseId={id}
          canDragRecords={canDragRecords}
          draggedRecordId={draggedRecordId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onOpenEditRecord={openEditRecord}
          onOpenNewRecord={openNewRecord}
          onDeleteRecord={handleDeleteRecord}
          onRefreshDatabase={refreshDatabase}
          onNavigateToSourceRecord={(dbId, recordId) => router.push(ROUTES.admin.cortexRecord(dbId, recordId))}
        />
      )}


      {/* Todo View */}
      {activeView?.type === 'todo' && activeView.todoConfig && (
        <TodoView
          database={database}
          allDatabases={allDatabases}
          activeView={activeView!}
          filteredRecords={filteredRecords}
          databaseId={id}
          canDragRecords={canDragRecords}
          draggedRecordId={draggedRecordId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onOpenEditRecord={openEditRecord}
          onOpenNewRecord={openNewRecord}
          onDeleteRecord={handleDeleteRecord}
          onRefreshDatabase={refreshDatabase}
          onNavigateToRecord={(recordId) => router.push(ROUTES.admin.cortexRecord(id, recordId))}
        />
      )}

      {/* My Day View */}
      {activeView?.type === 'myday' && activeView.myDayConfig && (
        <MyDayView
          database={database}
          allDatabases={allDatabases}
          activeView={activeView!}
          filteredRecords={filteredRecords}
          databaseId={id}
          canDragRecords={canDragRecords}
          draggedRecordId={draggedRecordId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onOpenEditRecord={openEditRecord}
          onOpenNewRecord={openNewRecord}
          onDeleteRecord={handleDeleteRecord}
          onRefreshDatabase={refreshDatabase}
          onNavigateToRecord={(recordId) => router.push(ROUTES.admin.cortexRecord(id, recordId))}
        />
      )}

      {/* Gallery View */}
      {activeView?.type === 'gallery' && activeView.galleryConfig && (
        <GalleryView
          database={database}
          allDatabases={allDatabases}
          activeView={activeView!}
          filteredRecords={filteredRecords}
          databaseId={id}
          canDragRecords={canDragRecords}
          draggedRecordId={draggedRecordId}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onOpenEditRecord={openEditRecord}
          onOpenNewRecord={openNewRecord}
          onDeleteRecord={handleDeleteRecord}
          onRefreshDatabase={refreshDatabase}
        />
      )}


      {/* Add/Edit View Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false)
          resetViewForm()
        }}
        title={editingView ? 'Edit View' : 'Add View'}
      >
        <div className="space-y-4">
          <Input
            label="View Name"
            value={newViewName}
            onChange={e => setNewViewName(e.target.value)}
            placeholder="e.g., Active Items, Task Board"
          />

          <Select
            label="View Type"
            value={newViewType}
            onChange={e => setNewViewType(e.target.value as 'table' | 'cards' | 'todo' | 'myday' | 'gallery')}
            options={[
              { value: 'table', label: 'Table' },
              { value: 'cards', label: 'Cards' },
              { value: 'todo', label: 'Todo' },
              { value: 'myday', label: 'My Day' },
              { value: 'gallery', label: 'Gallery' },
            ]}
          />

          {/* Cards Configuration */}
          {newViewType === 'cards' && (
            <div className="space-y-3 p-3 bg-elevated rounded-lg">
              <p className="text-sm text-tertiary">
                Cards view shows records from another database, grouped by their relation to this database.
              </p>
              <Select
                label="Source Database"
                value={newViewCardsConfig.sourceDatabaseId}
                onChange={e => setNewViewCardsConfig(prev => ({
                  ...prev,
                  sourceDatabaseId: e.target.value,
                  groupByFieldId: '' // Reset when database changes
                }))}
                options={[
                  { value: '', label: 'Select a database...' },
                  ...otherDatabases
                ]}
              />

              {newViewCardsConfig.sourceDatabaseId && (() => {
                const sourceDb = allDatabases.find(db => db.id === newViewCardsConfig.sourceDatabaseId)
                const relationFields = sourceDb?.fields.filter(f =>
                  f.type === 'relation' && f.relationConfig?.databaseId === id
                ) || []

                return relationFields.length > 0 ? (
                  <Select
                    label="Group By Field"
                    value={newViewCardsConfig.groupByFieldId}
                    onChange={e => setNewViewCardsConfig(prev => ({ ...prev, groupByFieldId: e.target.value }))}
                    options={[
                      { value: '', label: 'Select a relation field...' },
                      ...relationFields.map(f => ({ value: f.id, label: f.name }))
                    ]}
                  />
                ) : (
                  <p className="text-sm text-warning">
                    No relation fields found in {sourceDb?.name} that link to this database.
                    Add a relation field first.
                  </p>
                )
              })()}
            </div>
          )}

          {/* Todo Configuration */}
          {newViewType === 'todo' && (() => {
            const checkboxFields = database?.fields.filter(f => f.type === 'checkbox') || []

            if (checkboxFields.length === 0) {
              return (
                <div className="p-3 bg-elevated rounded-lg">
                  <p className="text-sm text-warning">
                    Todo view requires a checkbox field. Add a checkbox field first.
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-3 p-3 bg-elevated rounded-lg">
                <p className="text-sm text-tertiary">
                  Todo view displays records as a checklist with completed items at the bottom.
                </p>
                <Select
                  label="Checkbox Field"
                  value={newViewTodoConfig.checkboxFieldId}
                  onChange={e => setNewViewTodoConfig(prev => ({ ...prev, checkboxFieldId: e.target.value }))}
                  options={[
                    { value: '', label: 'Select a checkbox field...' },
                    ...checkboxFields.map(f => ({ value: f.id, label: f.name }))
                  ]}
                />
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={newViewTodoConfig.showCompleted}
                    onChange={e => setNewViewTodoConfig(prev => ({ ...prev, showCompleted: e.target.checked }))}
                  />
                  <span className="text-sm text-primary">Show completed items</span>
                </div>
                {newViewTodoConfig.showCompleted && (
                  <div className="flex items-center gap-3 ml-6">
                    <Checkbox
                      checked={newViewTodoConfig.completedCollapsed}
                      onChange={e => setNewViewTodoConfig(prev => ({ ...prev, completedCollapsed: e.target.checked }))}
                    />
                    <span className="text-sm text-primary">Collapse completed by default</span>
                  </div>
                )}
              </div>
            )
          })()}

          {/* My Day Configuration */}
          {newViewType === 'myday' && (() => {
            const dateFields = database?.fields.filter(f => f.type === 'date') || []
            const numberFields = database?.fields.filter(f => f.type === 'number') || []

            if (dateFields.length === 0 || numberFields.length === 0) {
              return (
                <div className="p-3 bg-elevated rounded-lg">
                  <p className="text-sm text-warning">
                    My Day view requires a date field (for last completed) and a number field (for streak).
                    {dateFields.length === 0 && ' Add a date field.'}
                    {numberFields.length === 0 && ' Add a number field.'}
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-3 p-3 bg-elevated rounded-lg">
                <p className="text-sm text-tertiary">
                  My Day tracks daily habits with automatic reset and streak counting. Complete all tasks each day to build your streak!
                </p>
                <Select
                  label="Last Completed Field (Date)"
                  value={newViewMyDayConfig.dateFieldId}
                  onChange={e => setNewViewMyDayConfig(prev => ({ ...prev, dateFieldId: e.target.value }))}
                  options={[
                    { value: '', label: 'Select a date field...' },
                    ...dateFields.map(f => ({ value: f.id, label: f.name }))
                  ]}
                />
                <Select
                  label="Streak Field (Number)"
                  value={newViewMyDayConfig.streakFieldId}
                  onChange={e => setNewViewMyDayConfig(prev => ({ ...prev, streakFieldId: e.target.value }))}
                  options={[
                    { value: '', label: 'Select a number field...' },
                    ...numberFields.map(f => ({ value: f.id, label: f.name }))
                  ]}
                />
              </div>
            )
          })()}

          {/* Gallery Configuration */}
          {newViewType === 'gallery' && (() => {
            const urlFields = database?.fields.filter(f => f.type === 'url') || []

            if (urlFields.length === 0) {
              return (
                <div className="p-3 bg-elevated rounded-lg">
                  <p className="text-sm text-warning">
                    Gallery view requires a URL field for images. Add a URL field first.
                  </p>
                </div>
              )
            }

            return (
              <div className="space-y-3 p-3 bg-elevated rounded-lg">
                <p className="text-sm text-tertiary">
                  Gallery displays records as a visual grid of images, like Netflix posters.
                </p>
                <Select
                  label="Image Field (URL)"
                  value={newViewGalleryConfig.imageFieldId}
                  onChange={e => setNewViewGalleryConfig(prev => ({ ...prev, imageFieldId: e.target.value }))}
                  options={[
                    { value: '', label: 'Select a URL field...' },
                    ...urlFields.map(f => ({ value: f.id, label: f.name }))
                  ]}
                />
              </div>
            )
          })()}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => {
              setViewModalOpen(false)
              resetViewForm()
            }} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveView} className="flex-1">
              {editingView ? 'Save Changes' : 'Add View'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Filter Modal */}
      <Modal open={filterModalOpen} onClose={() => setFilterModalOpen(false)} title="Add Filter">
        <div className="space-y-2">
          {database.fields.map(field => (
            <button
              key={field.id}
              onClick={() => { handleAddFilter(field.id); setFilterModalOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated rounded-lg text-left transition-colors"
            >
              <Icon name={FIELD_TYPE_ICONS[field.type]} size={18} className="text-tertiary" />
              <span>{field.name}</span>
              <span className="text-xs text-tertiary ml-auto">{field.type}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Sort Modal */}
      <Modal open={sortModalOpen} onClose={() => setSortModalOpen(false)} title="Add Sort">
        <div className="space-y-2">
          {database.fields.map(field => (
            <button
              key={field.id}
              onClick={() => { handleAddSort(field.id); setSortModalOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-elevated rounded-lg text-left transition-colors"
            >
              <Icon name={FIELD_TYPE_ICONS[field.type]} size={18} className="text-tertiary" />
              <span>{field.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Add/Edit Field Modal */}
      <Modal
        open={fieldModalOpen}
        onClose={() => {
          setFieldModalOpen(false)
          setEditingField(null)
          setNewField({ name: '', type: 'text', options: [] })
        }}
        title={editingField ? 'Edit Field' : 'Add Field'}
      >
        <div className="space-y-4">
          <Input
            label="Field Name"
            value={newField.name}
            onChange={e => setNewField(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Status, Due Date, Amount"
          />
          <Select
            label="Field Type"
            value={newField.type}
            onChange={e => setNewField(prev => ({
              ...prev,
              type: e.target.value as FieldType,
              options: prev.type === e.target.value ? prev.options : [],
              relationConfig: e.target.value === 'relation'
                ? prev.relationConfig || { databaseId: '', multiple: false }
                : undefined
            }))}
            options={[
              { value: 'text', label: 'Text' },
              { value: 'number', label: 'Number' },
              { value: 'select', label: 'Select' },
              { value: 'multiselect', label: 'Multi-select' },
              { value: 'date', label: 'Date' },
              { value: 'checkbox', label: 'Checkbox' },
              { value: 'url', label: 'URL' },
              { value: 'email', label: 'Email' },
              { value: 'relation', label: 'Relation' },
            ]}
          />

          {/* Relation configuration */}
          {newField.type === 'relation' && (
            <div className="space-y-3 p-3 bg-elevated rounded-lg">
              <Select
                label="Related Database"
                value={newField.relationConfig?.databaseId || ''}
                onChange={e => setNewField(prev => ({
                  ...prev,
                  relationConfig: {
                    databaseId: e.target.value,
                    multiple: prev.relationConfig?.multiple || false
                  }
                }))}
                options={[
                  { value: '', label: 'Select a database...' },
                  ...otherDatabases
                ]}
              />
              <Checkbox
                label="Allow multiple selections"
                checked={newField.relationConfig?.multiple || false}
                onChange={e => setNewField(prev => ({
                  ...prev,
                  relationConfig: {
                    databaseId: prev.relationConfig?.databaseId || '',
                    multiple: e.target.checked
                  }
                }))}
              />
            </div>
          )}

          {(newField.type === 'select' || newField.type === 'multiselect') && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Options</label>
              <div className="space-y-2">
                {newField.options.map((opt, index) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <div className="relative group">
                      <button
                        type="button"
                        className="w-8 h-8 rounded-lg border border-border-default hover:border-secondary transition-colors"
                        style={{ backgroundColor: opt.color }}
                      />
                      <div className="absolute left-0 top-full mt-1 p-2 bg-surface border border-border-default rounded-lg shadow-lg z-50 hidden group-hover:grid grid-cols-6 gap-1 w-44">
                        {OPTION_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => {
                              const newOptions = [...newField.options]
                              newOptions[index] = { ...opt, color: color.value }
                              setNewField(prev => ({ ...prev, options: newOptions }))
                            }}
                            className={cn(
                              "w-6 h-6 rounded transition-transform hover:scale-110",
                              opt.color === color.value && "ring-2 ring-primary ring-offset-1 ring-offset-surface"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                    <Input
                      value={opt.label}
                      onChange={e => {
                        const newOptions = [...newField.options]
                        newOptions[index] = { ...opt, label: e.target.value }
                        setNewField(prev => ({ ...prev, options: newOptions }))
                      }}
                      placeholder="Option label"
                      className="flex-1"
                    />
                    <button
                      onClick={() => setNewField(prev => ({
                        ...prev,
                        options: prev.options.filter((_, i) => i !== index)
                      }))}
                      className="p-2 hover:bg-elevated rounded"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewField(prev => ({
                    ...prev,
                    options: [...prev.options, {
                      id: generateId(),
                      label: '',
                      color: OPTION_COLORS[prev.options.length % OPTION_COLORS.length].value
                    }]
                  }))}
                >
                  <Icon name="plus" size={16} />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setFieldModalOpen(false)
                setEditingField(null)
                setNewField({ name: '', type: 'text', options: [] })
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveField} className="flex-1">
              {editingField ? 'Save Changes' : 'Add Field'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Record Modal */}
      <Modal
        open={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title={editingRecord ? 'Edit Record' : 'New Record'}
        className="max-w-lg"
      >
        <div className="space-y-4 max-h-screen overflow-y-auto pr-2">
          {database.fields.map(field => (
            <div key={field.id}>
              {renderFieldInput(
                field,
                recordValues[field.id],
                (value) => setRecordValues(prev => ({ ...prev, [field.id]: value }))
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-4 mt-4 border-t border-border-default">
          <Button variant="secondary" onClick={() => setRecordModalOpen(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSaveRecord} className="flex-1">
            {editingRecord ? 'Save Changes' : 'Add Record'}
          </Button>
        </div>
      </Modal>

      {/* Fields Manager Modal */}
      <Modal
        open={fieldsManagerOpen}
        onClose={() => setFieldsManagerOpen(false)}
        title="Manage Fields"
      >
        <div className="space-y-2">
          {database.fields.length === 0 ? (
            <p className="text-tertiary text-center py-4">No fields yet</p>
          ) : (
            database.fields.map(field => (
              <div
                key={field.id}
                className="flex items-center gap-3 px-4 py-3 bg-elevated rounded-lg group"
              >
                <Icon name={FIELD_TYPE_ICONS[field.type]} size={18} className="text-tertiary" />
                <div className="flex-1">
                  <p className="font-medium text-primary">{field.name}</p>
                  <p className="text-xs text-tertiary">
                    {field.type}
                    {field.relationConfig && ` → ${allDatabases.find(db => db.id === field.relationConfig?.databaseId)?.name || 'Unknown'}`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFieldsManagerOpen(false)
                    openEditField(field)
                  }}
                  className="p-2 text-tertiary hover:text-primary hover:bg-base rounded-lg transition-colors"
                  title="Edit field"
                >
                  <Icon name="edit" size={16} />
                </button>
                <button
                  onClick={() => {
                    handleDeleteField(field.id)
                    if (database.fields.length <= 1) {
                      setFieldsManagerOpen(false)
                    }
                  }}
                  className="p-2 text-tertiary hover:text-error hover:bg-error-subtle rounded-lg transition-colors"
                  title="Delete field"
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-3 pt-4 mt-4 border-t border-border-default">
          <Button variant="secondary" onClick={() => setFieldsManagerOpen(false)} className="flex-1">
            Close
          </Button>
          <Button onClick={() => { setFieldsManagerOpen(false); openNewField() }} className="flex-1">
            <Icon name="plus" size={16} />
            Add Field
          </Button>
        </div>
      </Modal>

      {/* TMDB Import Modal */}
      {isMoviesDb && (
        <TMDBImportModal
          open={tmdbModalOpen}
          onClose={() => setTmdbModalOpen(false)}
          database={database}
          onImported={loadData}
        />
      )}

      {/* Inline cell dropdown portal */}
      {cellDropdown}
    </div>
  )
}
