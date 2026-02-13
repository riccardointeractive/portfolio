'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, Button, Input, Select, Badge, Checkbox } from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { cn } from '@/app/admin/cortex/lib/utils'
import type { Database, DatabaseRecord, Field, FieldType } from '@/app/admin/cortex/lib/types'

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

export default function RecordPage({ params }: { params: Promise<{ id: string; recordId: string }> }) {
  const { id, recordId } = use(params)
  const router = useRouter()
  const databaseId = id

  const [database, setDatabase] = useState<Database | null>(null)
  const [record, setRecord] = useState<DatabaseRecord | null>(null)
  const [allDatabases, setAllDatabases] = useState<Database[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<unknown>(null)

  useEffect(() => {
    loadData()
  }, [databaseId, recordId])

  const loadData = async () => {
    try {
      const [dbRes, allDbRes] = await Promise.all([
        databasesApi.get(databaseId),
        databasesApi.list()
      ])

      if (!dbRes.data) {
        router.push('/admin/cortex/databases')
        return
      }

      setDatabase(dbRes.data)
      setAllDatabases(allDbRes.data || [])

      const foundRecord = dbRes.data.records.find(r => r.id === recordId)
      if (!foundRecord) {
        router.push(`/admin/cortex/databases/${databaseId}`)
        return
      }

      setRecord(foundRecord)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecordTitle = () => {
    if (!database || !record) return 'Record'
    const nameField = database.fields.find(f =>
      f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title'
    )
    if (nameField && record.values[nameField.id]) {
      return String(record.values[nameField.id])
    }
    const firstTextField = database.fields.find(f => f.type === 'text')
    if (firstTextField && record.values[firstTextField.id]) {
      return String(record.values[firstTextField.id])
    }
    return `Record ${record.id.slice(0, 8)}`
  }

  const startEditing = (field: Field) => {
    setEditingFieldId(field.id)
    setEditValue(record?.values[field.id] ?? (field.type === 'checkbox' ? false : ''))
  }

  const cancelEditing = () => {
    setEditingFieldId(null)
    setEditValue(null)
  }

  const saveField = async (fieldId: string) => {
    if (!record) return
    try {
      await databasesApi.updateRecord(databaseId, recordId, {
        ...record.values,
        [fieldId]: editValue
      })
      await loadData()
      setEditingFieldId(null)
      setEditValue(null)
    } catch (error) {
      console.error('Failed to save field:', error)
    }
  }

  const toggleCheckbox = async (fieldId: string, currentValue: boolean) => {
    if (!record) return
    try {
      await databasesApi.updateRecord(databaseId, recordId, {
        ...record.values,
        [fieldId]: !currentValue
      })
      await loadData()
    } catch (error) {
      console.error('Failed to toggle checkbox:', error)
    }
  }

  const renderFieldValue = (field: Field) => {
    if (!record) return null
    const value = record.values[field.id]

    // Checkbox - always interactive
    if (field.type === 'checkbox') {
      return (
        <Checkbox
          checked={!!value}
          onChange={() => toggleCheckbox(field.id, !!value)}
        />
      )
    }

    // Editing mode
    if (editingFieldId === field.id) {
      return (
        <div className="flex items-center gap-2 flex-1">
          {renderFieldInput(field)}
          <Button size="sm" onClick={() => saveField(field.id)}>
            <Icon name="check" size={14} />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing}>
            <Icon name="close" size={14} />
          </Button>
        </div>
      )
    }

    // Display mode
    return (
      <div
        className="flex-1 cursor-pointer hover:bg-elevated rounded px-2 py-1 -mx-2 -my-1 transition-colors"
        onClick={() => startEditing(field)}
      >
        {renderDisplayValue(field, value)}
      </div>
    )
  }

  const renderFieldInput = (field: Field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Input
            value={String(editValue || '')}
            onChange={e => setEditValue(e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className="flex-1"
            autoFocus
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            value={editValue as number || ''}
            onChange={e => setEditValue(e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className="flex-1"
            autoFocus
          />
        )

      case 'date':
        return (
          <Input
            type="date"
            value={editValue ? String(editValue) : ''}
            onChange={e => setEditValue(e.target.value)}
            className="flex-1"
            autoFocus
          />
        )

      case 'select':
        return (
          <Select
            value={String(editValue || '')}
            onChange={e => setEditValue(e.target.value)}
            options={[
              { value: '', label: 'Select...' },
              ...(field.options?.map(opt => ({ value: opt.id, label: opt.label })) || [])
            ]}
            className="flex-1"
          />
        )

      case 'multiselect':
        const selectedValues = Array.isArray(editValue) ? editValue : []
        return (
          <div className="flex flex-wrap gap-2 flex-1">
            {field.options?.map(opt => (
              <button
                key={opt.id}
                onClick={() => {
                  if (selectedValues.includes(opt.id)) {
                    setEditValue(selectedValues.filter(v => v !== opt.id))
                  } else {
                    setEditValue([...selectedValues, opt.id])
                  }
                }}
                className={cn(
                  'px-3 py-1 rounded-full text-sm transition-colors',
                  selectedValues.includes(opt.id)
                    ? 'ring-2 ring-info'
                    : 'opacity-50 hover:opacity-100'
                )}
                style={{ backgroundColor: `${opt.color}30`, color: opt.color }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )

      case 'relation':
        const targetDb = allDatabases.find(db => db.id === field.relationConfig?.databaseId)
        if (!targetDb) return <span className="text-tertiary">Database not found</span>

        const getTargetRecordName = (rec: DatabaseRecord) => {
          const nameField = targetDb.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
          if (nameField && rec.values[nameField.id]) return String(rec.values[nameField.id])
          const firstTextField = targetDb.fields.find(f => f.type === 'text')
          if (firstTextField && rec.values[firstTextField.id]) return String(rec.values[firstTextField.id])
          return `Record ${rec.id.slice(0, 6)}`
        }

        if (field.relationConfig?.multiple) {
          const selectedIds = Array.isArray(editValue) ? editValue : []
          return (
            <div className="flex flex-wrap gap-2 flex-1">
              {targetDb.records.map(rec => (
                <button
                  key={rec.id}
                  onClick={() => {
                    if (selectedIds.includes(rec.id)) {
                      setEditValue(selectedIds.filter(v => v !== rec.id))
                    } else {
                      setEditValue([...selectedIds, rec.id])
                    }
                  }}
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm bg-elevated transition-all',
                    selectedIds.includes(rec.id)
                      ? 'ring-2 ring-info text-primary'
                      : 'opacity-50 hover:opacity-100 text-tertiary'
                  )}
                >
                  {getTargetRecordName(rec)}
                </button>
              ))}
            </div>
          )
        } else {
          return (
            <Select
              value={String(editValue || '')}
              onChange={e => setEditValue(e.target.value)}
              options={[
                { value: '', label: 'Select...' },
                ...targetDb.records.map(rec => ({ value: rec.id, label: getTargetRecordName(rec) }))
              ]}
              className="flex-1"
            />
          )
        }

      default:
        return null
    }
  }

  const renderDisplayValue = (field: Field, value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-tertiary">Empty</span>
    }

    switch (field.type) {
      case 'text':
      case 'number':
        return <span className="text-primary">{String(value)}</span>

      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-info hover:underline" onClick={e => e.stopPropagation()}>
            {String(value)}
          </a>
        )

      case 'url':
        return (
          <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-info hover:underline" onClick={e => e.stopPropagation()}>
            {String(value)}
          </a>
        )

      case 'date':
        return <span className="text-primary">{new Date(String(value)).toLocaleDateString()}</span>

      case 'select':
        const selectedOpt = field.options?.find(o => o.id === value)
        return selectedOpt ? (
          <Badge variant="custom" customColor={selectedOpt.color}>{selectedOpt.label}</Badge>
        ) : <span className="text-tertiary">Empty</span>

      case 'multiselect':
        const selectedOpts = field.options?.filter(o => (value as string[])?.includes(o.id)) || []
        return selectedOpts.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedOpts.map(opt => (
              <Badge key={opt.id} variant="custom" customColor={opt.color}>{opt.label}</Badge>
            ))}
          </div>
        ) : <span className="text-tertiary">Empty</span>

      case 'relation':
        const targetDb = allDatabases.find(db => db.id === field.relationConfig?.databaseId)
        if (!targetDb) return <span className="text-tertiary">-</span>

        const getTargetRecordName = (recId: string) => {
          const rec = targetDb.records.find(r => r.id === recId)
          if (!rec) return 'Unknown'
          const nameField = targetDb.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
          if (nameField && rec.values[nameField.id]) return String(rec.values[nameField.id])
          const firstTextField = targetDb.fields.find(f => f.type === 'text')
          if (firstTextField && rec.values[firstTextField.id]) return String(rec.values[firstTextField.id])
          return `Record ${rec.id.slice(0, 6)}`
        }

        if (Array.isArray(value)) {
          return value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map(recId => (
                <Badge
                  key={recId}
                  variant="default"
                  className="cursor-pointer hover:bg-elevated"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/admin/cortex/databases/${targetDb.id}/records/${recId}`)
                  }}
                >
                  {getTargetRecordName(recId)}
                  <Icon name="arrow-out" size={10} className="ml-1" />
                </Badge>
              ))}
            </div>
          ) : <span className="text-tertiary">Empty</span>
        } else {
          return (
            <Badge
              variant="default"
              className="cursor-pointer hover:bg-elevated"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/admin/cortex/databases/${targetDb.id}/records/${value}`)
              }}
            >
              {getTargetRecordName(String(value))}
              <Icon name="arrow-out" size={10} className="ml-1" />
            </Badge>
          )
        }

      default:
        return <span className="text-primary">{String(value)}</span>
    }
  }

  // Find related records (records from other databases that reference this record)
  // Also find databases that CAN reference this record (even with 0 records)
  const getRelatedRecords = () => {
    if (!record) return []

    const related: { database: Database; field: Field; records: DatabaseRecord[] }[] = []

    for (const db of allDatabases) {
      if (db.id === databaseId) continue

      for (const field of db.fields) {
        if (field.type === 'relation' && field.relationConfig?.databaseId === databaseId) {
          const relatedRecords = db.records.filter(r => {
            const val = r.values[field.id]
            if (Array.isArray(val)) return val.includes(recordId)
            return val === recordId
          })

          // Always include, even with 0 records, so user can add
          related.push({ database: db, field, records: relatedRecords })
        }
      }
    }

    return related
  }

  const relatedRecords = getRelatedRecords()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon name="spinner" size={24} className="animate-spin text-tertiary" />
      </div>
    )
  }

  if (!database || !record) {
    return null
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/cortex/databases/${databaseId}`)}>
          <Icon name="arrow-left" size={18} />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${database.color}20` }}
          >
            <Icon name={database.icon} size={24} color={database.color} weight="fill" />
          </div>
          <div>
            <p className="text-xs text-tertiary">{database.name}</p>
            <h1 className="font-display text-xl text-primary">{getRecordTitle()}</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            if (confirm('Delete this record?')) {
              await databasesApi.deleteRecord(databaseId, recordId)
              router.push(`/admin/cortex/databases/${databaseId}`)
            }
          }}
          className="text-tertiary hover:text-error"
        >
          <Icon name="trash" size={18} />
        </Button>
      </div>

      {/* Properties */}
      <Card className="divide-y divide-border-default">
        {database.fields.map(field => (
          <div key={field.id} className="flex items-start gap-4 p-4">
            <div className="w-40 flex items-center gap-2 text-tertiary shrink-0 pt-1">
              <Icon name={FIELD_TYPE_ICONS[field.type]} size={16} />
              <span className="text-sm">{field.name}</span>
            </div>
            <div className="flex-1 min-w-0">
              {renderFieldValue(field)}
            </div>
          </div>
        ))}
      </Card>

      {/* Related Records */}
      {relatedRecords.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg text-primary">Related</h2>
          {relatedRecords.map(({ database: relDb, field, records: relRecords }) => {
            const nameField = relDb.fields.find(f => f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title')
              || relDb.fields.find(f => f.type === 'text')
            const checkboxField = relDb.fields.find(f => f.type === 'checkbox')

            const getRecName = (rec: DatabaseRecord) => {
              if (nameField && rec.values[nameField.id]) {
                return String(rec.values[nameField.id])
              }
              return `Record ${rec.id.slice(0, 6)}`
            }

            return (
              <Card key={`${relDb.id}-${field.id}`} className="overflow-hidden">
                <div className="px-4 py-3 bg-elevated border-b border-default flex items-center gap-2">
                  <Icon name={relDb.icon} size={16} color={relDb.color} weight="fill" />
                  <span className="font-medium text-primary">{relDb.name}</span>
                  <span className="text-xs text-tertiary">via {field.name}</span>
                  <Badge variant="default" className="ml-auto">{relRecords.length}</Badge>
                </div>
                <div className="divide-y divide-border-default">
                  {relRecords.map(rec => {
                    const isCompleted = checkboxField ? !!rec.values[checkboxField.id] : false

                    return (
                      <div
                        key={rec.id}
                        className="group px-4 py-3 flex items-center gap-3 hover:bg-elevated transition-colors"
                      >
                        {checkboxField && (
                          <Checkbox
                            checked={isCompleted}
                            onChange={async (e) => {
                              e.stopPropagation()
                              try {
                                await databasesApi.updateRecord(relDb.id, rec.id, {
                                  ...rec.values,
                                  [checkboxField.id]: e.target.checked
                                })
                                await loadData()
                              } catch (error) {
                                console.error('Failed to update record:', error)
                              }
                            }}
                          />
                        )}
                        <span
                          className={cn(
                            "flex-1 cursor-pointer",
                            isCompleted && "text-tertiary line-through"
                          )}
                          onClick={() => router.push(`/admin/cortex/databases/${relDb.id}/records/${rec.id}`)}
                        >
                          {getRecName(rec)}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => router.push(`/admin/cortex/databases/${relDb.id}/records/${rec.id}`)}
                            className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded transition-colors"
                            title="Open"
                          >
                            <Icon name="arrow-out" size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Delete this record?')) {
                                try {
                                  await databasesApi.deleteRecord(relDb.id, rec.id)
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
                    )
                  })}
                </div>
                {/* Quick add */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const form = e.target as HTMLFormElement
                    const input = form.elements.namedItem(`quickAdd-${relDb.id}-${field.id}`) as HTMLInputElement
                    const value = input.value.trim()
                    if (!value || !nameField) return

                    try {
                      await databasesApi.addRecord(relDb.id, {
                        [nameField.id]: value,
                        [field.id]: field.relationConfig?.multiple ? [recordId] : recordId
                      })
                      await loadData()
                      input.value = ''
                    } catch (error) {
                      console.error('Failed to add record:', error)
                    }
                  }}
                  className="px-4 py-3 border-t border-default flex items-center gap-2"
                >
                  <Icon name="plus" size={16} className="text-tertiary shrink-0" />
                  <input
                    name={`quickAdd-${relDb.id}-${field.id}`}
                    type="text"
                    placeholder={`Add ${relDb.name.toLowerCase().replace(/s$/, '')}...`}
                    className="flex-1 bg-transparent text-primary placeholder-tertiary outline-none text-sm"
                    autoComplete="off"
                  />
                  <Button type="submit" size="sm" variant="ghost">
                    Add
                  </Button>
                </form>
              </Card>
            )
          })}
        </div>
      )}

      {/* Metadata */}
      <div className="text-xs text-tertiary space-y-1">
        <p>Created: {new Date(record.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(record.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}
