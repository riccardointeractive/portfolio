import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Container } from '@/components/layout/Container'
import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { Badge } from '@/components/ui/Badge'
import { getProjectBySlug, getAllProjectSlugs } from '@/lib/data/projects'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { imageSizes } from '@/config/image'
import { ROUTES } from '@/config/routes'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) return { title: 'Not Found' }

  return {
    title: `${project.title} — Riccardo Marconato`,
    description: project.description || undefined,
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) notFound()

  return (
    <article>
      {/* Hero */}
      <section className="py-[var(--section-padding)]">
        <Container className="flex flex-col gap-6">
          <a
            href={`/${ROUTES.anchors.projects}`}
            className="flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} />
            Back to projects
          </a>

          <div className="flex flex-col gap-4">
            <h1 className="font-display text-4xl tracking-tight text-primary sm:text-5xl">
              {project.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
              {project.client && <span>{project.client}</span>}
              {project.year && <span>{project.year}</span>}
              {project.role && <span>{project.role}</span>}
            </div>

            {project.description && (
              <p className="max-w-2xl text-lg text-secondary leading-relaxed">
                {project.description}
              </p>
            )}

            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Cover image */}
          {project.cover_image && (
            <div className="relative overflow-hidden rounded-xl aspect-[16/9]">
              <Image
                src={project.cover_image}
                alt={project.title}
                fill
                priority
                sizes={imageSizes.hero}
                className="object-cover"
              />
            </div>
          )}
        </Container>
      </section>

      {/* Blocks */}
      {project.blocks.length > 0 && (
        <section className="pb-[var(--section-padding)]">
          <Container className="flex flex-col gap-12 max-w-3xl mx-auto">
            {project.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </Container>
        </section>
      )}
    </article>
  )
}
