'use client'

import { useState } from 'react'
import { Card, Button, Modal, Badge, Checkbox } from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { cn } from '@/app/admin/cortex/lib/utils'
import type { DatabaseRecord } from '@/app/admin/cortex/lib/types'
import type { CardsViewProps } from './types'

export function CardsView({
  database,
  allDatabases,
  activeView,
  onRefreshDatabase,
  onNavigateToSourceRecord,
}: CardsViewProps) {
  // Local state: expanded card (only used by this view)
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null)

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
                      await onRefreshDatabase()
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
                            await onRefreshDatabase()
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
                        onClick={() => onNavigateToSourceRecord(sourceDb.id, childRecord.id)}
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
                              await onRefreshDatabase()
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
                  await onRefreshDatabase()
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
}
