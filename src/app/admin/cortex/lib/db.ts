import { createAdminClient } from '@/lib/supabase/server'
import {
  DEFAULT_DATABASE_COLOR,
  type Database,
  type Field,
  type DatabaseRecord,
  type DatabaseView,
  type DashboardStats,
  type CortexData,
} from './types'
import { generateId } from './utils'

// ─── Database operations ────────────────────────────────────────

export async function getDatabases(): Promise<Database[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cortex_databases')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  if (!data) return []

  // Fetch fields, records, views for each database in parallel
  const databases = await Promise.all(
    data.map(async (db) => {
      const [fields, records, views] = await Promise.all([
        getFields(db.id),
        getRecords(db.id),
        getViews(db.id),
      ])
      return mapDatabase(db, fields, records, views)
    })
  )

  return databases
}

export async function getDatabase(id: string): Promise<Database | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cortex_databases')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const [fields, records, views] = await Promise.all([
    getFields(id),
    getRecords(id),
    getViews(id),
  ])

  return mapDatabase(data, fields, records, views)
}

export async function createDatabase(input: {
  name: string
  description?: string
  icon?: string
  color?: string
  fields?: Field[]
}): Promise<Database> {
  const supabase = createAdminClient()
  const id = generateId()
  const now = new Date().toISOString()

  const { error } = await supabase.from('cortex_databases').insert({
    id,
    name: input.name,
    description: input.description || '',
    icon: input.icon || 'folder',
    color: input.color || DEFAULT_DATABASE_COLOR,
    created_at: now,
    updated_at: now,
  })

  if (error) throw error

  // Insert fields if provided
  const fields: Field[] = []
  if (input.fields && input.fields.length > 0) {
    const fieldRows = input.fields.map((f, i) => ({
      id: f.id || generateId(),
      database_id: id,
      name: f.name,
      type: f.type,
      options: f.options || null,
      relation_config: f.relationConfig || null,
      required: f.required || false,
      sort_order: i,
    }))
    const { error: fieldErr } = await supabase
      .from('cortex_fields')
      .insert(fieldRows)
    if (fieldErr) throw fieldErr
    fields.push(
      ...fieldRows.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type as Field['type'],
        options: r.options || undefined,
        relationConfig: r.relation_config || undefined,
        required: r.required,
      }))
    )
  }

  // Create default "All" view
  const viewId = generateId()
  const { error: viewErr } = await supabase.from('cortex_views').insert({
    id: viewId,
    database_id: id,
    name: 'All',
    type: 'table',
    filters: [],
    sorts: [],
    visible_fields: fields.map((f) => f.id),
    config: null,
    sort_order: 0,
  })
  if (viewErr) throw viewErr

  return {
    id,
    name: input.name,
    description: input.description || '',
    icon: input.icon || 'folder',
    color: input.color || DEFAULT_DATABASE_COLOR,
    fields,
    records: [],
    views: [
      {
        id: viewId,
        name: 'All',
        type: 'table',
        filters: [],
        sorts: [],
        visibleFields: fields.map((f) => f.id),
      },
    ],
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateDatabase(
  id: string,
  updates: Partial<Pick<Database, 'name' | 'description' | 'icon' | 'color'>>
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('cortex_databases')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function deleteDatabase(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('cortex_databases')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ─── Field operations ───────────────────────────────────────────

async function getFields(databaseId: string): Promise<Field[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cortex_fields')
    .select('*')
    .eq('database_id', databaseId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(mapField)
}

export async function addField(
  databaseId: string,
  input: { name: string; type: string; options?: unknown[]; relationConfig?: { databaseId: string; multiple: boolean }; required?: boolean }
): Promise<Field> {
  const supabase = createAdminClient()

  // Get max sort_order
  const { data: existing } = await supabase
    .from('cortex_fields')
    .select('sort_order')
    .eq('database_id', databaseId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0
  const id = generateId()

  const { error } = await supabase.from('cortex_fields').insert({
    id,
    database_id: databaseId,
    name: input.name || 'New Field',
    type: input.type || 'text',
    options: input.options || null,
    relation_config: input.relationConfig || null,
    required: input.required || false,
    sort_order: sortOrder,
  })
  if (error) throw error

  // Add field to all views' visible_fields
  const { data: views } = await supabase
    .from('cortex_views')
    .select('id, visible_fields')
    .eq('database_id', databaseId)

  if (views) {
    await Promise.all(
      views.map((v) =>
        supabase
          .from('cortex_views')
          .update({
            visible_fields: [...(v.visible_fields as string[]), id],
          })
          .eq('id', v.id)
      )
    )
  }

  // Touch database updated_at
  await touchDatabase(databaseId)

  return {
    id,
    name: input.name || 'New Field',
    type: (input.type || 'text') as Field['type'],
    options: (input.options as Field['options']) || undefined,
    relationConfig: input.relationConfig || undefined,
    required: input.required || false,
  }
}

export async function updateField(
  databaseId: string,
  fieldId: string,
  updates: Partial<Field>
): Promise<Field | null> {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.options !== undefined) updateData.options = updates.options
  if (updates.relationConfig !== undefined) updateData.relation_config = updates.relationConfig
  if (updates.required !== undefined) updateData.required = updates.required

  const { data, error } = await supabase
    .from('cortex_fields')
    .update(updateData)
    .eq('id', fieldId)
    .eq('database_id', databaseId)
    .select()
    .single()

  if (error) throw error
  await touchDatabase(databaseId)
  return data ? mapField(data) : null
}

export async function deleteField(
  databaseId: string,
  fieldId: string
): Promise<void> {
  const supabase = createAdminClient()

  // Delete the field
  const { error } = await supabase
    .from('cortex_fields')
    .delete()
    .eq('id', fieldId)
    .eq('database_id', databaseId)

  if (error) throw error

  // Remove field from views' visible_fields, filters, sorts
  const { data: views } = await supabase
    .from('cortex_views')
    .select('*')
    .eq('database_id', databaseId)

  if (views) {
    await Promise.all(
      views.map((v) =>
        supabase
          .from('cortex_views')
          .update({
            visible_fields: (v.visible_fields as string[]).filter(
              (fid: string) => fid !== fieldId
            ),
            filters: (v.filters as { fieldId: string }[]).filter(
              (f: { fieldId: string }) => f.fieldId !== fieldId
            ),
            sorts: (v.sorts as { fieldId: string }[]).filter(
              (s: { fieldId: string }) => s.fieldId !== fieldId
            ),
          })
          .eq('id', v.id)
      )
    )
  }

  // Remove field value from all records
  const { data: records } = await supabase
    .from('cortex_records')
    .select('id, values')
    .eq('database_id', databaseId)

  if (records) {
    await Promise.all(
      records.map((r) => {
        const values = r.values as Record<string, unknown>
        const { [fieldId]: _, ...rest } = values
        return supabase
          .from('cortex_records')
          .update({ values: rest })
          .eq('id', r.id)
      })
    )
  }

  await touchDatabase(databaseId)
}

// ─── Record operations ──────────────────────────────────────────

async function getRecords(databaseId: string): Promise<DatabaseRecord[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cortex_records')
    .select('*')
    .eq('database_id', databaseId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(mapRecord)
}

export async function addRecord(
  databaseId: string,
  values: Record<string, unknown>
): Promise<DatabaseRecord> {
  const supabase = createAdminClient()

  // Get max sort_order
  const { data: existing } = await supabase
    .from('cortex_records')
    .select('sort_order')
    .eq('database_id', databaseId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0
  const id = generateId()
  const now = new Date().toISOString()

  const { error } = await supabase.from('cortex_records').insert({
    id,
    database_id: databaseId,
    values: values || {},
    sort_order: sortOrder,
    created_at: now,
    updated_at: now,
  })
  if (error) throw error

  await touchDatabase(databaseId)

  return {
    id,
    values: values || {},
    order: sortOrder,
    createdAt: now,
    updatedAt: now,
  }
}

export async function updateRecord(
  databaseId: string,
  recordId: string,
  values: Record<string, unknown>
): Promise<DatabaseRecord | null> {
  const supabase = createAdminClient()
  const now = new Date().toISOString()

  // Get existing record to merge values
  const { data: existing } = await supabase
    .from('cortex_records')
    .select('values')
    .eq('id', recordId)
    .single()

  const mergedValues = {
    ...(existing?.values as Record<string, unknown> || {}),
    ...values,
  }

  const { data, error } = await supabase
    .from('cortex_records')
    .update({ values: mergedValues, updated_at: now })
    .eq('id', recordId)
    .eq('database_id', databaseId)
    .select()
    .single()

  if (error) throw error
  await touchDatabase(databaseId)
  return data ? mapRecord(data) : null
}

export async function deleteRecord(
  databaseId: string,
  recordId: string
): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('cortex_records')
    .delete()
    .eq('id', recordId)
    .eq('database_id', databaseId)
  if (error) throw error
  await touchDatabase(databaseId)
}

export async function reorderRecords(
  databaseId: string,
  orderedIds: string[]
): Promise<void> {
  const supabase = createAdminClient()
  await Promise.all(
    orderedIds.map((recordId, index) =>
      supabase
        .from('cortex_records')
        .update({ sort_order: index })
        .eq('id', recordId)
        .eq('database_id', databaseId)
    )
  )
  await touchDatabase(databaseId)
}

// ─── View operations ────────────────────────────────────────────

async function getViews(databaseId: string): Promise<DatabaseView[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('cortex_views')
    .select('*')
    .eq('database_id', databaseId)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return (data || []).map(mapView)
}

export async function addView(
  databaseId: string,
  input: Partial<DatabaseView> & { cardsConfig?: unknown; todoConfig?: unknown; myDayConfig?: unknown }
): Promise<DatabaseView> {
  const supabase = createAdminClient()

  // Get max sort_order
  const { data: existing } = await supabase
    .from('cortex_views')
    .select('sort_order')
    .eq('database_id', databaseId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0
  const id = generateId()

  // Get all field IDs if visibleFields not provided
  let visibleFields = input.visibleFields || []
  if (visibleFields.length === 0) {
    const { data: fields } = await supabase
      .from('cortex_fields')
      .select('id')
      .eq('database_id', databaseId)
      .order('sort_order', { ascending: true })
    visibleFields = (fields || []).map((f) => f.id)
  }

  // Build config from specific config types
  const config = input.cardsConfig || input.todoConfig || input.myDayConfig || null

  const { error } = await supabase.from('cortex_views').insert({
    id,
    database_id: databaseId,
    name: input.name || 'New View',
    type: input.type || 'table',
    filters: input.filters || [],
    sorts: input.sorts || [],
    visible_fields: visibleFields,
    config,
    sort_order: sortOrder,
  })
  if (error) throw error

  await touchDatabase(databaseId)

  return {
    id,
    name: input.name || 'New View',
    type: (input.type || 'table') as DatabaseView['type'],
    filters: input.filters || [],
    sorts: input.sorts || [],
    visibleFields,
    ...(input.cardsConfig ? { cardsConfig: input.cardsConfig as DatabaseView['cardsConfig'] } : {}),
    ...(input.todoConfig ? { todoConfig: input.todoConfig as DatabaseView['todoConfig'] } : {}),
    ...(input.myDayConfig ? { myDayConfig: input.myDayConfig as DatabaseView['myDayConfig'] } : {}),
  }
}

export async function updateView(
  databaseId: string,
  viewId: string,
  updates: Partial<DatabaseView>
): Promise<DatabaseView | null> {
  const supabase = createAdminClient()

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.type !== undefined) updateData.type = updates.type
  if (updates.filters !== undefined) updateData.filters = updates.filters
  if (updates.sorts !== undefined) updateData.sorts = updates.sorts
  if (updates.visibleFields !== undefined) updateData.visible_fields = updates.visibleFields
  if (updates.cardsConfig !== undefined) updateData.config = updates.cardsConfig
  if (updates.todoConfig !== undefined) updateData.config = updates.todoConfig
  if (updates.myDayConfig !== undefined) updateData.config = updates.myDayConfig

  const { data, error } = await supabase
    .from('cortex_views')
    .update(updateData)
    .eq('id', viewId)
    .eq('database_id', databaseId)
    .select()
    .single()

  if (error) throw error
  await touchDatabase(databaseId)
  return data ? mapView(data) : null
}

export async function deleteView(
  databaseId: string,
  viewId: string
): Promise<boolean> {
  const supabase = createAdminClient()

  // Check if it's the last view
  const { count } = await supabase
    .from('cortex_views')
    .select('*', { count: 'exact', head: true })
    .eq('database_id', databaseId)

  if (count !== null && count <= 1) return false

  const { error } = await supabase
    .from('cortex_views')
    .delete()
    .eq('id', viewId)
    .eq('database_id', databaseId)

  if (error) throw error
  await touchDatabase(databaseId)
  return true
}

// ─── Dashboard stats ────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient()

  const [{ count: totalDatabases }, { count: totalRecords }, { data: recentDbs }] =
    await Promise.all([
      supabase
        .from('cortex_databases')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('cortex_records')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('cortex_databases')
        .select('id, name, icon, color, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5),
    ])

  // Get record counts per recent database
  const recentDatabases = await Promise.all(
    (recentDbs || []).map(async (db) => {
      const { count } = await supabase
        .from('cortex_records')
        .select('*', { count: 'exact', head: true })
        .eq('database_id', db.id)

      return {
        id: db.id,
        name: db.name,
        icon: db.icon,
        color: db.color,
        recordCount: count || 0,
        updatedAt: db.updated_at,
      }
    })
  )

  return {
    totalDatabases: totalDatabases || 0,
    totalRecords: totalRecords || 0,
    recentDatabases,
  }
}

// ─── Bulk data operations (import/export) ───────────────────────

export async function getAllData(): Promise<CortexData> {
  const databases = await getDatabases()
  return {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    databases,
  }
}

export async function importData(
  data: CortexData,
  merge: boolean = false
): Promise<void> {
  const supabase = createAdminClient()

  if (!merge) {
    // Clear all existing data
    await clearAllData()
  }

  for (const db of data.databases) {
    if (merge) {
      // Delete existing database with same ID if merging
      await supabase.from('cortex_databases').delete().eq('id', db.id)
    }

    // Insert database
    await supabase.from('cortex_databases').insert({
      id: db.id,
      name: db.name,
      description: db.description || '',
      icon: db.icon,
      color: db.color,
      created_at: db.createdAt,
      updated_at: db.updatedAt,
    })

    // Insert fields
    if (db.fields.length > 0) {
      await supabase.from('cortex_fields').insert(
        db.fields.map((f, i) => ({
          id: f.id,
          database_id: db.id,
          name: f.name,
          type: f.type,
          options: f.options || null,
          relation_config: f.relationConfig || null,
          required: f.required || false,
          sort_order: i,
        }))
      )
    }

    // Insert records
    if (db.records.length > 0) {
      await supabase.from('cortex_records').insert(
        db.records.map((r) => ({
          id: r.id,
          database_id: db.id,
          values: r.values,
          sort_order: r.order,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
        }))
      )
    }

    // Insert views
    if (db.views.length > 0) {
      await supabase.from('cortex_views').insert(
        db.views.map((v, i) => ({
          id: v.id,
          database_id: db.id,
          name: v.name,
          type: v.type,
          filters: v.filters,
          sorts: v.sorts,
          visible_fields: v.visibleFields,
          config: v.cardsConfig || v.todoConfig || v.myDayConfig || null,
          sort_order: i,
        }))
      )
    }
  }
}

export async function clearAllData(): Promise<void> {
  const supabase = createAdminClient()
  // Cascade deletes handle fields, records, views
  await supabase.from('cortex_databases').delete().neq('id', '')
}

// ─── Helpers ────────────────────────────────────────────────────

async function touchDatabase(id: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('cortex_databases')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDatabase(row: any, fields: Field[], records: DatabaseRecord[], views: DatabaseView[]): Database {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    icon: row.icon,
    color: row.color,
    fields,
    records,
    views,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapField(row: any): Field {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    options: row.options || undefined,
    relationConfig: row.relation_config || undefined,
    required: row.required || false,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRecord(row: any): DatabaseRecord {
  return {
    id: row.id,
    values: row.values || {},
    order: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapView(row: any): DatabaseView {
  const view: DatabaseView = {
    id: row.id,
    name: row.name,
    type: row.type,
    filters: row.filters || [],
    sorts: row.sorts || [],
    visibleFields: row.visible_fields || [],
  }

  // Map config to the correct type-specific config
  if (row.config) {
    if (row.type === 'cards') view.cardsConfig = row.config
    else if (row.type === 'todo') view.todoConfig = row.config
    else if (row.type === 'myday') view.myDayConfig = row.config
  }

  return view
}
