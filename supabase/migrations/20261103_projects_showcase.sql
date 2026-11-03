-- =====================================================================
-- WEB.3 PROJECTS SHOWCASE & SECTION CONFIGURATION MIGRATION
-- Migration: 20261103_projects_showcase.sql
-- Description:
--   1. Creates public.projects table for technology exploration entries
--      and actual student projects.
--   2. Creates public.projects_settings table for dynamic headline,
--      subtitle, and empty-state configuration.
--   3. Sets up Row Level Security (RLS) for public and admin roles.
--   4. Creates storage bucket 'project-images' with security policies.
--   5. Seeds the 6 initial technology exploration entries idempotently.
-- =====================================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL DEFAULT 'Technology Exploration',
  entry_type TEXT NOT NULL DEFAULT 'exploration' CHECK (entry_type IN ('exploration', 'project')),
  description TEXT NOT NULL,
  icon_name TEXT DEFAULT 'Layers',
  symbol TEXT DEFAULT '◆',
  image_url TEXT,
  banner_url TEXT,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  github_url TEXT,
  demo_url TEXT,
  docs_url TEXT,
  contributors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient ordering and queries
CREATE INDEX IF NOT EXISTS idx_projects_status_active_sort ON public.projects(status, is_active, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_entry_type ON public.projects(entry_type);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON public.projects(slug);

-- 2. Projects Section Settings Table
CREATE TABLE IF NOT EXISTS public.projects_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  heading TEXT NOT NULL DEFAULT 'OUR PROJECTS',
  subtitle TEXT NOT NULL DEFAULT 'EXPLORE. EXPERIMENT. CREATE.',
  empty_heading TEXT NOT NULL DEFAULT 'THE NEXT BIG IDEA STARTS HERE.',
  empty_description TEXT NOT NULL DEFAULT 'We''re creating a space for ideas, experiments and projects built by the WEB.3 community. Check back as our builders bring their ideas to life.',
  empty_status TEXT NOT NULL DEFAULT 'AWAITING FIRST BUILD',
  cta_text TEXT DEFAULT 'JOIN THE BUILDER SQUAD',
  cta_url TEXT DEFAULT '/join',
  show_cta BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Automatic updated_at Triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_projects_settings_updated_at ON public.projects_settings;
CREATE TRIGGER trg_projects_settings_updated_at
BEFORE UPDATE ON public.projects_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public read published and active projects" ON public.projects;
DROP POLICY IF EXISTS "Admins full access on projects" ON public.projects;
DROP POLICY IF EXISTS "Public read projects settings" ON public.projects_settings;
DROP POLICY IF EXISTS "Admins full access on projects_settings" ON public.projects_settings;

-- Public can read ONLY published and active projects
CREATE POLICY "Public read published and active projects"
  ON public.projects FOR SELECT
  USING (status = 'published' AND is_active = true);

-- Admins have full CRUD access on projects
CREATE POLICY "Admins full access on projects"
  ON public.projects FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public can read projects section settings
CREATE POLICY "Public read projects settings"
  ON public.projects_settings FOR SELECT
  USING (true);

-- Admins can update projects settings
CREATE POLICY "Admins full access on projects_settings"
  ON public.projects_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Storage Bucket Configuration for Project Images
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'project-images',
    'project-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
EXCEPTION
  WHEN OTHERS THEN
    -- If storage schema is managed externally, ignore error
    NULL;
END $$;

-- Storage RLS Policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read project images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins upload project images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins update project images" ON storage.objects;
  DROP POLICY IF EXISTS "Admins delete project images" ON storage.objects;

  CREATE POLICY "Public read project images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'project-images');

  CREATE POLICY "Admins upload project images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'project-images' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "Admins update project images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'project-images' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

  CREATE POLICY "Admins delete project images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'project-images' AND
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 6. Seed Default Section Settings
INSERT INTO public.projects_settings (
  id, heading, subtitle, empty_heading, empty_description, empty_status, cta_text, cta_url, show_cta
)
VALUES (
  'default',
  'OUR PROJECTS',
  'EXPLORE. EXPERIMENT. CREATE.',
  'THE NEXT BIG IDEA STARTS HERE.',
  'We''re creating a space for ideas, experiments and projects built by the WEB.3 community. Check back as our builders bring their ideas to life.',
  'AWAITING FIRST BUILD',
  'JOIN THE BUILDER SQUAD',
  '/join',
  true
)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Initial 6 Technology Exploration Entries
INSERT INTO public.projects (
  title, slug, category, entry_type, description, icon_name, symbol, tags, status, is_active, is_featured, sort_order
)
VALUES
(
  'BLOCKCHAIN',
  'blockchain',
  'Technology Exploration',
  'exploration',
  'Explore decentralized systems, smart contracts and on-chain applications.',
  'Blocks',
  '◆',
  ARRAY['Solidity', 'Smart Contracts', 'EVM', 'DApps'],
  'published',
  true,
  true,
  0
),
(
  'AI & MACHINE LEARNING',
  'ai-machine-learning',
  'Technology Exploration',
  'exploration',
  'Experiment with intelligent systems, generative AI and machine learning.',
  'BrainCircuit',
  '◎',
  ARRAY['LLMs', 'Machine Learning', 'Generative AI', 'Computer Vision'],
  'published',
  true,
  true,
  1
),
(
  'WEB DEVELOPMENT',
  'web-development',
  'Technology Exploration',
  'exploration',
  'Design and develop modern websites, applications and digital experiences.',
  'Code2',
  '❖',
  ARRAY['Next.js', 'TypeScript', 'React', 'Full Stack'],
  'published',
  true,
  false,
  2
),
(
  'CYBERSECURITY',
  'cybersecurity',
  'Technology Exploration',
  'exploration',
  'Discover application security, ethical hacking and digital protection.',
  'Shield',
  '▲',
  ARRAY['Application Security', 'Cryptography', 'Ethical Hacking', 'Security Auditing'],
  'published',
  true,
  false,
  3
),
(
  'HACKATHONS',
  'hackathons',
  'Technology Exploration',
  'exploration',
  'Collaborate, solve problems and turn ideas into working prototypes.',
  'Trophy',
  '⬡',
  ARRAY['Rapid Prototyping', 'Ideation', 'Team Collaboration', 'Innovation'],
  'published',
  true,
  false,
  4
),
(
  'OPEN SOURCE',
  'open-source',
  'Technology Exploration',
  'exploration',
  'Learn collaborative development and contribute to real-world codebases.',
  'GitBranch',
  '■',
  ARRAY['Git', 'GitHub', 'Collaboration', 'Community'],
  'published',
  true,
  false,
  5
)
ON CONFLICT (slug) DO NOTHING;

