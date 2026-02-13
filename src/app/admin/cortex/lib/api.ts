import type { Database, DatabaseRecord, DatabaseView, Field, CortexData, ApiResponse, DashboardStats } from './types'

async function fetchWithAuth<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'same-origin',
  })
  return res.json()
}

// Databases API
export const databasesApi = {
  list: () => fetchWithAuth<Database[]>('/api/admin/cortex/databases'),
  get: (id: string) => fetchWithAuth<Database>(`/api/admin/cortex/databases/${id}`),
  create: (data: { name: string; description?: string; icon?: string; color?: string; fields?: Field[] }) =>
    fetchWithAuth<Database>('/api/admin/cortex/databases', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Database>) =>
    fetchWithAuth<Database>(`/api/admin/cortex/databases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchWithAuth<void>(`/api/admin/cortex/databases/${id}`, { method: 'DELETE' }),
  // Record actions
  addRecord: (id: string, values: Record<string, unknown>) =>
    fetchWithAuth<DatabaseRecord>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'addRecord', values })
    }),
  updateRecord: (id: string, recordId: string, values: Record<string, unknown>) =>
    fetchWithAuth<DatabaseRecord>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateRecord', recordId, values })
    }),
  deleteRecord: (id: string, recordId: string) =>
    fetchWithAuth<void>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteRecord', recordId })
    }),
  reorderRecords: (id: string, orderedIds: string[]) =>
    fetchWithAuth<void>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'reorderRecords', orderedIds })
    }),
  // View actions
  addView: (id: string, view: Partial<DatabaseView>) =>
    fetchWithAuth<DatabaseView>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'addView', ...view })
    }),
  updateView: (id: string, viewId: string, updates: Partial<DatabaseView>) =>
    fetchWithAuth<DatabaseView>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateView', viewId, updates })
    }),
  deleteView: (id: string, viewId: string) =>
    fetchWithAuth<void>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteView', viewId })
    }),
  // Field actions
  addField: (id: string, field: { name: string; type: string; options?: unknown[]; relationConfig?: { databaseId: string; multiple: boolean } }) =>
    fetchWithAuth<Field>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'addField', ...field })
    }),
  updateField: (id: string, fieldId: string, updates: Partial<Field>) =>
    fetchWithAuth<Field>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'updateField', fieldId, updates })
    }),
  deleteField: (id: string, fieldId: string) =>
    fetchWithAuth<void>(`/api/admin/cortex/databases/${id}`, {
      method: 'POST',
      body: JSON.stringify({ action: 'deleteField', fieldId })
    }),
}

// Data API (import/export)
export const dataApi = {
  export: () => fetchWithAuth<CortexData>('/api/admin/cortex/data/export'),
  import: (data: CortexData, merge?: boolean) =>
    fetchWithAuth<void>('/api/admin/cortex/data/import', {
      method: 'POST',
      body: JSON.stringify({ data, merge })
    }),
  clear: () => fetchWithAuth<void>('/api/admin/cortex/data/clear', { method: 'POST' }),
}

// Dashboard API
export const dashboardApi = {
  stats: () => fetchWithAuth<DashboardStats>('/api/admin/cortex/stats'),
}
