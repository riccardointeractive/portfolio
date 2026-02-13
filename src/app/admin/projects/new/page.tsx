'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  ProjectMetadataForm,
  type ProjectFormData,
} from '@/app/admin/components/ProjectMetadataForm'

function NewProjectContent() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (formData: ProjectFormData) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const project = await res.json()
        router.push(`/admin/projects/${project.id}/builder`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/projects')}
          className="rounded-lg p-1.5 transition-colors hover:bg-hover"
        >
          <ArrowLeft size={18} className="text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-2xl text-primary">New Project</h1>
          <p className="mt-1 text-sm text-secondary">
            Set up the project metadata, then build the study case.
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-default bg-surface p-6">
        <ProjectMetadataForm
          onSave={handleSave}
          onCancel={() => router.push('/admin/projects')}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}

export default function NewProjectPage() {
  return <NewProjectContent />
}
