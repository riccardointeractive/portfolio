import { projects } from '@/config/projects'
import { Container } from '@/components/layout/Container'
import { ProjectCard } from '@/components/ui/ProjectCard'

export function Projects() {
  return (
    <section id="projects" className="py-[var(--section-padding)]">
      <Container className="flex flex-col gap-12">
        <div className="reveal flex flex-col gap-3">
          <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl">
            Selected Projects
          </h2>
          <p className="max-w-lg text-secondary">
            A few things I&apos;ve designed and built — from DeFi platforms to tokenization systems.
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
