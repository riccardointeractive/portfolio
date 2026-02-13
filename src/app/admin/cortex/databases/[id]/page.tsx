'use client'

import { useState, useEffect, useMemo, useCallback, use } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Card, Button, Modal, Input, Select, Badge, Checkbox,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableActions, TableActionButton,
} from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { TMDBImportModal } from '@/app/admin/cortex/components/ui/TMDBImportModal'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { cn, generateId, customColorBg } from '@/app/admin/cortex/lib/utils'
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
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)
  const [todoCompletedCollapsed, setTodoCompletedCollapsed] = useState(false)
  const [draggedRecordId, setDraggedRecordId] = useState<string | null>(null)
  const [tmdbModalOpen, setTmdbModalOpen] = useState(false)
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

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [dbRes, allDbRes] = await Promise.all([
        databasesApi.get(id),
        databasesApi.list()
      ])
      if (!dbRes.data) {
        router.push('/admin/cortex/databases')
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
  }

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

  // Sync todo collapsed state with view config when view changes or loads
  useEffect(() => {
    if (activeView?.type === 'todo' && activeView.todoConfig) {
      setTodoCompletedCollapsed(activeView.todoConfig.completedCollapsed)
    }
  }, [activeView])

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
      for (const sort of [...activeView.sorts].reverse()) {
        records.sort((a, b) => {
          const aVal = a.values[sort.fieldId]
          const bVal = b.values[sort.fieldId]

          if (aVal === bVal) return 0
          if (aVal === undefined || aVal === null) return 1
          if (bVal === undefined || bVal === null) return -1

          const comparison = aVal < bVal ? -1 : 1
          return sort.direction === 'asc' ? comparison : -comparison
        })
      }
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
      await loadData()
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
      await loadData()
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
      await loadData()
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
      await loadData()
    } catch (error) {
      console.error('Failed to update filter:', error)
    }
  }

  const handleRemoveFilter = async (index: number) => {
    if (!activeView) return
    const newFilters = activeView.filters.filter((_, i) => i !== index)

    try {
      await databasesApi.updateView(id, activeView.id, { filters: newFilters })
      await loadData()
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
      await loadData()
    } catch (error) {
      console.error('Failed to add sort:', error)
    }
  }

  const handleRemoveSort = async (index: number) => {
    if (!activeView) return
    const newSorts = activeView.sorts.filter((_, i) => i !== index)

    try {
      await databasesApi.updateView(id, activeView.id, { sorts: newSorts })
      await loadData()
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
      await loadData()
    } catch (error) {
      console.error('Failed to toggle sort:', error)
    }
  }

  // Field management

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field? All data in this column will be lost.')) return
    try {
      await databasesApi.deleteField(id, fieldId)
      await loadData()
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
      await loadData()
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
      await loadData()
      setRecordModalOpen(false)
    } catch (error) {
      console.error('Failed to save record:', error)
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Delete this record?')) return
    try {
      await databasesApi.deleteRecord(id, recordId)
      await loadData()
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
      await loadData()
    } catch (error) {
      console.error('Failed to reorder records:', error)
    }

    setDraggedRecordId(null)
  }

  // Inline cell editing
  const handleCellChange = useCallback(async (recordId: string, fieldId: string, value: unknown) => {
    try {
      await databasesApi.updateRecord(id, recordId, { [fieldId]: value })
      await loadData()
    } catch (error) {
      console.error('Failed to update cell:', error)
    }
  }, [id])

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
        <>
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  {canDragRecords && (
                    <TableHead className="w-8 px-2"></TableHead>
                  )}
                  {visibleFields.map(field => (
                    <TableHead key={field.id} className="min-w-40">
                      <div className="flex items-center gap-2 group">
                        <Icon name={FIELD_TYPE_ICONS[field.type]} size={14} className="text-tertiary" />
                        <span className="flex-1">{field.name}</span>
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1 hover:bg-error-subtle rounded opacity-0 group-hover:opacity-100 text-tertiary hover:text-error transition-all"
                          title="Delete field"
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-20" align="right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableEmpty
                colSpan={visibleFields.length + (canDragRecords ? 2 : 1)}
                icon="list"
                title="No records"
                description={activeView?.filters.length ? "No records match your filters" : "Add your first record to get started"}
                action={!activeView?.filters.length ? (
                  <Button size="sm" onClick={openNewRecord}>
                    <Icon name="plus" size={16} />
                    Add Record
                  </Button>
                ) : undefined}
              />
            ) : (
              filteredRecords.map(record => (
                <TableRow
                  key={record.id}
                  draggable={canDragRecords}
                  onDragStart={e => handleDragStart(e, record.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, record.id)}
                  className={cn(
                    canDragRecords && 'cursor-grab active:cursor-grabbing',
                    draggedRecordId === record.id && 'opacity-50'
                  )}
                >
                  {canDragRecords && (
                    <TableCell className="w-8 px-2">
                      <Icon name="grip" size={16} className="text-secondary" />
                    </TableCell>
                  )}
                  {visibleFields.map(field => (
                    <TableCell key={field.id}>
                      {renderCellValue(field, record.values[field.id], record.id)}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <TableActions>
                      <TableActionButton
                        icon="arrow-out"
                        label="Open"
                        onClick={() => router.push(`/admin/cortex/databases/${id}/records/${record.id}`)}
                      />
                      <TableActionButton
                        icon="edit"
                        label="Edit"
                        onClick={() => openEditRecord(record)}
                      />
                      <TableActionButton
                        icon="trash"
                        label="Delete"
                        variant="danger"
                        onClick={() => handleDeleteRecord(record.id)}
                      />
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
          </Card>

          {/* Footer stats */}
          <div className="text-sm text-tertiary">
            {filteredRecords.length} of {database.records.length} records
            {activeView?.filters.length ? ` (filtered)` : ''}
            {canDragRecords && filteredRecords.length > 1 && (
              <span className="ml-2 text-tertiary/60">• Drag to reorder</span>
            )}
          </div>
        </>
      )}

      {/* Cards View */}
      {activeView?.type === 'cards' && activeView.cardsConfig && (() => {
        const sourceDb = allDatabases.find(db => db.id === activeView.cardsConfig?.sourceDatabaseId)
        if (!sourceDb) return (
          <Card className="p-8 text-center text-tertiary">
            Source database not found
          </Card>
        )

        const groupByField = sourceDb.fields.find(f => f.id === activeView.cardsConfig?.groupByFieldId)
        if (!groupByField) return (
          <Card className="p-8 text-center text-tertiary">
            Group by field not found
          </Card>
        )

        // Get display name for a source record
        const getSourceRecordName = (record: DatabaseRecord) => {
          const nameField = sourceDb.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
          if (nameField && record.values[nameField.id]) {
            return String(record.values[nameField.id])
          }
          const firstTextField = sourceDb.fields.find(f => f.type === 'text')
          if (firstTextField && record.values[firstTextField.id]) {
            return String(record.values[firstTextField.id])
          }
          return `Record ${record.id.slice(0, 6)}`
        }

        // Check if source record has a checkbox field (for task completion)
        const checkboxField = sourceDb.fields.find(f => f.type === 'checkbox')

        // Get expanded card data
        const expandedCard = expandedCardId ? database.records.find(r => r.id === expandedCardId) : null
        const expandedChildRecords = expandedCard ? sourceDb.records.filter(sr => {
          const relationValue = sr.values[groupByField.id]
          if (Array.isArray(relationValue)) {
            return relationValue.includes(expandedCard.id)
          }
          return relationValue === expandedCard.id
        }) : []

        // Get parent display name helper
        const getParentName = (parentRecord: DatabaseRecord) => {
          const parentNameField = database.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
          return parentNameField && parentRecord.values[parentNameField.id]
            ? String(parentRecord.values[parentNameField.id])
            : `Record ${parentRecord.id.slice(0, 6)}`
        }

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {database.records.map(parentRecord => {
                // Find all source records that have this parent as their relation
                const childRecords = sourceDb.records.filter(sr => {
                  const relationValue = sr.values[groupByField.id]
                  if (Array.isArray(relationValue)) {
                    return relationValue.includes(parentRecord.id)
                  }
                  return relationValue === parentRecord.id
                })

                const parentName = getParentName(parentRecord)

                // Calculate progress if there's a checkbox field
                const completedCount = checkboxField
                  ? childRecords.filter(r => r.values[checkboxField.id] === true).length
                  : 0
                const progress = childRecords.length > 0
                  ? Math.round((completedCount / childRecords.length) * 100)
                  : 0

                return (
                  <Card
                    key={parentRecord.id}
                    className="flex flex-col cursor-pointer hover:bg-elevated transition-colors"
                    onClick={() => setExpandedCardId(parentRecord.id)}
                  >
                    <div className="p-4 border-b border-border-default">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base text-primary">{parentName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-tertiary">
                            {childRecords.length} {sourceDb.name.toLowerCase()}
                          </span>
                          <Icon name="arrow-out" size={14} className="text-tertiary" />
                        </div>
                      </div>
                      {checkboxField && childRecords.length > 0 && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-tertiary mb-1">
                            <span>{completedCount}/{childRecords.length} completed</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 bg-elevated rounded-full overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-2 space-y-1 max-h-52 overflow-hidden">
                      {childRecords.length === 0 ? (
                        <p className="text-sm text-tertiary text-center py-4">
                          No {sourceDb.name.toLowerCase()} yet
                        </p>
                      ) : (
                        childRecords.slice(0, 5).map(childRecord => (
                          <div
                            key={childRecord.id}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                          >
                            {checkboxField && (
                              <Icon
                                name={childRecord.values[checkboxField.id] ? 'check-square' : 'square'}
                                size={14}
                                className={childRecord.values[checkboxField.id] ? 'text-success' : 'text-tertiary'}
                              />
                            )}
                            <span className={cn(
                              "flex-1 truncate",
                              checkboxField && childRecord.values[checkboxField.id]
                                ? "text-tertiary line-through"
                                : "text-primary"
                            )}>
                              {getSourceRecordName(childRecord)}
                            </span>
                          </div>
                        ))
                      )}
                      {childRecords.length > 5 && (
                        <p className="text-xs text-tertiary text-center py-1">
                          +{childRecords.length - 5} more
                        </p>
                      )}
                    </div>
                    {/* Quick add in card */}
                    <div className="p-2 pt-0">
                      <form
                        onClick={(e) => e.stopPropagation()}
                        onSubmit={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const form = e.target as HTMLFormElement
                          const input = form.elements.namedItem(`quickAdd-${parentRecord.id}`) as HTMLInputElement
                          const value = input.value.trim()
                          if (!value) return

                          const nameField = sourceDb.fields.find(f =>
                            f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title'
                          ) || sourceDb.fields.find(f => f.type === 'text')

                          if (!nameField) return

                          try {
                            await databasesApi.addRecord(sourceDb.id, {
                              [nameField.id]: value,
                              [groupByField.id]: groupByField.relationConfig?.multiple
                                ? [parentRecord.id]
                                : parentRecord.id
                            })
                            await loadData()
                            input.value = ''
                          } catch (error) {
                            console.error('Failed to add record:', error)
                          }
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-elevated transition-colors"
                      >
                        <Icon name="plus" size={14} className="text-tertiary shrink-0" />
                        <input
                          name={`quickAdd-${parentRecord.id}`}
                          type="text"
                          placeholder={`Add ${sourceDb.name.toLowerCase().replace(/s$/, '')}...`}
                          className="flex-1 bg-transparent text-primary placeholder-tertiary outline-none text-sm"
                          autoComplete="off"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </form>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Footer stats */}
            <div className="text-sm text-tertiary">
              {database.records.length} cards • {sourceDb.records.length} {sourceDb.name.toLowerCase()} total
            </div>

            {/* Expanded Card Modal */}
            <Modal
              open={!!expandedCardId}
              onClose={() => setExpandedCardId(null)}
              title={expandedCard ? getParentName(expandedCard) : ''}
              className="max-w-2xl"
            >
              {expandedCard && (
                <div className="space-y-4">
                  {/* Progress */}
                  {checkboxField && expandedChildRecords.length > 0 && (() => {
                    const completed = expandedChildRecords.filter(r => r.values[checkboxField.id] === true).length
                    const progress = Math.round((completed / expandedChildRecords.length) * 100)
                    return (
                      <div>
                        <div className="flex items-center justify-between text-sm text-tertiary mb-2">
                          <span>{completed}/{expandedChildRecords.length} completed</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-2 bg-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-success rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )
                  })()}

                  {/* Records list */}
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {expandedChildRecords.length === 0 ? (
                      <p className="text-tertiary text-center py-8">
                        No {sourceDb.name.toLowerCase()} yet
                      </p>
                    ) : (
                      expandedChildRecords.map(childRecord => (
                        <div
                          key={childRecord.id}
                          className="group flex items-start gap-3 p-3 rounded-lg bg-elevated hover:bg-surface transition-colors"
                        >
                          {checkboxField && (
                            <Checkbox
                              checked={!!childRecord.values[checkboxField.id]}
                              onChange={async (e) => {
                                e.stopPropagation()
                                try {
                                  await databasesApi.updateRecord(
                                    sourceDb.id,
                                    childRecord.id,
                                    { ...childRecord.values, [checkboxField.id]: e.target.checked }
                                  )
                                  await loadData()
                                } catch (error) {
                                  console.error('Failed to update record:', error)
                                }
                              }}
                              className="mt-0.5"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "font-medium",
                              checkboxField && childRecord.values[checkboxField.id]
                                ? "text-tertiary line-through"
                                : "text-primary"
                            )}>
                              {getSourceRecordName(childRecord)}
                            </p>
                            {/* Show other fields */}
                            <div className="mt-1 flex flex-wrap gap-2">
                              {sourceDb.fields
                                .filter(f =>
                                  f.id !== groupByField.id &&
                                  f.type !== 'checkbox' &&
                                  f.name.toLowerCase() !== 'name' &&
                                  f.name.toLowerCase() !== 'title' &&
                                  childRecord.values[f.id]
                                )
                                .slice(0, 3)
                                .map(f => {
                                  const value = childRecord.values[f.id]
                                  if (f.type === 'select' && f.options) {
                                    const opt = f.options.find(o => o.id === value)
                                    return opt ? (
                                      <Badge key={f.id} variant="custom" customColor={opt.color} className="text-xs">
                                        {opt.label}
                                      </Badge>
                                    ) : null
                                  }
                                  if (f.type === 'date' && value) {
                                    return (
                                      <span key={f.id} className="text-xs text-tertiary">
                                        {new Date(String(value)).toLocaleDateString()}
                                      </span>
                                    )
                                  }
                                  return null
                                })}
                            </div>
                          </div>
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => router.push(`/admin/cortex/databases/${sourceDb.id}/records/${childRecord.id}`)}
                              className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded transition-colors"
                              title="Open"
                            >
                              <Icon name="arrow-out" size={14} />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Delete this record?')) {
                                  try {
                                    await databasesApi.deleteRecord(sourceDb.id, childRecord.id)
                                    await loadData()
                                  } catch (error) {
                                    console.error('Failed to delete record:', error)
                                  }
                                }
                              }}
                              className="p-1.5 text-tertiary hover:text-error hover:bg-error-subtle rounded transition-colors"
                              title="Delete"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Quick add record */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const form = e.target as HTMLFormElement
                      const input = form.elements.namedItem('quickAdd') as HTMLInputElement
                      const value = input.value.trim()
                      if (!value) return

                      // Find name/title field
                      const nameField = sourceDb.fields.find(f =>
                        f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title'
                      ) || sourceDb.fields.find(f => f.type === 'text')

                      if (!nameField) return

                      try {
                        await databasesApi.addRecord(sourceDb.id, {
                          [nameField.id]: value,
                          [groupByField.id]: groupByField.relationConfig?.multiple
                            ? [expandedCard.id]
                            : expandedCard.id
                        })
                        await loadData()
                        input.value = ''
                      } catch (error) {
                        console.error('Failed to add record:', error)
                      }
                    }}
                    className="flex items-center gap-2 pt-2 border-t border-border-default"
                  >
                    <Icon name="plus" size={16} className="text-tertiary shrink-0" />
                    <input
                      name="quickAdd"
                      type="text"
                      placeholder={`Add ${sourceDb.name.toLowerCase().replace(/s$/, '')}...`}
                      className="flex-1 bg-transparent text-primary placeholder-tertiary outline-none text-sm py-2"
                      autoComplete="off"
                    />
                    <Button type="submit" size="sm" variant="ghost">
                      Add
                    </Button>
                  </form>
                </div>
              )}
            </Modal>
          </>
        )
      })()}

      {/* Todo View */}
      {activeView?.type === 'todo' && activeView.todoConfig && (() => {
        const checkboxField = database.fields.find(f => f.id === activeView.todoConfig?.checkboxFieldId)
        if (!checkboxField) {
          return (
            <Card className="p-8 text-center text-tertiary">
              Checkbox field not found. Please reconfigure this view.
            </Card>
          )
        }

        const nameField = database.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
          || database.fields.find(f => f.type === 'text')

        const getRecordName = (rec: DatabaseRecord) => {
          if (nameField && rec.values[nameField.id]) {
            return String(rec.values[nameField.id])
          }
          return `Record ${rec.id.slice(0, 6)}`
        }

        // Correct logic:
        // - Unchecked checkbox = task NOT done = show in main list (top)
        // - Checked checkbox = task done = show in completed section (bottom)
        const isDone = (val: unknown) => val === true || val === 'true'
        const todoItems = filteredRecords.filter(r => !isDone(r.values[checkboxField.id])) // unchecked → top
        const doneItems = filteredRecords.filter(r => isDone(r.values[checkboxField.id]))  // checked → bottom
        const showCompleted = activeView.todoConfig.showCompleted

        const toggleComplete = async (rec: DatabaseRecord) => {
          try {
            await databasesApi.updateRecord(id, rec.id, {
              ...rec.values,
              [checkboxField.id]: !isDone(rec.values[checkboxField.id])
            })
            await loadData()
          } catch (error) {
            console.error('Failed to update record:', error)
          }
        }

        const progressPercent = filteredRecords.length > 0
          ? Math.round((doneItems.length / filteredRecords.length) * 100)
          : 0

        return (
          <div className="space-y-4">
            {/* Progress Bar */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary">Progress</span>
                <span className="text-sm text-tertiary">
                  {doneItems.length}/{filteredRecords.length} completed ({progressPercent}%)
                </span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </Card>

            {/* Quick Add */}
            <Card className="p-0 overflow-hidden">
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const input = form.elements.namedItem('todoQuickAdd') as HTMLInputElement
                  const value = input.value.trim()
                  if (!value || !nameField) return

                  try {
                    await databasesApi.addRecord(id, {
                      [nameField.id]: value,
                      [checkboxField.id]: false
                    })
                    await loadData()
                    input.value = ''
                  } catch (error) {
                    console.error('Failed to add record:', error)
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 border-b border-border-default"
              >
                <Icon name="plus" size={18} className="text-tertiary" />
                <input
                  name="todoQuickAdd"
                  type="text"
                  placeholder="Add a task..."
                  className="flex-1 bg-transparent text-primary placeholder-tertiary outline-none"
                  autoComplete="off"
                />
                <Button type="submit" size="sm">Add</Button>
              </form>

              {/* Incomplete Items (todo) */}
              <div className="divide-y divide-border-default">
                {todoItems.length === 0 && doneItems.length === 0 && (
                  <div className="px-4 py-8 text-center text-tertiary">
                    <Icon name="check-circle" size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No tasks yet. Add one above!</p>
                  </div>
                )}
                {todoItems.length === 0 && doneItems.length > 0 && (
                  <div className="px-4 py-6 text-center text-tertiary">
                    <Icon name="trophy" size={32} className="mx-auto mb-2 text-success" />
                    <p className="text-success font-medium">All done!</p>
                  </div>
                )}
                {todoItems.map(rec => (
                  <div
                    key={rec.id}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors",
                      canDragRecords && "cursor-grab active:cursor-grabbing",
                      draggedRecordId === rec.id && "opacity-50"
                    )}
                    draggable={canDragRecords}
                    onDragStart={e => handleDragStart(e, rec.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, rec.id)}
                  >
                    {canDragRecords && (
                      <Icon name="grip" size={16} className="text-tertiary group-hover:text-secondary transition-colors" />
                    )}
                    <Checkbox
                      checked={isDone(rec.values[checkboxField.id])}
                      onChange={() => toggleComplete(rec)}
                    />
                    <span
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                    >
                      {getRecordName(rec)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                        className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                        title="Open"
                      >
                        <Icon name="arrow-out" size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-1.5 text-tertiary hover:text-error hover:bg-error/10 rounded"
                        title="Delete"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Completed Items */}
              {showCompleted && doneItems.length > 0 && (
                <div className="border-t border-border-default">
                  <button
                    onClick={() => setTodoCompletedCollapsed(!todoCompletedCollapsed)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-tertiary hover:bg-elevated transition-colors"
                  >
                    <Icon
                      name={todoCompletedCollapsed ? 'caret-right' : 'caret-down'}
                      size={14}
                    />
                    <span>Completed ({doneItems.length})</span>
                  </button>
                  {!todoCompletedCollapsed && (
                    <div className="divide-y divide-border-default bg-base/50">
                      {doneItems.map(rec => (
                        <div
                          key={rec.id}
                          className={cn(
                            "group flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors",
                            canDragRecords && "cursor-grab active:cursor-grabbing",
                            draggedRecordId === rec.id && "opacity-50"
                          )}
                          draggable={canDragRecords}
                          onDragStart={e => handleDragStart(e, rec.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={e => handleDrop(e, rec.id)}
                        >
                          {canDragRecords && (
                            <Icon name="grip" size={16} className="text-tertiary group-hover:text-secondary transition-colors" />
                          )}
                          <Checkbox
                            checked={isDone(rec.values[checkboxField.id])}
                            onChange={() => toggleComplete(rec)}
                          />
                          <span
                            className="flex-1 text-tertiary line-through cursor-pointer"
                            onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                          >
                            {getRecordName(rec)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                              className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                              title="Open"
                            >
                              <Icon name="arrow-out" size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="p-1.5 text-tertiary hover:text-error hover:bg-error/10 rounded"
                              title="Delete"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Footer stats */}
            <div className="text-sm text-tertiary">
              {filteredRecords.length} total tasks
              {activeView?.filters.length ? ` (filtered)` : ''}
              {canDragRecords && filteredRecords.length > 1 && (
                <span className="ml-2 text-tertiary/60">• Drag to reorder</span>
              )}
            </div>
          </div>
        )
      })()}

      {/* My Day View */}
      {activeView?.type === 'myday' && activeView.myDayConfig && (() => {
        const dateField = database.fields.find(f => f.id === activeView.myDayConfig?.dateFieldId)
        const streakField = database.fields.find(f => f.id === activeView.myDayConfig?.streakFieldId)

        if (!dateField || !streakField) {
          return (
            <Card className="p-8 text-center text-tertiary">
              Required fields not found. Please reconfigure this view.
            </Card>
          )
        }

        const nameField = database.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
          || database.fields.find(f => f.type === 'text')

        const getRecordName = (rec: DatabaseRecord) => {
          if (nameField && rec.values[nameField.id]) {
            return String(rec.values[nameField.id])
          }
          return `Habit ${rec.id.slice(0, 6)}`
        }

        // Get today's date string (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        // Check if a record is completed today
        const isCompletedToday = (rec: DatabaseRecord) => {
          const lastCompleted = rec.values[dateField.id]
          if (!lastCompleted) return false
          const completedDate = String(lastCompleted).split('T')[0]
          return completedDate === today
        }

        // Get streak value
        const getStreak = (rec: DatabaseRecord) => {
          const streak = rec.values[streakField.id]
          return typeof streak === 'number' ? streak : 0
        }

        // Calculate if streak is still valid (completed yesterday or today)
        const isStreakValid = (rec: DatabaseRecord) => {
          const lastCompleted = rec.values[dateField.id]
          if (!lastCompleted) return false
          const completedDate = String(lastCompleted).split('T')[0]
          return completedDate === today || completedDate === yesterday
        }

        const completedToday = filteredRecords.filter(r => isCompletedToday(r))
        const pendingToday = filteredRecords.filter(r => !isCompletedToday(r))
        const allCompletedToday = pendingToday.length === 0 && filteredRecords.length > 0

        // Perfect Day Streak from config
        const perfectStreak = activeView.myDayConfig.perfectStreak || 0
        const lastPerfectDay = activeView.myDayConfig.lastPerfectDay || null

        const progressPercent = filteredRecords.length > 0
          ? Math.round((completedToday.length / filteredRecords.length) * 100)
          : 0

        // Update perfect streak when status changes
        const updatePerfectStreak = async (willBeAllComplete: boolean) => {
          const currentPerfectStreak = activeView.myDayConfig?.perfectStreak || 0
          const currentLastPerfectDay = activeView.myDayConfig?.lastPerfectDay || null

          if (willBeAllComplete) {
            // Just completed all habits today
            if (currentLastPerfectDay === today) {
              // Already recorded today, no update needed
              return
            }

            let newPerfectStreak: number
            if (currentLastPerfectDay === yesterday) {
              // Continuing the perfect streak
              newPerfectStreak = currentPerfectStreak + 1
            } else {
              // Starting new perfect streak
              newPerfectStreak = 1
            }

            await databasesApi.updateView(id, activeView.id, {
              myDayConfig: {
                dateFieldId: activeView.myDayConfig!.dateFieldId,
                streakFieldId: activeView.myDayConfig!.streakFieldId,
                perfectStreak: newPerfectStreak,
                lastPerfectDay: today
              }
            })
          }
          // Note: We don't decrease perfectStreak when unchecking -
          // the streak only breaks if you miss a day entirely
        }

        const toggleHabit = async (rec: DatabaseRecord) => {
          try {
            const wasCompletedToday = isCompletedToday(rec)
            const currentStreak = getStreak(rec)
            const lastCompleted = rec.values[dateField.id]
            const lastCompletedDate = lastCompleted ? String(lastCompleted).split('T')[0] : null

            let newStreak: number
            let newDate: string | null

            if (wasCompletedToday) {
              // Unchecking - reset to yesterday or null, decrease streak
              newStreak = Math.max(0, currentStreak - 1)
              newDate = lastCompletedDate === today ? (currentStreak > 1 ? yesterday : null) : lastCompletedDate
            } else {
              // Checking - set to today, calculate new streak
              if (lastCompletedDate === yesterday) {
                // Continuing streak
                newStreak = currentStreak + 1
              } else {
                // New streak
                newStreak = 1
              }
              newDate = today
            }

            await databasesApi.updateRecord(id, rec.id, {
              ...rec.values,
              [dateField.id]: newDate,
              [streakField.id]: newStreak
            })

            // Check if this action completes all habits for today
            const willBeAllComplete = !wasCompletedToday && pendingToday.length === 1 && pendingToday[0].id === rec.id
            if (willBeAllComplete) {
              await updatePerfectStreak(true)
            }

            await loadData()
          } catch (error) {
            console.error('Failed to update habit:', error)
          }
        }

        // Format today's date nicely
        const todayFormatted = new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric'
        })

        // Check if perfect streak is still valid (last perfect day was today or yesterday)
        const isPerfectStreakActive = lastPerfectDay === today || lastPerfectDay === yesterday

        return (
          <div className="space-y-4">
            {/* Header with date and streak */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent-orange-subtle flex items-center justify-center">
                    <Icon name="sun" size={24} className="text-accent-orange" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-primary">My Day</h2>
                    <p className="text-sm text-tertiary">{todayFormatted}</p>
                  </div>
                </div>
                {isPerfectStreakActive && perfectStreak > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-accent-orange-subtle rounded-xl">
                    <Icon name="fire" size={20} className="text-accent-orange" />
                    <span className="text-lg font-bold text-accent-orange">{perfectStreak}</span>
                    <span className="text-sm text-tertiary">perfect {perfectStreak === 1 ? 'day' : 'days'}</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-tertiary">Today's Progress</span>
                <span className="text-sm font-medium text-primary">
                  {completedToday.length}/{filteredRecords.length} completed
                </span>
              </div>
              <div className="h-2 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-success rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {allCompletedToday && (
                <div className="mt-3 flex items-center gap-2 text-success">
                  <Icon name="trophy" size={18} />
                  <span className="text-sm font-medium">Perfect day! Keep it up!</span>
                </div>
              )}
            </Card>

            {/* Habits List */}
            <Card className="p-0 overflow-hidden">
              {filteredRecords.length === 0 ? (
                <div className="px-4 py-8 text-center text-tertiary">
                  <Icon name="sun" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No daily habits yet.</p>
                  <p className="text-sm mt-1">Add records to start tracking your day!</p>
                </div>
              ) : (
                <div className="divide-y divide-border-default">
                  {/* Pending habits first */}
                  {pendingToday.map(rec => (
                    <div
                      key={rec.id}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors",
                        canDragRecords && "cursor-grab active:cursor-grabbing",
                        draggedRecordId === rec.id && "opacity-50"
                      )}
                      draggable={canDragRecords}
                      onDragStart={e => handleDragStart(e, rec.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, rec.id)}
                    >
                      {canDragRecords && (
                        <Icon name="grip" size={16} className="text-tertiary group-hover:text-secondary transition-colors" />
                      )}
                      <Checkbox
                        checked={false}
                        onChange={() => toggleHabit(rec)}
                      />
                      <span
                        className="flex-1 cursor-pointer font-medium"
                        onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                      >
                        {getRecordName(rec)}
                      </span>
                      {isStreakValid(rec) && getStreak(rec) > 0 && (
                        <div className="flex items-center gap-1 text-accent-orange">
                          <Icon name="fire" size={14} />
                          <span className="text-sm font-medium">{getStreak(rec)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                          className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                          title="Open"
                        >
                          <Icon name="arrow-out" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Completed habits */}
                  {completedToday.map(rec => (
                    <div
                      key={rec.id}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-3 hover:bg-elevated transition-colors bg-success-subtle",
                        canDragRecords && "cursor-grab active:cursor-grabbing",
                        draggedRecordId === rec.id && "opacity-50"
                      )}
                      draggable={canDragRecords}
                      onDragStart={e => handleDragStart(e, rec.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={e => handleDrop(e, rec.id)}
                    >
                      {canDragRecords && (
                        <Icon name="grip" size={16} className="text-tertiary group-hover:text-secondary transition-colors" />
                      )}
                      <Checkbox
                        checked={true}
                        onChange={() => toggleHabit(rec)}
                      />
                      <span
                        className="flex-1 cursor-pointer text-tertiary"
                        onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                      >
                        {getRecordName(rec)}
                      </span>
                      <div className="flex items-center gap-1 text-success">
                        <Icon name="fire" size={14} />
                        <span className="text-sm font-medium">{getStreak(rec)}</span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/admin/cortex/databases/${id}/records/${rec.id}`)}
                          className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                          title="Open"
                        >
                          <Icon name="arrow-out" size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Footer */}
            <div className="text-sm text-tertiary">
              {filteredRecords.length} daily habits
              {activeView?.filters.length ? ` (filtered)` : ''}
              {canDragRecords && filteredRecords.length > 1 && (
                <span className="ml-2 text-tertiary/60">• Drag to reorder</span>
              )}
            </div>
          </div>
        )
      })()}

      {/* ====== GALLERY VIEW ====== */}
      {activeView?.type === 'gallery' && activeView.galleryConfig && (() => {
        const imageField = database.fields.find(f => f.id === activeView.galleryConfig!.imageFieldId)
        const nameField = database.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title') || database.fields.find(f => f.type === 'text')
        const yearField = database.fields.find(f => f.name.toLowerCase() === 'year')
        const ratingField = database.fields.find(f => f.name.toLowerCase() === 'rating')
        const statusField = database.fields.find(f => f.name.toLowerCase() === 'status' && f.type === 'select')
        const typeField = database.fields.find(f => f.name.toLowerCase() === 'type' && f.type === 'select')

        if (!imageField) {
          return (
            <Card>
              <div className="p-8 text-center">
                <Icon name="grid" size={48} className="text-tertiary mx-auto mb-3" />
                <p className="text-tertiary">Image field not found. Edit this view to configure it.</p>
              </div>
            </Card>
          )
        }

        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredRecords.map(record => {
              const imageUrl = record.values[imageField.id] as string | undefined
              const title = nameField ? record.values[nameField.id] as string : ''
              const year = yearField ? record.values[yearField.id] as number | undefined : undefined
              const rating = ratingField ? record.values[ratingField.id] as number | undefined : undefined

              const statusOption = statusField?.options?.find(o => o.id === record.values[statusField.id])
              const typeOption = typeField?.options?.find(o => o.id === record.values[typeField.id])

              return (
                <div
                  key={record.id}
                  onClick={() => openEditRecord(record)}
                  className="group relative cursor-pointer rounded-xl overflow-hidden transition-transform hover:scale-105"
                  style={{ aspectRatio: '2/3' }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title || ''}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-elevated flex items-center justify-center">
                      <Icon name="clapboard" size={40} className="text-tertiary" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                  <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1">
                    <div className="flex flex-wrap gap-1">
                      {typeOption && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: typeOption.color + '33', color: typeOption.color }}
                        >
                          {typeOption.label}
                        </span>
                      )}
                      {statusOption && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ backgroundColor: statusOption.color + '33', color: statusOption.color }}
                        >
                          {statusOption.label}
                        </span>
                      )}
                    </div>

                    {title && (
                      <p className="text-sm font-medium text-white leading-tight line-clamp-2">
                        {title}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-white/70">
                      {year && <span>{year}</span>}
                      {rating != null && rating > 0 && <span>★ {rating}</span>}
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredRecords.length === 0 && (
              <div className="col-span-full">
                <Card>
                  <div className="p-8 text-center">
                    <Icon name="grid" size={48} className="text-tertiary mx-auto mb-3" />
                    <p className="text-tertiary mb-4">
                      {activeView.filters.length ? 'No records match your filters' : 'No records yet'}
                    </p>
                    {!activeView.filters.length && (
                      <Button size="sm" onClick={openNewRecord}>
                        <Icon name="plus" size={16} />
                        Add Record
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )
      })()}

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
                  ...allDatabases
                    .filter(db => db.id !== id) // Exclude current database
                    .map(db => ({ value: db.id, label: db.name }))
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
                  ...allDatabases
                    .filter(db => db.id !== id) // Exclude current database
                    .map(db => ({ value: db.id, label: db.name }))
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
