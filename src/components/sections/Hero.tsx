import { ArrowDown } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Container } from '@/components/layout/Container'

export function Hero() {
  return (
    <section className="flex min-h-svh items-center pt-16">
      <Container className="flex flex-col gap-6 py-[var(--section-padding)]">
        <p className="reveal text-sm font-medium tracking-wide text-secondary uppercase">
          {siteConfig.role}
        </p>

        <h1 className="reveal reveal-delay-1 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-primary sm:text-5xl md:text-6xl lg:text-7xl">
          {siteConfig.tagline}
        </h1>

        <p className="reveal reveal-delay-2 max-w-xl text-lg leading-relaxed text-secondary">
          {siteConfig.bio}
        </p>

        <div className="reveal reveal-delay-3 flex items-center gap-4 pt-4">
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-base transition-all duration-200 hover:opacity-90"
          >
            View Projects
            <ArrowDown size={16} />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-border-default px-6 py-3 text-sm font-medium text-secondary transition-all duration-200 hover:border-border-hover hover:text-primary"
          >
            Get in Touch
          </a>
        </div>
      </Container>
    </section>
  )
}
