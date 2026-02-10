import { siteConfig } from '@/config/site'
import { Container } from '@/components/layout/Container'
import { Badge } from '@/components/ui/Badge'

const skills = [
  'React',
  'Next.js',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'Solana',
  'Rust',
  'Figma',
  'Framer',
  'Vercel',
  'Redis',
  'Web3',
]

export function About() {
  return (
    <section id="about" className="py-[var(--section-padding)] bg-surface">
      <Container className="flex flex-col gap-12">
        <div className="reveal flex flex-col gap-3">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            About
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <div className="reveal reveal-delay-1 flex flex-col gap-6">
            <p className="text-lg leading-relaxed text-secondary">
              {siteConfig.bio}
            </p>
            <p className="leading-relaxed text-secondary">
              I work across the full stack — from designing interfaces in Figma to writing smart contracts in Rust. I like building things that feel right: clear, fast, and purposeful.
            </p>
          </div>

          <div className="reveal reveal-delay-2 flex flex-col gap-4">
            <h3 className="text-sm font-medium tracking-wide text-tertiary uppercase">
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill}>{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
