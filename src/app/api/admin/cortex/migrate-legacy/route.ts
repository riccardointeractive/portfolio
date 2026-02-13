import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { verifyAdminRequest } from '@/lib/api/auth'
import { getDatabases, addRecord } from '@/app/admin/cortex/lib/db'

/**
 * POST /api/admin/cortex/migrate-legacy
 *
 * Reads legacy Redis keys (cortex-spheres, cortex-projects, cortex-tasks)
 * and merges them as new records into the existing Cortex databases
 * named "Spheres", "Projects", "Tasks" in Supabase.
 *
 * Each legacy entity is mapped to the appropriate fields of the target database.
 * Records with duplicate names are skipped to avoid double-inserts.
 */

interface LegacySphere {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  createdAt: string
  updatedAt: string
}

interface LegacyProject {
  id: string
  sphereId: string
  name: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

interface LegacyTask {
  id: string
  projectId: string
  title: string
  description?: string
  completed: boolean
  priority: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    // Read legacy data from Redis
    const [spheres, projects, tasks] = await Promise.all([
      redis.get<LegacySphere[]>('cortex-spheres'),
      redis.get<LegacyProject[]>('cortex-projects'),
      redis.get<LegacyTask[]>('cortex-tasks'),
    ])

    if (
      (!spheres || spheres.length === 0) &&
      (!projects || projects.length === 0) &&
      (!tasks || tasks.length === 0)
    ) {
      return NextResponse.json({
        success: true,
        data: { message: 'No legacy data found in Redis', migrated: { spheres: 0, projects: 0, tasks: 0 } },
      })
    }

    // Get existing Cortex databases from Supabase
    const databases = await getDatabases()
    const spheresDb = databases.find(db => db.name === 'Spheres')
    const projectsDb = databases.find(db => db.name === 'Projects')
    const tasksDb = databases.find(db => db.name === 'Tasks')

    const result = { spheres: 0, projects: 0, tasks: 0, skipped: 0, errors: [] as string[] }

    // --- Migrate Spheres ---
    if (spheres && spheres.length > 0 && spheresDb) {
      // Get existing record names to avoid duplicates
      const existingNames = new Set(
        spheresDb.records.map(r => {
          // Find the "name" field
          const nameField = spheresDb.fields.find(f => f.name.toLowerCase() === 'name')
          return nameField ? String(r.values[nameField.id] || '') : ''
        }).filter(Boolean)
      )

      const nameField = spheresDb.fields.find(f => f.name.toLowerCase() === 'name')

      for (const sphere of spheres) {
        if (existingNames.has(sphere.name)) {
          result.skipped++
          continue
        }

        try {
          const values: Record<string, unknown> = {}
          if (nameField) values[nameField.id] = sphere.name

          // Map other fields by name match
          for (const field of spheresDb.fields) {
            const key = field.name.toLowerCase()
            if (key === 'name') continue // already set
            if (key === 'description' && sphere.description) values[field.id] = sphere.description
            if (key === 'color') values[field.id] = sphere.color
            if (key === 'icon') values[field.id] = sphere.icon
          }

          await addRecord(spheresDb.id, values)
          result.spheres++
        } catch (err) {
          result.errors.push(`Sphere "${sphere.name}": ${err}`)
        }
      }
    } else if (spheres && spheres.length > 0 && !spheresDb) {
      result.errors.push('No "Spheres" database found in Supabase — cannot merge spheres')
    }

    // --- Migrate Projects ---
    if (projects && projects.length > 0 && projectsDb) {
      const existingNames = new Set(
        projectsDb.records.map(r => {
          const nameField = projectsDb.fields.find(f => f.name.toLowerCase() === 'name')
          return nameField ? String(r.values[nameField.id] || '') : ''
        }).filter(Boolean)
      )

      for (const project of projects) {
        if (existingNames.has(project.name)) {
          result.skipped++
          continue
        }

        try {
          const values: Record<string, unknown> = {}

          for (const field of projectsDb.fields) {
            const key = field.name.toLowerCase()
            if (key === 'name') values[field.id] = project.name
            if (key === 'description' && project.description) values[field.id] = project.description
            if (key === 'status') values[field.id] = project.status
            if (key === 'priority') values[field.id] = project.priority
            if (key === 'due date' || key === 'duedate' || key === 'due_date') values[field.id] = project.dueDate || ''
            // sphere relation — store the legacy sphereId, user can re-link manually
            if (key === 'sphere' || key === 'sphereid') values[field.id] = project.sphereId
          }

          await addRecord(projectsDb.id, values)
          result.projects++
        } catch (err) {
          result.errors.push(`Project "${project.name}": ${err}`)
        }
      }
    } else if (projects && projects.length > 0 && !projectsDb) {
      result.errors.push('No "Projects" database found in Supabase — cannot merge projects')
    }

    // --- Migrate Tasks ---
    if (tasks && tasks.length > 0 && tasksDb) {
      const existingNames = new Set(
        tasksDb.records.map(r => {
          const nameField = tasksDb.fields.find(f =>
            f.name.toLowerCase() === 'name' || f.name.toLowerCase() === 'title'
          )
          return nameField ? String(r.values[nameField.id] || '') : ''
        }).filter(Boolean)
      )

      for (const task of tasks) {
        if (existingNames.has(task.title)) {
          result.skipped++
          continue
        }

        try {
          const values: Record<string, unknown> = {}

          for (const field of tasksDb.fields) {
            const key = field.name.toLowerCase()
            if (key === 'name' || key === 'title') values[field.id] = task.title
            if (key === 'description' && task.description) values[field.id] = task.description
            if (key === 'completed' || key === 'done') values[field.id] = task.completed
            if (key === 'priority') values[field.id] = task.priority
            if (key === 'due date' || key === 'duedate' || key === 'due_date') values[field.id] = task.dueDate || ''
            if (key === 'project' || key === 'projectid') values[field.id] = task.projectId
          }

          await addRecord(tasksDb.id, values)
          result.tasks++
        } catch (err) {
          result.errors.push(`Task "${task.title}": ${err}`)
        }
      }
    } else if (tasks && tasks.length > 0 && !tasksDb) {
      result.errors.push('No "Tasks" database found in Supabase — cannot merge tasks')
    }

    return NextResponse.json({
      success: true,
      data: {
        migrated: result,
        summary: `Merged ${result.spheres} spheres, ${result.projects} projects, ${result.tasks} tasks. Skipped ${result.skipped} duplicates.`,
        ...(result.errors.length > 0 ? { errors: result.errors } : {}),
      },
    })
  } catch (error) {
    console.error('Legacy migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Legacy migration failed' },
      { status: 500 }
    )
  }
}
