/**
 * Routes — All page paths and API endpoints
 *
 * Single source of truth for every URL in the app.
 * Never hardcode a path string in a component or API route.
 */

export const ROUTES = {
  home: '/',
  project: (slug: string) => `/projects/${slug}`,

  anchors: {
    projects: '#projects',
    about: '#about',
    contact: '#contact',
  },

  admin: {
    root: '/admin',
    projects: '/admin/projects',
    projectNew: '/admin/projects/new',
    projectBuilder: (id: string) => `/admin/projects/${id}/builder`,
    projectEdit: (id: string) => `/admin/projects/new?edit=${id}`,
    shots: '/admin/shots',
    media: '/admin/media',
    analytics: '/admin/analytics',
    cortex: '/admin/cortex',
    cortexDatabases: '/admin/cortex/databases',
    cortexDatabase: (id: string) => `/admin/cortex/databases/${id}`,
    cortexRecord: (dbId: string, recordId: string) =>
      `/admin/cortex/databases/${dbId}/records/${recordId}`,
    designSystem: '/admin/design-system',
    settings: '/admin/settings',
    profile: '/admin/profile',
  },
} as const

export const API = {
  admin: {
    login: '/api/admin/login',
    logout: '/api/admin/logout',
    verifySession: '/api/admin/verify-session',
    projects: '/api/admin/projects',
    project: (id: string) => `/api/admin/projects/${id}`,
    projectBlocks: (id: string) => `/api/admin/projects/${id}/blocks`,
    projectBlock: (projectId: string, blockId: string) =>
      `/api/admin/projects/${projectId}/blocks/${blockId}`,
    projectBlocksReorder: (id: string) =>
      `/api/admin/projects/${id}/blocks/reorder`,
    shots: '/api/admin/shots',
    shot: (id: string) => `/api/admin/shots/${id}`,
    media: '/api/admin/media',
    upload: '/api/admin/upload',
    analytics: '/api/admin/analytics',
    cortex: {
      databases: '/api/admin/cortex/databases',
      database: (id: string) => `/api/admin/cortex/databases/${id}`,
      tmdb: '/api/admin/cortex/tmdb',
      setup: '/api/admin/cortex/setup',
      stats: '/api/admin/cortex/stats',
      dataImport: '/api/admin/cortex/data/import',
      dataExport: '/api/admin/cortex/data/export',
      dataClear: '/api/admin/cortex/data/clear',
    },
  },
} as const
