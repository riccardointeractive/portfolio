'use client'

import { Card, Button } from '@/app/admin/cortex/components/ui'
import { Icon } from '@/app/admin/cortex/components/ui/Icon'
import type { BaseViewProps } from './types'

export function GalleryView({
  database,
  activeView,
  filteredRecords,
  onOpenEditRecord,
  onOpenNewRecord,
}: BaseViewProps) {
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
            onClick={() => onOpenEditRecord(record)}
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
                <Button size="sm" onClick={onOpenNewRecord}>
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
}
