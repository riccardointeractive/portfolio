import { siteConfig } from '@/config/site'
import { COPY } from '@/config/copy'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'

export function About() {
  return (
    <section id="about" className="py-[var(--section-padding)] bg-surface">
      <Container className="flex flex-col gap-12">
        <div className="reveal flex flex-col gap-3">
          <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl">
            {COPY.sections.about.title}
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="reveal reveal-delay-1 flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-secondary">
              {siteConfig.bio}
            </p>
            <p className="leading-relaxed text-secondary">
              {COPY.sections.about.body}
            </p>
          </div>

          <div className="reveal reveal-delay-2 flex flex-col gap-4">
            <h3 className="text-sm font-medium tracking-wide text-tertiary uppercase">
              {COPY.sections.about.skillsLabel}
            </h3>
            <div className="flex flex-wrap gap-2">
              {siteConfig.skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
