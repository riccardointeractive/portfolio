import { ArrowUpRight } from 'lucide-react'
import { type Project } from '@/types'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-border-default bg-surface transition-all duration-300',
        'hover:-translate-y-1 hover:border-border-hover hover:shadow-lg',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-elevated">
        <div className="flex h-full items-center justify-center text-tertiary">
          <span className="font-display text-2xl font-semibold tracking-tight">
            {project.title}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-primary tracking-tight">
            {project.title}
          </h3>
          <ArrowUpRight
            size={18}
            className="mt-0.5 shrink-0 text-tertiary transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>

        <p className="text-sm leading-relaxed text-secondary">
          {project.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
          {project.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </div>
    </a>
  )
}
