export interface AdminTool {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  href: string
  status: 'active' | 'coming'
  badge: string
}

export interface ToolCategory {
  category: string
  items: AdminTool[]
}

export interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
}

export interface QuickLink {
  title: string
  url: string
}

export interface SessionData {
  token: string
  createdAt: number
  expiresAt: number
}

export interface AuthResult {
  success: boolean
  message: string
  sessionToken?: string
}

export interface Session {
  createdAt: number
  expiresAt: number
  ip?: string
  userAgent?: string
}
