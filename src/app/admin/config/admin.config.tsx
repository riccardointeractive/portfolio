import {
  Home,
  Settings,
  Palette,
  FolderOpen,
  User,
  Mail,
  ExternalLink,
  Camera,
  Upload,
  BarChart3,
  Database,
} from 'lucide-react'
import { type ToolCategory, type QuickLink } from '../types/admin.types'
import { siteConfig } from '@/config/site'
import { ROUTES } from '@/config/routes'

/**
 * Admin Navigation Items
 *
 * Defines the sidebar navigation structure.
 */
export interface AdminNavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
}

export const navigationItems: AdminNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    href: ROUTES.admin.root,
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: ROUTES.admin.projects,
    icon: <FolderOpen className="h-5 w-5" />,
  },
  {
    id: 'shots',
    label: 'Shots',
    href: ROUTES.admin.shots,
    icon: <Camera className="h-5 w-5" />,
  },
  {
    id: 'media',
    label: 'Media',
    href: ROUTES.admin.media,
    icon: <Upload className="h-5 w-5" />,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: ROUTES.admin.analytics,
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: 'cortex',
    label: 'Cortex',
    href: ROUTES.admin.cortex,
    icon: <Database className="h-5 w-5" />,
  },
  {
    id: 'design-system',
    label: 'Design System',
    href: ROUTES.admin.designSystem,
    icon: <Palette className="h-5 w-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: ROUTES.admin.settings,
    icon: <Settings className="h-5 w-5" />,
  },
]

/**
 * Admin Dashboard Tools (displayed as cards)
 */
export const tools: ToolCategory[] = [
  {
    category: 'Content Management',
    items: [
      {
        id: 'projects',
        title: 'Projects',
        description: 'Manage study cases — create, edit, and compose with the block builder.',
        icon: <FolderOpen className="h-5 w-5" />,
        href: ROUTES.admin.projects,
        status: 'active',
        badge: 'Active',
      },
      {
        id: 'shots',
        title: 'Shots',
        description: 'Manage visual content — images, videos, code snippets, animations.',
        icon: <Camera className="h-5 w-5" />,
        href: ROUTES.admin.shots,
        status: 'active',
        badge: 'Active',
      },
      {
        id: 'media',
        title: 'Media Library',
        description: 'Browse and manage all uploaded media files.',
        icon: <Upload className="h-5 w-5" />,
        href: ROUTES.admin.media,
        status: 'active',
        badge: 'Active',
      },
      {
        id: 'profile',
        title: 'Profile',
        description: 'Update your name, role, photo, and social links.',
        icon: <User className="h-5 w-5" />,
        href: ROUTES.admin.profile,
        status: 'coming',
        badge: 'Coming Soon',
      },
    ],
  },
  {
    category: 'Tools',
    items: [
      {
        id: 'cortex',
        title: 'Cortex',
        description: 'Notion-like database manager for structured data.',
        icon: <Database className="h-5 w-5" />,
        href: ROUTES.admin.cortex,
        status: 'active',
        badge: 'Active',
      },
    ],
  },
  {
    category: 'Design & Development',
    items: [
      {
        id: 'design-system',
        title: 'Design System',
        description: 'Preview all design tokens, colors, typography, and components.',
        icon: <Palette className="h-5 w-5" />,
        href: ROUTES.admin.designSystem,
        status: 'active',
        badge: 'Active',
      },
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'R2 storage and Supabase usage stats.',
        icon: <BarChart3 className="h-5 w-5" />,
        href: ROUTES.admin.analytics,
        status: 'active',
        badge: 'Active',
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Site configuration, metadata, and deployment settings.',
        icon: <Settings className="h-5 w-5" />,
        href: ROUTES.admin.settings,
        status: 'active',
        badge: 'Active',
      },
    ],
  },
]

/**
 * Quick Links on Dashboard
 */
export const quickLinks: QuickLink[] = [
  { title: 'Portfolio Site', url: ROUTES.home },
  { title: 'GitHub Repository', url: siteConfig.social.github },
  { title: 'LinkedIn', url: siteConfig.social.linkedin },
  { title: 'Send Email', url: `mailto:${siteConfig.email}` },
]

/**
 * Dashboard quick link icons
 */
export function getQuickLinkIcon(url: string) {
  if (url === ROUTES.home) return <ExternalLink className="h-4 w-4 text-tertiary" />
  if (url.includes('mailto')) return <Mail className="h-4 w-4 text-tertiary" />
  return <ExternalLink className="h-4 w-4 text-tertiary" />
}
