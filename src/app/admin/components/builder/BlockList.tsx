'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BlockWrapper } from './BlockWrapper'
import { AddBlockMenu } from './AddBlockMenu'
import { TextBlockEditor } from './blocks/TextBlockEditor'
import { ShotBlockEditor } from './blocks/ShotBlockEditor'
import { MediaBlockEditor } from './blocks/MediaBlockEditor'
import { CompareBlockEditor } from './blocks/CompareBlockEditor'
import { QuoteBlockEditor } from './blocks/QuoteBlockEditor'
import { VideoEmbedBlockEditor } from './blocks/VideoEmbedBlockEditor'
import { DesignSystemBlockEditor } from './blocks/DesignSystemBlockEditor'
import type {
  ProjectBlock,
  BlockType,
  BlockContent,
  TextBlockContent,
  ShotBlockContent,
  MediaBlockContent,
  CompareBlockContent,
  QuoteBlockContent,
  VideoEmbedBlockContent,
  DesignSystemBlockContent,
} from '@/types/content'

interface BlockListProps {
  blocks: ProjectBlock[]
  onAddBlock: (type: BlockType, content: BlockContent) => void
  onUpdateBlock: (blockId: string, content: BlockContent) => void
  onDeleteBlock: (blockId: string) => void
  onReorderBlocks: (blockIds: string[]) => void
}

function SortableBlock({
  block,
  onUpdate,
  onDelete,
}: {
  block: ProjectBlock
  onUpdate: (content: BlockContent) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const renderEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlockEditor
            content={block.content as TextBlockContent}
            onChange={onUpdate}
          />
        )
      case 'shot':
        return (
          <ShotBlockEditor
            content={block.content as ShotBlockContent}
            onChange={onUpdate}
          />
        )
      case 'media':
        return (
          <MediaBlockEditor
            content={block.content as MediaBlockContent}
            onChange={onUpdate}
          />
        )
      case 'compare':
        return (
          <CompareBlockEditor
            content={block.content as CompareBlockContent}
            onChange={onUpdate}
          />
        )
      case 'quote':
        return (
          <QuoteBlockEditor
            content={block.content as QuoteBlockContent}
            onChange={onUpdate}
          />
        )
      case 'video-embed':
        return (
          <VideoEmbedBlockEditor
            content={block.content as VideoEmbedBlockContent}
            onChange={onUpdate}
          />
        )
      case 'design-system':
        return (
          <DesignSystemBlockEditor
            content={block.content as DesignSystemBlockContent}
            onChange={onUpdate}
          />
        )
      default:
        return <p className="text-sm text-tertiary">Unknown block type</p>
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <BlockWrapper
        type={block.type}
        onDelete={onDelete}
        dragHandleProps={listeners}
      >
        {renderEditor()}
      </BlockWrapper>
    </div>
  )
}

export function BlockList({
  blocks,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
}: BlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = blocks.findIndex((b) => b.id === active.id)
    const newIndex = blocks.findIndex((b) => b.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = [...blocks]
    const [moved] = newOrder.splice(oldIndex, 1)
    newOrder.splice(newIndex, 0, moved)

    onReorderBlocks(newOrder.map((b) => b.id))
  }

  return (
    <div className="flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onUpdate={(content) => onUpdateBlock(block.id, content)}
              onDelete={() => onDeleteBlock(block.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <AddBlockMenu onAdd={onAddBlock} />
    </div>
  )
}
