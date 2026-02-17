import { Github, Linkedin, Twitter } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { COPY } from '@/config/copy'
import { Container } from './Container'

const socialLinks = [
  { href: siteConfig.social.github, icon: Github, label: 'GitHub' },
  { href: siteConfig.social.linkedin, icon: Linkedin, label: 'LinkedIn' },
  { href: siteConfig.social.twitter, icon: Twitter, label: COPY.social.twitter },
]

export function Footer() {
  return (
    <footer className="border-t border-border-default py-8">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-tertiary">
          &copy; {new Date().getFullYear()} {siteConfig.name}
        </p>
        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tertiary transition-colors duration-200 hover:text-primary"
              aria-label={link.label}
            >
              <link.icon size={18} />
            </a>
          ))}
        </div>
      </Container>
    </footer>
  )
}
