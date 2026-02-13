'use client'

import { Globe, Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react'
import { PageHeader } from '@/app/admin/components/PageHeader'
import { SettingsSection } from '@/app/admin/components/SettingsSection'
import { SettingsField } from '@/app/admin/components/SettingsField'
import { EnvIndicator } from '@/app/admin/components/EnvIndicator'
import { siteConfig } from '@/config/site'

function SocialLink({
  icon: Icon,
  label,
  url,
}: {
  icon: React.ElementType
  label: string
  url: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-border-default px-4 py-3 transition-colors hover:bg-hover"
    >
      <Icon size={16} className="text-tertiary" />
      <div className="flex-1">
        <p className="text-sm font-medium text-primary">{label}</p>
        <p className="text-xs text-tertiary font-mono">{url}</p>
      </div>
      <ExternalLink size={14} className="text-tertiary" />
    </a>
  )
}

function SettingsContent() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Site configuration overview. Edit src/config/site.ts to update these values."
      />

      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {/* General */}
        <SettingsSection
          title="General"
          description="Core site identity and metadata"
        >
          <SettingsField label="Name" value={siteConfig.name} />
          <SettingsField label="Role" value={siteConfig.role} />
          <SettingsField label="Tagline" value={siteConfig.tagline} />
        </SettingsSection>

        {/* SEO */}
        <SettingsSection
          title="SEO & Metadata"
          description="Default meta tags for search engines"
        >
          <SettingsField label="Page Title" value={siteConfig.title} />
          <SettingsField label="Meta Description" value={siteConfig.description} />
          <SettingsField label="Site URL" value={siteConfig.url} mono />
        </SettingsSection>

        {/* Contact */}
        <SettingsSection title="Contact">
          <a
            href={`mailto:${siteConfig.email}`}
            className="flex items-center gap-3 rounded-lg border border-border-default px-4 py-3 transition-colors hover:bg-hover"
          >
            <Mail size={16} className="text-tertiary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary">Email</p>
              <p className="text-xs text-tertiary font-mono">{siteConfig.email}</p>
            </div>
          </a>
        </SettingsSection>

        {/* Social Links */}
        <SettingsSection
          title="Social Links"
          description="Public profile links shown in the footer"
        >
          <SocialLink icon={Github} label="GitHub" url={siteConfig.social.github} />
          <SocialLink icon={Linkedin} label="LinkedIn" url={siteConfig.social.linkedin} />
          <SocialLink icon={Twitter} label="X / Twitter" url={siteConfig.social.twitter} />
        </SettingsSection>

        {/* Navigation */}
        <SettingsSection
          title="Navigation"
          description="Header navigation items"
        >
          <div className="flex gap-2">
            {siteConfig.nav.map((item) => (
              <span
                key={item.label}
                className="rounded-lg border border-border-default bg-elevated px-3 py-1.5 text-sm text-secondary"
              >
                {item.label}
                <span className="ml-1.5 text-xs text-tertiary font-mono">
                  {item.href}
                </span>
              </span>
            ))}
          </div>
        </SettingsSection>

        {/* Environment */}
        <SettingsSection
          title="Environment"
          description="Infrastructure status"
        >
          <div className="grid grid-cols-2 gap-3">
            <EnvIndicator
              label="Supabase"
              connected={!!process.env.NEXT_PUBLIC_SUPABASE_URL}
            />
            <EnvIndicator
              label="Cloudflare R2"
              connected={!!process.env.NEXT_PUBLIC_R2_PUBLIC_URL}
            />
          </div>
        </SettingsSection>

        {/* Source file hint */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border-default px-4 py-3">
          <Globe size={14} className="text-tertiary" />
          <p className="text-xs text-tertiary">
            These settings are read-only. To modify, edit{' '}
            <code className="rounded bg-elevated px-1 py-0.5 font-mono text-xs">
              src/config/site.ts
            </code>{' '}
            and redeploy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return <SettingsContent />
}
