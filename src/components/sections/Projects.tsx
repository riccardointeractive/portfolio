import { COPY } from '@/config/copy'
import { Container } from '@/components/layout/Container'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { getFeaturedProjectsWithFallback } from '@/lib/data/projects-fallback'

export async function Projects() {
  const projects = await getFeaturedProjectsWithFallback()

  return (
    <section id="projects" className="py-[var(--section-padding)]">
      <Container className="flex flex-col gap-12">
        <div className="reveal flex flex-col gap-3">
          <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl">
            {COPY.sections.projects.title}
          </h2>
          <p className="max-w-lg text-secondary">
            {COPY.sections.projects.description}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <div key={project.id} className={`reveal reveal-delay-${i + 1}`}>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
