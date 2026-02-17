import { ROUTES } from './routes'

export const siteConfig = {
  name: 'Riccardo Marconato',
  title: 'Riccardo Marconato — Product Designer & Developer',
  description:
    'Product Designer and Developer building digital products at the intersection of design and technology.',
  url: 'https://riccardomarconato.com',
  role: 'Product Designer & Developer',
  tagline: 'Building digital products at the intersection of design and technology.',
  bio: 'I design and build digital products — from DeFi platforms to vehicle tokenization systems. I care about clean interfaces, solid architecture, and shipping things that work.',
  email: 'hello@riccardomarconato.com',
  social: {
    github: 'https://github.com/riccardomarconato',
    linkedin: 'https://linkedin.com/in/riccardomarconato',
    twitter: 'https://x.com/riccardomarconato',
  },
  skills: [
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
  ],
  nav: [
    { label: 'Projects', href: ROUTES.anchors.projects },
    { label: 'About', href: ROUTES.anchors.about },
    { label: 'Contact', href: ROUTES.anchors.contact },
  ],
} as const
