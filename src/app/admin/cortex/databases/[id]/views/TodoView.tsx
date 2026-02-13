'use client'

import { useState, useEffect } from 'react'
import { Card, Button, Checkbox } from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { databasesApi } from '@/app/admin/cortex/lib/api'
import { cn } from '@/app/admin/cortex/lib/utils'
import type { DatabaseRecord } from '@/app/admin/cortex/lib/types'
import type { BaseViewProps } from './types'

interface TodoViewProps extends BaseViewProps {
  onNavigateToRecord: (recordId: string) => void
}

export function TodoView({
  database,
  activeView,
  filteredRecords,
  databaseId,
  canDragRecords,
  draggedRecordId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onDeleteRecord,
  onRefreshDatabase,
  onNavigateToRecord,
}: TodoViewProps) {
  // Local state: collapsed section (synced from view config on mount/change)
  const [completedCollapsed, setCompletedCollapsed] = useState(
    activeView.todoConfig?.completedCollapsed ?? false
  )

  useEffect(() => {
    if (activeView.todoConfig) {
      setCompletedCollapsed(activeView.todoConfig.completedCollapsed)
    }
  }, [activeView])

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

  const isDone = (val: unknown) => val === true || val === 'true'
  const todoItems = filteredRecords.filter(r => !isDone(r.values[checkboxField.id]))
  const doneItems = filteredRecords.filter(r => isDone(r.values[checkboxField.id]))
  const showCompleted = activeView.todoConfig!.showCompleted

  const toggleComplete = async (rec: DatabaseRecord) => {
    try {
      await databasesApi.updateRecord(databaseId, rec.id, {
        ...rec.values,
        [checkboxField.id]: !isDone(rec.values[checkboxField.id])
      })
      await onRefreshDatabase()
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
              await databasesApi.addRecord(databaseId, {
                [nameField.id]: value,
                [checkboxField.id]: false
              })
              await onRefreshDatabase()
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
              onDragStart={e => onDragStart(e, rec.id)}
              onDragEnd={onDragEnd}
              onDragOver={onDragOver}
              onDrop={e => onDrop(e, rec.id)}
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
                onClick={() => onNavigateToRecord(rec.id)}
              >
                {getRecordName(rec)}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onNavigateToRecord(rec.id)}
                  className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                  title="Open"
                >
                  <Icon name="arrow-out" size={14} />
                </button>
                <button
                  onClick={() => onDeleteRecord(rec.id)}
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
              onClick={() => setCompletedCollapsed(!completedCollapsed)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-tertiary hover:bg-elevated transition-colors"
            >
              <Icon
                name={completedCollapsed ? 'caret-right' : 'caret-down'}
                size={14}
              />
              <span>Completed ({doneItems.length})</span>
            </button>
            {!completedCollapsed && (
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
                    onDragStart={e => onDragStart(e, rec.id)}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDrop={e => onDrop(e, rec.id)}
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
                      onClick={() => onNavigateToRecord(rec.id)}
                    >
                      {getRecordName(rec)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onNavigateToRecord(rec.id)}
                        className="p-1.5 text-tertiary hover:text-primary hover:bg-base rounded"
                        title="Open"
                      >
                        <Icon name="arrow-out" size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
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
}
