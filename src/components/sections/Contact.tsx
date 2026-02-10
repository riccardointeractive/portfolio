import { Mail, Github, Linkedin, Twitter } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { Container } from '@/components/layout/Container'

const links = [
  { href: `mailto:${siteConfig.email}`, icon: Mail, label: siteConfig.email },
  { href: siteConfig.social.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.social.twitter, icon: Twitter, label: 'X / Twitter' },
]

export function Contact() {
  return (
    <section id="contact" className="py-[var(--section-padding)]">
      <Container className="flex flex-col items-center gap-8 text-center">
        <div className="reveal flex flex-col gap-3">
          <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl">
            Get in Touch
          </h2>
          <p className="max-w-md text-secondary">
            Interested in working together or just want to say hello? Drop me a line.
          </p>
        </div>

        <div className="reveal reveal-delay-1 flex flex-col items-center gap-4 sm:flex-row">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className="inline-flex items-center gap-2 rounded-full border border-border-default px-5 py-2.5 text-sm text-secondary transition-all duration-200 hover:border-border-hover hover:text-primary"
            >
              <link.icon size={16} />
              {link.label}
            </a>
          ))}
        </div>
      </Container>
    </section>
  )
}
