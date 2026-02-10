export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  url: string
  github?: string
  image: string
}

export interface NavItem {
  label: string
  href: string
}
