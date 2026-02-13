'use client'

import {
  Card, Button,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmpty, TableActions, TableActionButton,
} from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import { cn } from '@/app/admin/cortex/lib/utils'
import type { TableViewProps } from './types'

export function TableView({
  database,
  activeView,
  filteredRecords,
  canDragRecords,
  draggedRecordId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onOpenEditRecord,
  onOpenNewRecord,
  onDeleteRecord,
  visibleFields,
  fieldTypeIcons,
  renderCellValue,
  onDeleteField,
  onNavigateToRecord,
}: TableViewProps) {
  return (
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
                    <Icon name={fieldTypeIcons[field.type]} size={14} className="text-tertiary" />
                    <span className="flex-1">{field.name}</span>
                    <button
                      onClick={() => onDeleteField(field.id)}
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
                  <Button size="sm" onClick={onOpenNewRecord}>
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
                  onDragStart={e => onDragStart(e, record.id)}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDrop={e => onDrop(e, record.id)}
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
                        onClick={() => onNavigateToRecord(record.id)}
                      />
                      <TableActionButton
                        icon="edit"
                        label="Edit"
                        onClick={() => onOpenEditRecord(record)}
                      />
                      <TableActionButton
                        icon="trash"
                        label="Delete"
                        variant="danger"
                        onClick={() => onDeleteRecord(record.id)}
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
  )
}
