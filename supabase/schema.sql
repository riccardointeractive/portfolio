-- ============================================================================
-- Study Case Builder — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PROJECTS (create first — shots references this)
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  client TEXT,
  year INTEGER,
  role TEXT,
  description TEXT,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);
CREATE INDEX idx_projects_slug ON projects(slug);

-- ============================================================================
-- SHOTS
-- ============================================================================
CREATE TABLE shots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'code', 'animation')),
  media_url TEXT,
  thumbnail_url TEXT,
  aspect_ratio TEXT DEFAULT '16/9',
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_shots_published ON shots(published);
CREATE INDEX idx_shots_sort_order ON shots(sort_order);
CREATE INDEX idx_shots_slug ON shots(slug);

-- ============================================================================
-- PROJECT BLOCKS
-- ============================================================================
CREATE TABLE project_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN (
    'text', 'shot', 'media', 'compare', 'design-system', 'quote', 'video-embed'
  )),
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_blocks_project ON project_blocks(project_id);
CREATE INDEX idx_blocks_sort ON project_blocks(project_id, sort_order);

-- ============================================================================
-- MEDIA (tracks all uploads to R2)
-- ============================================================================
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER shots_updated_at BEFORE UPDATE ON shots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blocks_updated_at BEFORE UPDATE ON project_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE shots ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public read for published content (anon key)
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published');

CREATE POLICY "Public can read published shots"
  ON shots FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read blocks of published projects"
  ON project_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_blocks.project_id
      AND projects.status = 'published'
    )
  );

CREATE POLICY "Public can read media"
  ON media FOR SELECT
  USING (true);

-- Service role (used by admin API routes) bypasses RLS automatically.
