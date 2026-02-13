'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, Settings2 } from 'lucide-react'
import { AdminLoadingSpinner } from '@/app/admin/components/AdminLoadingSpinner'
import { BlockList } from '@/app/admin/components/builder/BlockList'
import { useBuilder } from '@/app/admin/hooks/useBuilder'
import { cn } from '@/lib/utils'
import type { ProjectStatus } from '@/types/content'

function BuilderContent({ projectId }: { projectId: string }) {
  const router = useRouter()
  const {
    project,
    blocks,
    isDirty,
    isSaving,
    isLoading,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    updateProject,
  } = useBuilder(projectId)

  if (isLoading) {
    return <AdminLoadingSpinner />
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-secondary">Project not found</p>
        <button
          onClick={() => router.push('/admin/projects')}
          className="mt-3 text-sm text-interactive hover:underline"
        >
          Back to projects
        </button>
      </div>
    )
  }

  const handleToggleStatus = () => {
    const newStatus: ProjectStatus = project.status === 'published' ? 'draft' : 'published'
    updateProject({ status: newStatus })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/projects')}
            className="rounded-lg p-1.5 transition-colors hover:bg-hover"
          >
            <ArrowLeft size={18} className="text-secondary" />
          </button>
          <div>
            <h1 className="font-display text-xl text-primary">{project.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-xs font-medium',
                  project.status === 'published'
                    ? 'bg-success-subtle text-success'
                    : 'bg-elevated text-tertiary'
                )}
              >
                {project.status === 'published' ? 'Published' : 'Draft'}
              </span>
              {/* Save indicator */}
              {isSaving ? (
                <span className="flex items-center gap-1 text-xs text-tertiary">
                  <Loader2 size={12} className="animate-spin" />
                  Saving...
                </span>
              ) : isDirty ? (
                <span className="text-xs text-tertiary">Unsaved changes</span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-tertiary">
                  <Check size={12} />
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/projects/new?edit=${projectId}`)}
            className="flex items-center gap-1.5 rounded-lg border border-default px-3 py-1.5 text-sm text-secondary transition-colors hover:bg-hover"
          >
            <Settings2 size={14} />
            Settings
          </button>
          <button
            onClick={handleToggleStatus}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              project.status === 'published'
                ? 'border border-default text-secondary hover:bg-hover'
                : 'bg-interactive text-white hover:bg-interactive-hover'
            )}
          >
            {project.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Block editor */}
      <div className="mx-auto w-full max-w-3xl">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-default py-16">
            <p className="text-sm text-secondary">This study case is empty</p>
            <p className="mt-1 text-xs text-tertiary">
              Add blocks to start building your case study
            </p>
          </div>
        ) : null}

        <BlockList
          blocks={blocks}
          onAddBlock={addBlock}
          onUpdateBlock={updateBlock}
          onDeleteBlock={deleteBlock}
          onReorderBlocks={reorderBlocks}
        />
      </div>
    </div>
  )
}

export default function BuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  return <BuilderContent projectId={id} />
}
