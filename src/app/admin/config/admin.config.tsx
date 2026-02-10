import {
  Home,
  FileText,
  Settings,
  Palette,
  FolderOpen,
  User,
  Mail,
  ExternalLink,
} from 'lucide-react'
import { type ToolCategory, type QuickLink } from '../types/admin.types'
import { siteConfig } from '@/config/site'

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
    href: '/admin',
    icon: <Home className="h-5 w-5" />,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/admin/projects',
    icon: <FolderOpen className="h-5 w-5" />,
  },
  {
    id: 'content',
    label: 'Content',
    href: '/admin/content',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'design-system',
    label: 'Design System',
    href: '/admin/design-system',
    icon: <Palette className="h-5 w-5" />,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
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
        description: 'Manage portfolio projects, descriptions, tags, and links.',
        icon: <FolderOpen className="h-5 w-5" />,
        href: '/admin/projects',
        status: 'coming',
        badge: 'Coming Soon',
      },
      {
        id: 'content',
        title: 'Content',
        description: 'Edit site copy, bio, tagline, and contact information.',
        icon: <FileText className="h-5 w-5" />,
        href: '/admin/content',
        status: 'coming',
        badge: 'Coming Soon',
      },
      {
        id: 'profile',
        title: 'Profile',
        description: 'Update your name, role, photo, and social links.',
        icon: <User className="h-5 w-5" />,
        href: '/admin/profile',
        status: 'coming',
        badge: 'Coming Soon',
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
        href: '/admin/design-system',
        status: 'active',
        badge: 'Active',
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Site configuration, metadata, and deployment settings.',
        icon: <Settings className="h-5 w-5" />,
        href: '/admin/settings',
        status: 'coming',
        badge: 'Coming Soon',
      },
    ],
  },
]

/**
 * Quick Links on Dashboard
 */
export const quickLinks: QuickLink[] = [
  { title: 'Portfolio Site', url: '/' },
  { title: 'GitHub Repository', url: siteConfig.social.github },
  { title: 'LinkedIn', url: siteConfig.social.linkedin },
  { title: 'Send Email', url: `mailto:${siteConfig.email}` },
]

/**
 * Dashboard quick link icons
 */
export function getQuickLinkIcon(url: string) {
  if (url === '/') return <ExternalLink className="h-4 w-4 text-tertiary" />
  if (url.includes('mailto')) return <Mail className="h-4 w-4 text-tertiary" />
  return <ExternalLink className="h-4 w-4 text-tertiary" />
}
