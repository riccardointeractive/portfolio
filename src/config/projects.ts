import { type Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'digiko',
    title: 'Digiko',
    description:
      'A comprehensive DeFi platform on the Klever blockchain — DEX with AMM, liquidity pools, staking, NFT marketplace, gaming, and cross-chain bridge to Solana.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Klever SDK', 'Solana', 'Rust', 'Redis'],
    url: 'https://digiko.io',
    image: '/projects/digiko.png',
  },
  {
    id: 'movo',
    title: 'Movo',
    description:
      'Vehicle tokenization platform on Solana. Turn miles driven into on-chain income through GPS hardware integration and tokenized vehicle ownership.',
    tags: ['Next.js', 'TypeScript', 'Solana', 'Anchor', 'Rust', 'Tailwind CSS'],
    url: 'https://movo-finance.vercel.app',
    image: '/projects/movo.png',
  },
  {
    id: 'portfolio',
    title: 'This Portfolio',
    description:
      'My personal site, built with Next.js and designed with a precise token system. Clean, minimal, and fully theme-aware.',
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    url: 'https://riccardomarconato.com',
    image: '/projects/portfolio.png',
  },
]
