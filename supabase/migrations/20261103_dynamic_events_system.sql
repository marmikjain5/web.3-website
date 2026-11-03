-- =============================================================================
-- Migration: 20261103_dynamic_events_system.sql
-- Description: Dynamic Events Management & Dedicated Event Details System
-- Target: WEB.3 Club Website (BMSIT&M)
-- =============================================================================

-- 1. EXTEND public.events TABLE WITH DETAILS & STATUS COLUMNS
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    -- slug
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'slug') THEN
        ALTER TABLE public.events ADD COLUMN slug TEXT;
    END IF;

    -- short_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'short_description') THEN
        ALTER TABLE public.events ADD COLUMN short_description TEXT;
    END IF;

    -- detailed_description
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'detailed_description') THEN
        ALTER TABLE public.events ADD COLUMN detailed_description TEXT;
    END IF;

    -- banner_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'banner_url') THEN
        ALTER TABLE public.events ADD COLUMN banner_url TEXT;
    END IF;

    -- event_category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_category') THEN
        ALTER TABLE public.events ADD COLUMN event_category TEXT DEFAULT 'Hackathon';
    END IF;

    -- publication_status ('published' | 'draft')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'publication_status') THEN
        ALTER TABLE public.events ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'published';
    END IF;

    -- event_classification ('upcoming' | 'archived')
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_classification') THEN
        ALTER TABLE public.events ADD COLUMN event_classification TEXT NOT NULL DEFAULT 'upcoming';
    END IF;

    -- objectives
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'objectives') THEN
        ALTER TABLE public.events ADD COLUMN objectives JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- learning_outcomes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'learning_outcomes') THEN
        ALTER TABLE public.events ADD COLUMN learning_outcomes JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- ticker_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'ticker_items') THEN
        ALTER TABLE public.events ADD COLUMN ticker_items JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- announcements
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'announcements') THEN
        ALTER TABLE public.events ADD COLUMN announcements JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- resources
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'resources') THEN
        ALTER TABLE public.events ADD COLUMN resources JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- is_featured
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'is_featured') THEN
        ALTER TABLE public.events ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- sort_order
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'sort_order') THEN
        ALTER TABLE public.events ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 2. CREATE UNIQUE INDEX ON slug IF NOT EXISTS
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug_unique ON public.events(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_pub_class ON public.events(publication_status, event_classification);
CREATE INDEX IF NOT EXISTS idx_events_sort_order ON public.events(sort_order);

-- 3. CREATE CHILD TABLES FOR DYNAMIC MULTI-DAY SCHEDULE & CONTENT
-- -----------------------------------------------------------------------------

-- 3.1 Event Days
CREATE TABLE IF NOT EXISTS public.event_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL DEFAULT 1,
    label TEXT NOT NULL,
    heading TEXT NOT NULL,
    event_date TEXT NOT NULL,
    venue TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_days_event_sort ON public.event_days(event_id, sort_order);

-- 3.2 Event Sessions
CREATE TABLE IF NOT EXISTS public.event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id UUID NOT NULL REFERENCES public.event_days(id) ON DELETE CASCADE,
    time_slot TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_highlight BOOLEAN NOT NULL DEFAULT false,
    is_break BOOLEAN NOT NULL DEFAULT false,
    sub_topics TEXT[] DEFAULT '{}',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_sessions_day_sort ON public.event_sessions(day_id, sort_order);

-- 3.3 Event Gallery Images
CREATE TABLE IF NOT EXISTS public.event_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_gallery_event_sort ON public.event_gallery(event_id, sort_order);

-- 3.4 Event Speakers & Mentors
CREATE TABLE IF NOT EXISTS public.event_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    image_url TEXT,
    socials JSONB DEFAULT '{}'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_speakers_event_sort ON public.event_speakers(event_id, sort_order);

-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_speakers ENABLE ROW LEVEL SECURITY;

-- Helper check for admin role
-- (Assumes public.profiles has 'id' and 'role')

-- 4.1 public.events Policies
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
CREATE POLICY "Public can view published events"
    ON public.events FOR SELECT
    USING (publication_status = 'published');

DROP POLICY IF EXISTS "Admins have full access on events" ON public.events;
CREATE POLICY "Admins have full access on events"
    ON public.events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4.2 public.event_days Policies
DROP POLICY IF EXISTS "Public can view days of published events" ON public.event_days;
CREATE POLICY "Public can view days of published events"
    ON public.event_days FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_days.event_id AND e.publication_status = 'published'
        )
    );

DROP POLICY IF EXISTS "Admins have full access on event_days" ON public.event_days;
CREATE POLICY "Admins have full access on event_days"
    ON public.event_days FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4.3 public.event_sessions Policies
DROP POLICY IF EXISTS "Public can view sessions of published events" ON public.event_sessions;
CREATE POLICY "Public can view sessions of published events"
    ON public.event_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.event_days d
            JOIN public.events e ON e.id = d.event_id
            WHERE d.id = event_sessions.day_id AND e.publication_status = 'published'
        )
    );

DROP POLICY IF EXISTS "Admins have full access on event_sessions" ON public.event_sessions;
CREATE POLICY "Admins have full access on event_sessions"
    ON public.event_sessions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4.4 public.event_gallery Policies
DROP POLICY IF EXISTS "Public can view gallery of published events" ON public.event_gallery;
CREATE POLICY "Public can view gallery of published events"
    ON public.event_gallery FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_gallery.event_id AND e.publication_status = 'published'
        )
    );

DROP POLICY IF EXISTS "Admins have full access on event_gallery" ON public.event_gallery;
CREATE POLICY "Admins have full access on event_gallery"
    ON public.event_gallery FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 4.5 public.event_speakers Policies
DROP POLICY IF EXISTS "Public can view speakers of published events" ON public.event_speakers;
CREATE POLICY "Public can view speakers of published events"
    ON public.event_speakers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.events e
            WHERE e.id = event_speakers.event_id AND e.publication_status = 'published'
        )
    );

DROP POLICY IF EXISTS "Admins have full access on event_speakers" ON public.event_speakers;
CREATE POLICY "Admins have full access on event_speakers"
    ON public.event_speakers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 5. STORAGE BUCKET CONFIGURATION (event-images)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view images
DROP POLICY IF EXISTS "Public can view event-images" ON storage.objects;
CREATE POLICY "Public can view event-images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'event-images');

-- Storage RLS: Admins can upload/modify/delete event-images
DROP POLICY IF EXISTS "Admins can upload event-images" ON storage.objects;
CREATE POLICY "Admins can upload event-images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'event-images'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update event-images" ON storage.objects;
CREATE POLICY "Admins can update event-images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'event-images'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete event-images" ON storage.objects;
CREATE POLICY "Admins can delete event-images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'event-images'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- 6. IDEMPOTENT SEED & MIGRATION FOR DECRYPTO
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    v_event_id UUID;
    v_day1_id UUID;
    v_day2_id UUID;
    v_day3_id UUID;
BEGIN
    -- Check if DECRYPTO exists by title or slug
    SELECT id INTO v_event_id FROM public.events
    WHERE slug = 'decrypto' OR title ILIKE '%DECRYPTO%'
    LIMIT 1;

    IF v_event_id IS NULL THEN
        -- Insert new record
        INSERT INTO public.events (
            id,
            title,
            subtitle,
            slug,
            date,
            start_date,
            location,
            prize,
            tags,
            team_min,
            team_max,
            description,
            short_description,
            detailed_description,
            chain,
            sponsors,
            status,
            publication_status,
            event_classification,
            event_category,
            objectives,
            learning_outcomes,
            ticker_items,
            announcements,
            resources,
            is_featured,
            sort_order
        ) VALUES (
            gen_random_uuid(),
            'DECRYPTO',
            '2 day bootcamp + 1 day hackathon',
            'decrypto',
            'April 27-29, 2026',
            '2026-04-27T09:00:00+00:00',
            'APJ Abdul Kalam Lab, Lab Block, 4th Floor',
            '₹15,000',
            ARRAY['Bootcamp', 'Hackathon', 'WEB3', 'Solidity', 'Smart Contracts', 'dApps'],
            3,
            4,
            'Real-time logistics & participant guide. Everything you need for DECRYPTO — 27th to 29th April. Three intense days of hands-on blockchain development, smart contract deployment, and real-world project presentations.',
            '2 day bootcamp + 1 day hackathon covering Web3 fundamentals, Solidity, and DApp development.',
            'DECRYPTO is BMSIT&M''s premier Web3 bootcamp and student hackathon. Across three immersive days, builders learn blockchain fundamentals, master smart contract development with Solidity and Remix IDE, connect frontends using Web3.js, and build decentralized applications to compete for prizes.',
            'Ethereum',
            ARRAY['Alchemy', 'Base', 'Polygon', 'Solana', 'Chainlink'],
            'closed',
            'published',
            'archived',
            'Hackathon',
            '[
                "Introduce students to decentralized architecture and Web3 fundamentals",
                "Provide hands-on smart contract authoring experience in Solidity",
                "Equip participants to deploy live decentralized applications on testnets",
                "Host a 1-day collaborative hackathon to build working student prototypes"
            ]'::jsonb,
            '[
                {"title": "Web3 Basics", "sub": "Blockchain, Ethereum & how Web3 works", "accent": true},
                {"title": "Wallets", "sub": "MetaMask setup & crypto wallet fundamentals", "accent": false},
                {"title": "Smart Contracts", "sub": "Write & deploy contracts on Ethereum", "accent": false},
                {"title": "Solidity", "sub": "Basics of Solidity using Remix IDE", "accent": false},
                {"title": "DApp Dev", "sub": "Frontend-blockchain connection via Web3.js", "accent": false},
                {"title": "Build & Ship", "sub": "Deploy a real Mini DApp end-to-end", "accent": false}
            ]'::jsonb,
            '[
                "DECRYPTO",
                "27th–29th April",
                "What is Web3",
                "Wallets & MetaMask",
                "Smart Contracts",
                "Solidity Basics",
                "Deploy Your Own Contract",
                "More Updates Coming Soon"
            ]'::jsonb,
            '["DECRYPTO 2026 has concluded! Check out the archive schedule and curriculum below."]'::jsonb,
            '[
                {"title": "Remix Ethereum IDE", "url": "https://remix.ethereum.org", "type": "docs"},
                {"title": "Solidity Documentation", "url": "https://docs.soliditylang.org", "type": "docs"},
                {"title": "MetaMask Developer Portal", "url": "https://metamask.io", "type": "website"}
            ]'::jsonb,
            true,
            0
        ) RETURNING id INTO v_event_id;
    ELSE
        -- Update existing record with slug and details while preserving existing id, registrations & status
        UPDATE public.events
        SET
            slug = 'decrypto',
            publication_status = 'published',
            event_classification = 'archived',
            status = 'closed',
            location = 'APJ Abdul Kalam Lab, Lab Block, 4th Floor',
            short_description = COALESCE(short_description, '2 day bootcamp + 1 day hackathon covering Web3 fundamentals, Solidity, and DApp development.'),
            detailed_description = COALESCE(detailed_description, 'DECRYPTO is BMSIT&M''s premier Web3 bootcamp and student hackathon. Across three immersive days, builders learn blockchain fundamentals, master smart contract development with Solidity and Remix IDE, connect frontends using Web3.js, and build decentralized applications to compete for prizes.'),
            chain = COALESCE(chain, 'Ethereum'),
            event_category = COALESCE(event_category, 'Hackathon'),
            objectives = COALESCE(objectives, '[
                "Introduce students to decentralized architecture and Web3 fundamentals",
                "Provide hands-on smart contract authoring experience in Solidity",
                "Equip participants to deploy live decentralized applications on testnets",
                "Host a 1-day collaborative hackathon to build working student prototypes"
            ]'::jsonb),
            learning_outcomes = COALESCE(learning_outcomes, '[
                {"title": "Web3 Basics", "sub": "Blockchain, Ethereum & how Web3 works", "accent": true},
                {"title": "Wallets", "sub": "MetaMask setup & crypto wallet fundamentals", "accent": false},
                {"title": "Smart Contracts", "sub": "Write & deploy contracts on Ethereum", "accent": false},
                {"title": "Solidity", "sub": "Basics of Solidity using Remix IDE", "accent": false},
                {"title": "DApp Dev", "sub": "Frontend-blockchain connection via Web3.js", "accent": false},
                {"title": "Build & Ship", "sub": "Deploy a real Mini DApp end-to-end", "accent": false}
            ]'::jsonb),
            ticker_items = COALESCE(ticker_items, '[
                "DECRYPTO",
                "27th–29th April",
                "What is Web3",
                "Wallets & MetaMask",
                "Smart Contracts",
                "Solidity Basics",
                "Deploy Your Own Contract",
                "More Updates Coming Soon"
            ]'::jsonb),
            announcements = COALESCE(announcements, '["DECRYPTO 2026 has concluded! Check out the archive schedule and curriculum below."]'::jsonb),
            resources = COALESCE(resources, '[
                {"title": "Remix Ethereum IDE", "url": "https://remix.ethereum.org", "type": "docs"},
                {"title": "Solidity Documentation", "url": "https://docs.soliditylang.org", "type": "docs"},
                {"title": "MetaMask Developer Portal", "url": "https://metamask.io", "type": "website"}
            ]'::jsonb),
            is_featured = true,
            sort_order = 0
        WHERE id = v_event_id;
    END IF;

    -- Seed Days & Sessions if not already seeded
    IF NOT EXISTS (SELECT 1 FROM public.event_days WHERE event_id = v_event_id) THEN
        -- Day 1
        INSERT INTO public.event_days (event_id, day_number, label, heading, event_date, venue, sort_order)
        VALUES (v_event_id, 1, 'Day 1', 'Introduction & Fundamentals', '27 April 2026', 'APJ Abdul Kalam Lab, Lab Block, 4th Floor', 0)
        RETURNING id INTO v_day1_id;

        INSERT INTO public.event_sessions (day_id, time_slot, title, is_highlight, is_break, sub_topics, sort_order) VALUES
        (v_day1_id, '08:30–09:00', 'Check-in', false, false, '{}', 0),
        (v_day1_id, '09:00–10:20', 'Inauguration & Welcome Speeches', true, false, '{}', 1),
        (v_day1_id, '10:20–10:40', 'Tea Break & Networking', false, true, '{}', 2),
        (v_day1_id, '10:40–12:30', 'Session 1: Web3 Core Concepts', true, false, ARRAY['Web2 vs. Web3', 'Blockchain Basics', 'Ethereum, Wallets & MetaMask'], 3),
        (v_day1_id, '12:30–13:30', 'Lunch Break', false, true, '{}', 4),
        (v_day1_id, '13:30–15:30', 'Session 2: Smart Contracts & Solidity', true, false, ARRAY['Intro to Solidity & Structure', 'Using Remix IDE', 'Deploying your first contract'], 5),
        (v_day1_id, '15:30–16:00', 'Q&A and Wrap-up', false, false, '{}', 6);

        -- Day 2
        INSERT INTO public.event_days (event_id, day_number, label, heading, event_date, venue, sort_order)
        VALUES (v_event_id, 2, 'Day 2', 'Hands-on Development', '28 April 2026', 'APJ Abdul Kalam Lab, Lab Block, 4th Floor', 1)
        RETURNING id INTO v_day2_id;

        INSERT INTO public.event_sessions (day_id, time_slot, title, is_highlight, is_break, sub_topics, sort_order) VALUES
        (v_day2_id, '08:30–09:00', 'Check-in', false, false, '{}', 0),
        (v_day2_id, '09:00–09:20', 'Day 2 Briefing & Recap', false, false, '{}', 1),
        (v_day2_id, '09:20–10:20', 'Session 1: Solidity Workshop', true, false, ARRAY['Hands-on Solidity basics'], 2),
        (v_day2_id, '10:20–10:40', 'Tea Break', false, true, '{}', 3),
        (v_day2_id, '10:40–12:30', 'Session 2: DApp Architecture', true, false, ARRAY['Deploying Smart Contracts', 'Frontend-Blockchain connection', 'Introduction to Web3.js'], 4),
        (v_day2_id, '12:30–13:30', 'Lunch Break', false, true, '{}', 5),
        (v_day2_id, '13:30–15:30', 'Session 3: Demo Day', true, false, ARRAY['End-to-end Mini DApp deployment demo'], 6),
        (v_day2_id, '15:30–16:00', 'Q&A and Day 3 Instructions', false, false, '{}', 7);

        -- Day 3
        INSERT INTO public.event_days (event_id, day_number, label, heading, event_date, venue, sort_order)
        VALUES (v_event_id, 3, 'Day 3', 'Project & Presentations', '29 April 2026', 'APJ Abdul Kalam Lab, Lab Block, 4th Floor', 2)
        RETURNING id INTO v_day3_id;

        INSERT INTO public.event_sessions (day_id, time_slot, title, is_highlight, is_break, sub_topics, sort_order) VALUES
        (v_day3_id, '08:30–09:00', 'Check-in', false, false, '{}', 0),
        (v_day3_id, '09:00–10:20', 'Ideation & Project Starter Kit', true, false, '{}', 1),
        (v_day3_id, '10:20–10:40', 'Tea Break', false, true, '{}', 2),
        (v_day3_id, '10:40–12:30', 'Build Phase (Part 1)', true, false, ARRAY['Mini Project — Group or Individual'], 3),
        (v_day3_id, '12:30–13:30', 'Lunch Break', false, true, '{}', 4),
        (v_day3_id, '13:30–14:00', 'Build Phase (Part 2)', true, false, ARRAY['Finalize project work'], 5),
        (v_day3_id, '14:00–15:30', 'Final Project Presentation', true, false, '{}', 6),
        (v_day3_id, '15:30–16:10', 'Winners Announcement, Swag & Wrap-up', true, false, '{}', 7);
    END IF;
END $$;

