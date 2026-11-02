-- ============================================================================
-- WEB.3 GOOGLE FORMS SUBMISSION PORTAL MIGRATION
-- File: supabase/migrations/20261102_google_forms_submission_portal.sql
-- Dependency-Ordered Reconciliation, Strict Constraints & Definer View Security
-- ============================================================================

-- ============================================================================
-- SECTION 0: EARLY ENVIRONMENT & ROLE GUARDS
-- Fails immediately before any schema modifications if prerequisites are not met.
-- Requires: current_user = 'postgres' OR current_user is a superuser.
-- Verifies: PostgreSQL 15+, CREATE on public, ownership of existing target objects.
-- ============================================================================

DO $$
DECLARE
    v_server_version INT;
    v_is_superuser BOOLEAN;
    v_has_create_on_public BOOLEAN;
    v_obj RECORD;
    v_obj_owner TEXT;
BEGIN
    -- 1. Verify PostgreSQL version is 15.0 or higher (required for security_invoker view option)
    v_server_version := current_setting('server_version_num')::INT;
    IF v_server_version < 150000 THEN
        RAISE EXCEPTION 'PostgreSQL 15.0+ required (found server_version_num: %, version: %). Aborting before any schema changes.',
            v_server_version, current_setting('server_version');
    END IF;

    -- 2. Verify executing role is postgres or superuser
    SELECT rolsuper INTO v_is_superuser
    FROM pg_catalog.pg_roles
    WHERE rolname = current_user;

    IF current_user <> 'postgres' AND NOT COALESCE(v_is_superuser, false) THEN
        RAISE EXCEPTION 'Migration must be executed as "postgres" or as a superuser. Current user is "%". Aborting before any schema changes.',
            current_user;
    END IF;

    -- 3. Verify target owner role "postgres" exists
    IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        RAISE EXCEPTION 'Target owner role "postgres" does not exist. Aborting before any schema changes.';
    END IF;

    -- 4. Verify CREATE privilege on public schema
    v_has_create_on_public := pg_catalog.has_schema_privilege(current_user, 'public', 'CREATE');
    IF NOT v_has_create_on_public THEN
        RAISE EXCEPTION 'Role "%" lacks CREATE privilege on schema "public". Aborting before any schema changes.', current_user;
    END IF;

    -- 5. Verify ownership of existing target objects (tables, views, functions)
    --    The executing role must own them to ALTER ... OWNER TO postgres.
    FOR v_obj IN
        SELECT c.relname AS obj_name,
               c.relkind::text AS obj_kind,
               pg_catalog.pg_get_userbyid(c.relowner) AS obj_owner
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname IN ('submission_category_settings', 'submission_portal_config', 'public_submission_portal_settings')
    LOOP
        IF NOT COALESCE(v_is_superuser, false) AND v_obj.obj_owner <> current_user THEN
            RAISE EXCEPTION 'Relation "%" (relkind="%", owned by "%") cannot be altered by current user "%". Manual resolution required before migration.',
                v_obj.obj_name, v_obj.obj_kind, v_obj.obj_owner, current_user;
        END IF;
    END LOOP;

    -- 6. Verify existing is_admin() function ownership (if it exists)
    FOR v_obj IN
        SELECT pg_catalog.pg_get_userbyid(p.proowner) AS func_owner
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'is_admin'
          AND pg_catalog.pg_get_function_arguments(p.oid) = ''
    LOOP
        IF NOT COALESCE(v_is_superuser, false) AND v_obj.func_owner <> current_user THEN
            RAISE EXCEPTION 'Function public.is_admin() is owned by "%" but current user is "%". Cannot transfer ownership. Manual resolution required before migration.',
                v_obj.func_owner, current_user;
        END IF;
    END LOOP;
END $$;


-- ============================================================================
-- SECTION 1: PROFILES PREREQUISITE & SECURED ADMIN HELPER FUNCTION
-- ============================================================================

-- 1. Explicitly verify public.profiles table and auth.uid() function prerequisites
DO $$
DECLARE
    v_profiles_relkind CHAR;
    v_id_type TEXT;
    v_role_type TEXT;
BEGIN
    -- Verify auth.uid() function exists
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'auth' AND p.proname = 'uid'
    ) THEN
        RAISE EXCEPTION 'Prerequisite function auth.uid() does not exist in schema "auth". Cannot configure public.is_admin(). Aborting migration.';
    END IF;

    -- Verify public.profiles relation exists and is an ordinary table or view
    SELECT c.relkind INTO v_profiles_relkind
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles';

    IF v_profiles_relkind IS NULL THEN
        RAISE EXCEPTION 'Prerequisite table public.profiles does not exist. Cannot configure public.is_admin(). Aborting migration.';
    ELSIF v_profiles_relkind NOT IN ('r', 'v', 'p') THEN
        RAISE EXCEPTION 'Prerequisite public.profiles exists but has incompatible relation type (relkind="%", expected ordinary table "r"). Aborting migration.', v_profiles_relkind;
    END IF;

    -- Verify column "id" exists and has compatible type (uuid, text, varchar, char)
    -- All these types are supported by the id::text = auth.uid()::text comparison.
    SELECT data_type INTO v_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'id';

    IF v_id_type IS NULL THEN
        RAISE EXCEPTION 'Prerequisite table public.profiles exists but lacks required column "id". Cannot configure public.is_admin(). Aborting migration.';
    ELSIF v_id_type NOT IN ('uuid', 'text', 'character varying', 'character') THEN
        RAISE EXCEPTION 'Column "id" in public.profiles has incompatible type "%" (expected uuid, text, or varchar). Cannot configure public.is_admin(). Aborting migration.', v_id_type;
    END IF;

    -- Verify column "role" exists and has compatible type (text, varchar, enum)
    SELECT data_type INTO v_role_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role';

    IF v_role_type IS NULL THEN
        RAISE EXCEPTION 'Prerequisite table public.profiles exists but lacks required column "role". Cannot configure public.is_admin(). Aborting migration.';
    ELSIF v_role_type NOT IN ('text', 'character varying', 'character', 'USER-DEFINED') THEN
        RAISE EXCEPTION 'Column "role" in public.profiles has incompatible type "%" (expected text, varchar, or enum). Cannot configure public.is_admin(). Aborting migration.', v_role_type;
    END IF;
END $$;

-- 2. Function: public.is_admin()
-- Mode: SECURITY DEFINER STABLE
-- Search Path: Fixed to empty string ('') to eliminate unqualified lookup risks.
-- Schema Qualification: All tables, types, and functions are explicitly qualified.
-- Comparison:
--   - id::text = auth.uid()::text safely handles both UUID and text/varchar IDs without type mismatch errors.
--   - role::text = 'admin' safely compares text, varchar, and USER-DEFINED enum roles without enum label conversion errors.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id::text = auth.uid()::text
      AND role::text = 'admin'
  );
$$;

-- Establish explicit trusted ownership
ALTER FUNCTION public.is_admin() OWNER TO postgres;

-- Privilege Boundary: Revoke all public/anon execution; grant strictly to authenticated
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ============================================================================
-- SECTION 2: CATEGORY SETTINGS TABLE (RELATION CHECK, RECONCILIATION & PK AUDIT)
-- ============================================================================

-- 1. Verify relation type: if an object named submission_category_settings already exists
--    in public schema, it MUST be an ordinary table (relkind = 'r').
--    If it is a view, materialized view, or other incompatible type, stop immediately.
DO $$
DECLARE
    v_cat_relkind TEXT;
BEGIN
    SELECT c.relkind::text
    INTO v_cat_relkind
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'submission_category_settings';

    IF v_cat_relkind IS NOT NULL AND v_cat_relkind <> 'r' THEN
        RAISE EXCEPTION
            'Object public.submission_category_settings already exists with incompatible relation type (relkind=%). Expected an ordinary table (r).',
            v_cat_relkind;
    END IF;
END $$;

-- 2. Ensure table exists
CREATE TABLE IF NOT EXISTS public.submission_category_settings (
    category TEXT
);

-- 3. Establish explicit table ownership
ALTER TABLE public.submission_category_settings OWNER TO postgres;

-- 4. Verify key-column existence and compatibility on (category)
DO $$
DECLARE
    v_col_type TEXT;
    v_row_count INT;
BEGIN
    SELECT data_type INTO v_col_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'submission_category_settings'
      AND column_name = 'category';

    IF v_col_type IS NULL THEN
        SELECT count(*) INTO v_row_count FROM public.submission_category_settings;
        IF v_row_count = 0 THEN
            ALTER TABLE public.submission_category_settings ADD COLUMN category TEXT;
        ELSE
            RAISE EXCEPTION 'Table public.submission_category_settings exists with % rows but lacks "category" column. Cannot safely reconcile without manual schema intervention.', v_row_count;
        END IF;
    ELSIF v_col_type NOT IN ('text', 'character varying', 'character') THEN
        RAISE EXCEPTION 'Column "category" in public.submission_category_settings has incompatible type "%" (expected text or varchar). Cannot safely reconcile.', v_col_type;
    END IF;
END $$;

-- 5. Verify and reconcile Primary Key specifically on (category)
DO $$
DECLARE
    v_existing_pk TEXT;
    v_pk_columns TEXT[];
    v_null_count INT;
    v_dup_count INT;
BEGIN
    SELECT tc.constraint_name INTO v_existing_pk
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'submission_category_settings'
      AND tc.constraint_type = 'PRIMARY KEY';

    IF v_existing_pk IS NOT NULL THEN
        SELECT array_agg(kcu.column_name::TEXT ORDER BY kcu.ordinal_position)
        INTO v_pk_columns
        FROM information_schema.key_column_usage kcu
        WHERE kcu.table_schema = 'public'
          AND kcu.table_name = 'submission_category_settings'
          AND kcu.constraint_name = v_existing_pk;

        IF v_pk_columns <> ARRAY['category'] THEN
            RAISE EXCEPTION 'Table submission_category_settings has incompatible primary key % on column(s): %. Expected (category). Manual resolution required.',
                v_existing_pk, v_pk_columns;
        END IF;
    ELSE
        SELECT count(*) INTO v_null_count
        FROM public.submission_category_settings
        WHERE category IS NULL;

        IF v_null_count > 0 THEN
            RAISE EXCEPTION 'Cannot add PRIMARY KEY on submission_category_settings(category): found % rows with NULL category. Manual resolution required.', v_null_count;
        END IF;

        SELECT count(*) INTO v_dup_count FROM (
            SELECT category
            FROM public.submission_category_settings
            GROUP BY category
            HAVING count(*) > 1
        ) dups;

        IF v_dup_count > 0 THEN
            RAISE EXCEPTION 'Cannot add PRIMARY KEY on submission_category_settings(category): found duplicate category values. Manual resolution required.';
        END IF;

        ALTER TABLE public.submission_category_settings ADD PRIMARY KEY (category);
    END IF;
END $$;

-- 6. Safely add all required explicit columns if missing
ALTER TABLE public.submission_category_settings
    ADD COLUMN IF NOT EXISTS google_form_url TEXT,
    ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS left_heading TEXT,
    ADD COLUMN IF NOT EXISTS checklist_label_1 TEXT,
    ADD COLUMN IF NOT EXISTS checklist_label_2 TEXT,
    ADD COLUMN IF NOT EXISTS checklist_label_3 TEXT,
    ADD COLUMN IF NOT EXISTS checklist_label_4 TEXT,
    ADD COLUMN IF NOT EXISTS right_heading TEXT,
    ADD COLUMN IF NOT EXISTS right_subtitle TEXT,
    ADD COLUMN IF NOT EXISTS card1_heading TEXT,
    ADD COLUMN IF NOT EXISTS card1_desc TEXT,
    ADD COLUMN IF NOT EXISTS card2_heading TEXT,
    ADD COLUMN IF NOT EXISTS card2_desc TEXT,
    ADD COLUMN IF NOT EXISTS closing_text TEXT,
    ADD COLUMN IF NOT EXISTS cta_label TEXT,
    ADD COLUMN IF NOT EXISTS join_heading TEXT,
    ADD COLUMN IF NOT EXISTS join_subtitle TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;


-- ============================================================================
-- SECTION 3: SAFE CATEGORY SEED & NON-DESTRUCTIVE BACKFILL
-- ============================================================================

-- 1. Handle NULL is_open values safely before NOT NULL constraint is applied
UPDATE public.submission_category_settings
SET is_open = true
WHERE is_open IS NULL;

-- 2. Category-Specific Upsert & Backfill
-- Uses standard SQL NULLIF(pg_catalog.btrim(...), '') to treat whitespace-only as NULL.
-- Preserves all existing non-empty administrator copy by default.
-- Unexpected existing rows are NOT deleted.

-- Category 1: Project Proposal
INSERT INTO public.submission_category_settings (
    category, google_form_url, is_open,
    left_heading, checklist_label_1, checklist_label_2, checklist_label_3, checklist_label_4,
    right_heading, right_subtitle,
    card1_heading, card1_desc, card2_heading, card2_desc,
    closing_text, cta_label, join_heading, join_subtitle
)
VALUES (
    'project_proposal', NULL, true,
    'PROJECT PROPOSALS', 'TECHNICAL ARCHITECTURE', 'CODEBASE REVIEW', 'PEER COLLABORATION', 'CAMPUS DEMO',
    'STUDENT BUILDER TRACK', 'Peer feedback, technical reviews & campus demos for student projects',
    'TECHNICAL ARCHITECTURE', 'Get feedback on smart contracts, system design, and decentralized applications from fellow student builders.',
    'PEER COLLABORATION', 'Connect with student developers, testers, and co-builders across the BMSIT&M campus community.',
    'Submissions for student project proposals are currently paused. Follow our socials for the next cycle announcement.',
    'SUBMIT PROJECT PROPOSAL', 'STUDENT PROJECT PROPOSALS', 'Submit student-built Web3 projects for technical reviews, peer feedback, and community collaboration.'
)
ON CONFLICT (category) DO UPDATE
SET
    is_open = COALESCE(public.submission_category_settings.is_open, true),
    left_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.left_heading), ''), EXCLUDED.left_heading),
    checklist_label_1 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_1), ''), EXCLUDED.checklist_label_1),
    checklist_label_2 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_2), ''), EXCLUDED.checklist_label_2),
    checklist_label_3 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_3), ''), EXCLUDED.checklist_label_3),
    checklist_label_4 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_4), ''), EXCLUDED.checklist_label_4),
    right_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_heading), ''), EXCLUDED.right_heading),
    right_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_subtitle), ''), EXCLUDED.right_subtitle),
    card1_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_heading), ''), EXCLUDED.card1_heading),
    card1_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_desc), ''), EXCLUDED.card1_desc),
    card2_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_heading), ''), EXCLUDED.card2_heading),
    card2_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_desc), ''), EXCLUDED.card2_desc),
    closing_text = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.closing_text), ''), EXCLUDED.closing_text),
    cta_label = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.cta_label), ''), EXCLUDED.cta_label),
    join_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_heading), ''), EXCLUDED.join_heading),
    join_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_subtitle), ''), EXCLUDED.join_subtitle);

-- Category 2: Join a Project
INSERT INTO public.submission_category_settings (
    category, google_form_url, is_open,
    left_heading, checklist_label_1, checklist_label_2, checklist_label_3, checklist_label_4,
    right_heading, right_subtitle,
    card1_heading, card1_desc, card2_heading, card2_desc,
    closing_text, cta_label, join_heading, join_subtitle
)
VALUES (
    'join_project', NULL, true,
    'JOIN A PROJECT TEAM', 'OPEN ROLES', 'TEAM MATCHING', 'PEER REVIEWS', 'BUILD IN PUBLIC',
    'CONTRIBUTOR SQUAD', 'Join active student builder teams and ship production web3 projects',
    'CONTRIBUTOR PATHWAYS', 'Find open developer, designer, and researcher roles across student projects',
    'ACTIVE SHIP CULTURE', 'Collaborate, push commits, and build portfolio-grade decentralized apps',
    'Apply to join active student project teams building across Web3 ecosystems.',
    'APPLY FOR OPEN ROLES', 'BUILDER SQUAD APPLICATIONS', 'Match with ongoing student projects and collaborate with peer builders'
)
ON CONFLICT (category) DO UPDATE
SET
    is_open = COALESCE(public.submission_category_settings.is_open, true),
    left_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.left_heading), ''), EXCLUDED.left_heading),
    checklist_label_1 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_1), ''), EXCLUDED.checklist_label_1),
    checklist_label_2 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_2), ''), EXCLUDED.checklist_label_2),
    checklist_label_3 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_3), ''), EXCLUDED.checklist_label_3),
    checklist_label_4 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_4), ''), EXCLUDED.checklist_label_4),
    right_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_heading), ''), EXCLUDED.right_heading),
    right_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_subtitle), ''), EXCLUDED.right_subtitle),
    card1_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_heading), ''), EXCLUDED.card1_heading),
    card1_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_desc), ''), EXCLUDED.card1_desc),
    card2_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_heading), ''), EXCLUDED.card2_heading),
    card2_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_desc), ''), EXCLUDED.card2_desc),
    closing_text = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.closing_text), ''), EXCLUDED.closing_text),
    cta_label = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.cta_label), ''), EXCLUDED.cta_label),
    join_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_heading), ''), EXCLUDED.join_heading),
    join_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_subtitle), ''), EXCLUDED.join_subtitle);

-- Category 3: Events
INSERT INTO public.submission_category_settings (
    category, google_form_url, is_open,
    left_heading, checklist_label_1, checklist_label_2, checklist_label_3, checklist_label_4,
    right_heading, right_subtitle,
    card1_heading, card1_desc, card2_heading, card2_desc,
    closing_text, cta_label, join_heading, join_subtitle
)
VALUES (
    'events', NULL, true,
    'CAMPUS WORKSHOPS & TALKS', 'HANDS-ON BOOTCAMPS', 'GUEST SESSIONS', 'DEV WORKSHOPS', 'CERTIFICATIONS',
    'COMMUNITY SESSIONS', 'Hands-on technical workshops, guest lectures, and student developer meetups',
    'TECHNICAL BOOTCAMPS', 'Deep-dives into smart contracts, zero-knowledge proofs, and web3 architecture',
    'INDUSTRY SPEAKER TALKS', 'Interact with founders, protocols engineers, and ecosystem leaders',
    'Register for upcoming developer workshops, technical meetups, and campus seminars.',
    'REGISTER FOR EVENT', 'CAMPUS EVENT REGISTRATIONS', 'Sign up for hands-on technical sessions and community developer workshops'
)
ON CONFLICT (category) DO UPDATE
SET
    is_open = COALESCE(public.submission_category_settings.is_open, true),
    left_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.left_heading), ''), EXCLUDED.left_heading),
    checklist_label_1 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_1), ''), EXCLUDED.checklist_label_1),
    checklist_label_2 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_2), ''), EXCLUDED.checklist_label_2),
    checklist_label_3 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_3), ''), EXCLUDED.checklist_label_3),
    checklist_label_4 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_4), ''), EXCLUDED.checklist_label_4),
    right_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_heading), ''), EXCLUDED.right_heading),
    right_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_subtitle), ''), EXCLUDED.right_subtitle),
    card1_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_heading), ''), EXCLUDED.card1_heading),
    card1_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_desc), ''), EXCLUDED.card1_desc),
    card2_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_heading), ''), EXCLUDED.card2_heading),
    card2_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_desc), ''), EXCLUDED.card2_desc),
    closing_text = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.closing_text), ''), EXCLUDED.closing_text),
    cta_label = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.cta_label), ''), EXCLUDED.cta_label),
    join_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_heading), ''), EXCLUDED.join_heading),
    join_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_subtitle), ''), EXCLUDED.join_subtitle);

-- Category 4: Hackathons
INSERT INTO public.submission_category_settings (
    category, google_form_url, is_open,
    left_heading, checklist_label_1, checklist_label_2, checklist_label_3, checklist_label_4,
    right_heading, right_subtitle,
    card1_heading, card1_desc, card2_heading, card2_desc,
    closing_text, cta_label, join_heading, join_subtitle
)
VALUES (
    'hackathons', NULL, true,
    'HACKATHON DEPLOYMENT', 'SPRINT SQUADS', 'MENTOR GUIDANCE', 'PROTOTYPE DEMOS', 'PRIZE BOUNTIES',
    'BUILD SPRINT ARENA', 'Fast-paced weekend building sprints, bounties, and prototype showcases',
    'HACKATHON TEAMS', 'Form teams, brainstorm ideas, and build functional decentralized prototypes',
    'MENTOR CHECKPOINTS', 'Direct feedback from industry judges, protocol reps, and senior developers',
    'Submit your hackathon team application or register for the upcoming builder sprint.',
    'REGISTER FOR HACKATHON', 'HACKATHON BUILDER APPLICATIONS', 'Sign up your team for our fast-paced campus hackathons and sprint challenges'
)
ON CONFLICT (category) DO UPDATE
SET
    is_open = COALESCE(public.submission_category_settings.is_open, true),
    left_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.left_heading), ''), EXCLUDED.left_heading),
    checklist_label_1 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_1), ''), EXCLUDED.checklist_label_1),
    checklist_label_2 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_2), ''), EXCLUDED.checklist_label_2),
    checklist_label_3 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_3), ''), EXCLUDED.checklist_label_3),
    checklist_label_4 = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.checklist_label_4), ''), EXCLUDED.checklist_label_4),
    right_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_heading), ''), EXCLUDED.right_heading),
    right_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.right_subtitle), ''), EXCLUDED.right_subtitle),
    card1_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_heading), ''), EXCLUDED.card1_heading),
    card1_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card1_desc), ''), EXCLUDED.card1_desc),
    card2_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_heading), ''), EXCLUDED.card2_heading),
    card2_desc = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.card2_desc), ''), EXCLUDED.card2_desc),
    closing_text = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.closing_text), ''), EXCLUDED.closing_text),
    cta_label = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.cta_label), ''), EXCLUDED.cta_label),
    join_heading = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_heading), ''), EXCLUDED.join_heading),
    join_subtitle = COALESCE(NULLIF(pg_catalog.btrim(public.submission_category_settings.join_subtitle), ''), EXCLUDED.join_subtitle);


-- ============================================================================
-- SECTION 4: AUDIT ALL ROWS & ENFORCE STRICT CONSTRAINTS
-- ============================================================================

-- 1. Inspect every row (including unexpected/legacy category rows) for NULL or blank required content.
-- If an unexpected row is incomplete, raise a clear exception identifying the category and missing fields.
-- Does NOT delete rows or invent content.
DO $$
DECLARE
    r RECORD;
    v_missing_fields TEXT[];
BEGIN
    FOR r IN (SELECT * FROM public.submission_category_settings) LOOP
        v_missing_fields := ARRAY[]::TEXT[];

        IF r.is_open IS NULL THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'is_open');
        END IF;
        IF r.left_heading IS NULL OR pg_catalog.btrim(r.left_heading) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'left_heading');
        END IF;
        IF r.checklist_label_1 IS NULL OR pg_catalog.btrim(r.checklist_label_1) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'checklist_label_1');
        END IF;
        IF r.checklist_label_2 IS NULL OR pg_catalog.btrim(r.checklist_label_2) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'checklist_label_2');
        END IF;
        IF r.checklist_label_3 IS NULL OR pg_catalog.btrim(r.checklist_label_3) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'checklist_label_3');
        END IF;
        IF r.checklist_label_4 IS NULL OR pg_catalog.btrim(r.checklist_label_4) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'checklist_label_4');
        END IF;
        IF r.right_heading IS NULL OR pg_catalog.btrim(r.right_heading) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'right_heading');
        END IF;
        IF r.right_subtitle IS NULL OR pg_catalog.btrim(r.right_subtitle) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'right_subtitle');
        END IF;
        IF r.card1_heading IS NULL OR pg_catalog.btrim(r.card1_heading) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'card1_heading');
        END IF;
        IF r.card1_desc IS NULL OR pg_catalog.btrim(r.card1_desc) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'card1_desc');
        END IF;
        IF r.card2_heading IS NULL OR pg_catalog.btrim(r.card2_heading) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'card2_heading');
        END IF;
        IF r.card2_desc IS NULL OR pg_catalog.btrim(r.card2_desc) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'card2_desc');
        END IF;
        IF r.closing_text IS NULL OR pg_catalog.btrim(r.closing_text) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'closing_text');
        END IF;
        IF r.cta_label IS NULL OR pg_catalog.btrim(r.cta_label) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'cta_label');
        END IF;
        IF r.join_heading IS NULL OR pg_catalog.btrim(r.join_heading) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'join_heading');
        END IF;
        IF r.join_subtitle IS NULL OR pg_catalog.btrim(r.join_subtitle) = '' THEN
            v_missing_fields := pg_catalog.array_append(v_missing_fields, 'join_subtitle');
        END IF;

        IF pg_catalog.cardinality(v_missing_fields) > 0 THEN
            RAISE EXCEPTION 'Category "%" contains blank or NULL required content (field(s): %). Unexpected/unsupported category rows must be configured manually before applying NOT NULL constraints. Existing data will not be deleted or modified with invented content.',
                r.category, pg_catalog.array_to_string(v_missing_fields, ', ');
        END IF;
    END LOOP;
END $$;

-- 2. Apply NOT NULL constraints now that all rows are verified complete
ALTER TABLE public.submission_category_settings
    ALTER COLUMN is_open SET NOT NULL,
    ALTER COLUMN left_heading SET NOT NULL,
    ALTER COLUMN checklist_label_1 SET NOT NULL,
    ALTER COLUMN checklist_label_2 SET NOT NULL,
    ALTER COLUMN checklist_label_3 SET NOT NULL,
    ALTER COLUMN checklist_label_4 SET NOT NULL,
    ALTER COLUMN right_heading SET NOT NULL,
    ALTER COLUMN right_subtitle SET NOT NULL,
    ALTER COLUMN card1_heading SET NOT NULL,
    ALTER COLUMN card1_desc SET NOT NULL,
    ALTER COLUMN card2_heading SET NOT NULL,
    ALTER COLUMN card2_desc SET NOT NULL,
    ALTER COLUMN closing_text SET NOT NULL,
    ALTER COLUMN cta_label SET NOT NULL,
    ALTER COLUMN join_heading SET NOT NULL,
    ALTER COLUMN join_subtitle SET NOT NULL;

-- 3. Strict content length checks
ALTER TABLE public.submission_category_settings
    DROP CONSTRAINT IF EXISTS check_content_lengths;

ALTER TABLE public.submission_category_settings
    ADD CONSTRAINT check_content_lengths CHECK (
        pg_catalog.char_length(pg_catalog.btrim(left_heading)) > 0 AND pg_catalog.char_length(left_heading) <= 200 AND
        pg_catalog.char_length(pg_catalog.btrim(checklist_label_1)) > 0 AND pg_catalog.char_length(checklist_label_1) <= 60 AND
        pg_catalog.char_length(pg_catalog.btrim(checklist_label_2)) > 0 AND pg_catalog.char_length(checklist_label_2) <= 60 AND
        pg_catalog.char_length(pg_catalog.btrim(checklist_label_3)) > 0 AND pg_catalog.char_length(checklist_label_3) <= 60 AND
        pg_catalog.char_length(pg_catalog.btrim(checklist_label_4)) > 0 AND pg_catalog.char_length(checklist_label_4) <= 60 AND
        pg_catalog.char_length(pg_catalog.btrim(right_heading)) > 0 AND pg_catalog.char_length(right_heading) <= 200 AND
        pg_catalog.char_length(pg_catalog.btrim(right_subtitle)) > 0 AND pg_catalog.char_length(right_subtitle) <= 1000 AND
        pg_catalog.char_length(pg_catalog.btrim(card1_heading)) > 0 AND pg_catalog.char_length(card1_heading) <= 200 AND
        pg_catalog.char_length(pg_catalog.btrim(card1_desc)) > 0 AND pg_catalog.char_length(card1_desc) <= 500 AND
        pg_catalog.char_length(pg_catalog.btrim(card2_heading)) > 0 AND pg_catalog.char_length(card2_heading) <= 200 AND
        pg_catalog.char_length(pg_catalog.btrim(card2_desc)) > 0 AND pg_catalog.char_length(card2_desc) <= 500 AND
        pg_catalog.char_length(pg_catalog.btrim(closing_text)) > 0 AND pg_catalog.char_length(closing_text) <= 1000 AND
        pg_catalog.char_length(pg_catalog.btrim(cta_label)) > 0 AND pg_catalog.char_length(cta_label) <= 100 AND
        pg_catalog.char_length(pg_catalog.btrim(join_heading)) > 0 AND pg_catalog.char_length(join_heading) <= 200 AND
        pg_catalog.char_length(pg_catalog.btrim(join_subtitle)) > 0 AND pg_catalog.char_length(join_subtitle) <= 1000
    );

-- 4. Strict Google Forms URL regex check constraint
ALTER TABLE public.submission_category_settings
    DROP CONSTRAINT IF EXISTS check_google_form_url_format;

ALTER TABLE public.submission_category_settings
    ADD CONSTRAINT check_google_form_url_format CHECK (
        google_form_url IS NULL OR
        (
            pg_catalog.char_length(google_form_url) <= 500 AND
            google_form_url ~* '^https:\/\/(forms\.gle\/[a-zA-Z0-9_-]+|docs\.google\.com\/forms\/d\/(e\/)?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_#-]+)?)(\?[a-zA-Z0-9_=&%-]*)?$'
        )
    );


-- ============================================================================
-- SECTION 5: PORTAL CONFIG RECONCILIATION & ORDERED PK ESTABLISHMENT
-- ============================================================================

-- 1. Verify relation type: if an object named submission_portal_config already exists
--    in public schema, it MUST be an ordinary table (relkind = 'r').
--    If it is a view, materialized view, or other incompatible type, stop immediately.
DO $$
DECLARE
    v_config_relkind TEXT;
BEGIN
    SELECT c.relkind::text
    INTO v_config_relkind
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'submission_portal_config';

    IF v_config_relkind IS NOT NULL AND v_config_relkind <> 'r' THEN
        RAISE EXCEPTION
            'Object public.submission_portal_config already exists with incompatible relation type (relkind=%). Expected an ordinary table (r).',
            v_config_relkind;
    END IF;
END $$;

-- 2. Ensure table exists
CREATE TABLE IF NOT EXISTS public.submission_portal_config (
    id TEXT
);

-- 3. Establish explicit table ownership
ALTER TABLE public.submission_portal_config OWNER TO postgres;

-- 4. Verify key-column existence and compatibility on (id)
DO $$
DECLARE
    v_col_type TEXT;
    v_row_count INT;
BEGIN
    SELECT data_type INTO v_col_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'submission_portal_config'
      AND column_name = 'id';

    IF v_col_type IS NULL THEN
        SELECT count(*) INTO v_row_count FROM public.submission_portal_config;
        IF v_row_count = 0 THEN
            ALTER TABLE public.submission_portal_config ADD COLUMN id TEXT;
        ELSIF v_row_count = 1 THEN
            ALTER TABLE public.submission_portal_config ADD COLUMN id TEXT DEFAULT 'portal_config';
        ELSE
            RAISE EXCEPTION 'Table public.submission_portal_config exists with % rows but lacks "id" column. Cannot safely reconcile without manual schema intervention.', v_row_count;
        END IF;
    ELSIF v_col_type NOT IN ('text', 'character varying', 'character') THEN
        RAISE EXCEPTION 'Column "id" in public.submission_portal_config has incompatible type "%" (expected text or varchar). Cannot safely reconcile.', v_col_type;
    END IF;
END $$;

-- 5. Safely add configuration columns if missing
ALTER TABLE public.submission_portal_config
    ADD COLUMN IF NOT EXISTS active_category TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 6. ORDERED STEP A: Inspect and Reconcile Row State BEFORE Adding Constraints
DO $$
DECLARE
    v_total_count INT;
    v_single_id TEXT;
    v_single_active TEXT;
BEGIN
    SELECT count(*) INTO v_total_count FROM public.submission_portal_config;

    IF v_total_count = 0 THEN
        INSERT INTO public.submission_portal_config (id, active_category)
        VALUES ('portal_config', 'project_proposal');

    ELSIF v_total_count = 1 THEN
        SELECT id, active_category INTO v_single_id, v_single_active
        FROM public.submission_portal_config;

        IF v_single_id IS NULL OR v_single_id <> 'portal_config' THEN
            UPDATE public.submission_portal_config SET id = 'portal_config';
        END IF;

        IF v_single_active IS NULL OR v_single_active NOT IN ('project_proposal', 'join_project', 'events', 'hackathons') THEN
            UPDATE public.submission_portal_config SET active_category = 'project_proposal';
        END IF;

    ELSE
        RAISE EXCEPTION 'Table submission_portal_config contains % rows. Expected a singleton. Manual reconciliation required to consolidate rows before applying primary key.', v_total_count;
    END IF;
END $$;

-- 7. ORDERED STEP B: Establish Primary Key specifically on (id) AFTER Data Is Clean
DO $$
DECLARE
    v_existing_pk TEXT;
    v_pk_columns TEXT[];
BEGIN
    SELECT tc.constraint_name INTO v_existing_pk
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'submission_portal_config'
      AND tc.constraint_type = 'PRIMARY KEY';

    IF v_existing_pk IS NOT NULL THEN
        SELECT array_agg(kcu.column_name::TEXT ORDER BY kcu.ordinal_position)
        INTO v_pk_columns
        FROM information_schema.key_column_usage kcu
        WHERE kcu.table_schema = 'public'
          AND kcu.table_name = 'submission_portal_config'
          AND kcu.constraint_name = v_existing_pk;

        IF v_pk_columns <> ARRAY['id'] THEN
            RAISE EXCEPTION 'Table submission_portal_config has incompatible primary key % on column(s): %. Expected (id). Manual resolution required.',
                v_existing_pk, v_pk_columns;
        END IF;
    ELSE
        ALTER TABLE public.submission_portal_config ADD PRIMARY KEY (id);
    END IF;
END $$;

-- 8. ORDERED STEP C: Enforce Singleton & Active Category Constraints
ALTER TABLE public.submission_portal_config
    DROP CONSTRAINT IF EXISTS check_portal_config_singleton;

ALTER TABLE public.submission_portal_config
    ADD CONSTRAINT check_portal_config_singleton CHECK (id = 'portal_config');

ALTER TABLE public.submission_portal_config
    DROP CONSTRAINT IF EXISTS check_portal_config_active_category;

ALTER TABLE public.submission_portal_config
    ADD CONSTRAINT check_portal_config_active_category
    CHECK (active_category IN ('project_proposal', 'join_project', 'events', 'hackathons'));

ALTER TABLE public.submission_portal_config
    ALTER COLUMN active_category SET NOT NULL;

-- Foreign Key to submission_category_settings(category)
ALTER TABLE public.submission_portal_config
    DROP CONSTRAINT IF EXISTS fk_portal_config_active_category;

ALTER TABLE public.submission_portal_config
    ADD CONSTRAINT fk_portal_config_active_category
    FOREIGN KEY (active_category) REFERENCES public.submission_category_settings(category);


-- ============================================================================
-- SECTION 6: RESTRICTED PUBLIC VIEW & PRE-DROP RELATION CHECK
-- ============================================================================

-- 1. Inspect pg_class for ANY object named public_submission_portal_settings in public schema.
DO $$
DECLARE
    v_view_oid OID;
    v_view_relkind TEXT;
    v_view_dependents TEXT;
BEGIN
    SELECT c.oid, c.relkind::text
    INTO v_view_oid, v_view_relkind
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'public_submission_portal_settings';

    IF v_view_oid IS NOT NULL THEN

        IF v_view_relkind <> 'v' THEN
            RAISE EXCEPTION
                'Object public.public_submission_portal_settings exists with incompatible relation type (relkind=%). Expected a view (v).',
                v_view_relkind;
        END IF;

        SELECT pg_catalog.string_agg(
            CASE
                WHEN d.classid = 'pg_catalog.pg_class'::regclass
                    THEN 'Relation ' || dep_c.relname
                WHEN d.classid = 'pg_catalog.pg_rewrite'::regclass
                    THEN 'Rule ' || dep_rw.rulename || ' on ' || rw_c.relname
                ELSE
                    'Object ' || d.classid::regclass::text ||
                    ' (oid: ' || d.objid::text || ')'
            END,
            ', '
        )
        INTO v_view_dependents
        FROM pg_catalog.pg_depend d
        LEFT JOIN pg_catalog.pg_class dep_c
            ON dep_c.oid = d.objid
            AND d.classid = 'pg_catalog.pg_class'::regclass
        LEFT JOIN pg_catalog.pg_rewrite dep_rw
            ON dep_rw.oid = d.objid
            AND d.classid = 'pg_catalog.pg_rewrite'::regclass
        LEFT JOIN pg_catalog.pg_class rw_c
            ON rw_c.oid = dep_rw.ev_class
        WHERE d.refobjid = v_view_oid
          AND d.deptype = 'n'
          AND NOT (
              d.classid = 'pg_catalog.pg_rewrite'::regclass
              AND dep_rw.ev_class = v_view_oid
          );

        IF v_view_dependents IS NOT NULL THEN
            RAISE EXCEPTION
                'Cannot drop public_submission_portal_settings: dependent objects exist (%). CASCADE is prohibited.',
                v_view_dependents;
        END IF;

        EXECUTE 'DROP VIEW public.public_submission_portal_settings';
    END IF;
END $$;

-- 2. Create Public View with Security Definer Behavior (security_invoker = false)
CREATE VIEW public.public_submission_portal_settings
WITH (security_invoker = false)
AS
SELECT
    c.active_category,
    s.google_form_url,
    s.is_open,
    s.left_heading,
    s.checklist_label_1,
    s.checklist_label_2,
    s.checklist_label_3,
    s.checklist_label_4,
    s.right_heading,
    s.right_subtitle,
    s.card1_heading,
    s.card1_desc,
    s.card2_heading,
    s.card2_desc,
    s.closing_text,
    s.cta_label,
    s.join_heading,
    s.join_subtitle
FROM public.submission_portal_config c
JOIN public.submission_category_settings s ON s.category = c.active_category
WHERE c.id = 'portal_config';

-- Establish explicit view ownership matching base table owner
ALTER VIEW public.public_submission_portal_settings OWNER TO postgres;


-- ============================================================================
-- SECTION 7: EXPLICIT PRIVILEGE REVOCATIONS, COLUMN CLEANUP & MINIMAL GRANTS
-- ============================================================================

-- 1. Purge table-level base-table privileges across standard roles
REVOKE ALL ON TABLE public.submission_category_settings FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.submission_portal_config FROM PUBLIC, anon, authenticated;

-- 2. Inspect and purge all surviving column-level privileges for PUBLIC, anon, and authenticated
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT DISTINCT table_schema, table_name, column_name, grantee
        FROM information_schema.column_privileges
        WHERE table_schema = 'public'
          AND table_name IN ('submission_category_settings', 'submission_portal_config')
          AND grantee IN ('PUBLIC', 'anon', 'authenticated')
    LOOP
        IF r.grantee = 'PUBLIC' THEN
            EXECUTE pg_catalog.format(
                'REVOKE ALL (%I) ON TABLE %I.%I FROM PUBLIC',
                r.column_name,
                r.table_schema,
                r.table_name
            );
        ELSE
            EXECUTE pg_catalog.format(
                'REVOKE ALL (%I) ON TABLE %I.%I FROM %I',
                r.column_name,
                r.table_schema,
                r.table_name,
                r.grantee
            );
        END IF;
    END LOOP;
END $$;

-- 3. Public roles get SELECT access ONLY through the security definer view
REVOKE ALL ON public.public_submission_portal_settings FROM PUBLIC;
GRANT SELECT ON public.public_submission_portal_settings TO anon, authenticated;

-- 4. Authenticated role gets SELECT and UPDATE on base tables (filtered strictly by RLS)
GRANT SELECT, UPDATE ON TABLE public.submission_category_settings TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.submission_portal_config TO authenticated;

-- 5. Post-grant effective privilege assertion (detects inherited/leaked privileges across all 7 privileges)
DO $$
DECLARE
    v_tbl TEXT;
    v_priv TEXT;
    v_target_tables TEXT[] := ARRAY['public.submission_category_settings', 'public.submission_portal_config'];
    v_all_privs TEXT[] := ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'];
    v_disallowed_auth_privs TEXT[] := ARRAY['INSERT', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'];
BEGIN
    FOREACH v_tbl IN ARRAY v_target_tables LOOP
        -- (1) Verify anon has zero effective privileges across all 7 privilege types
        FOREACH v_priv IN ARRAY v_all_privs LOOP
            IF pg_catalog.has_table_privilege('anon', v_tbl, v_priv) THEN
                RAISE EXCEPTION 'Security assertion failed: role "anon" has unexpected effective privilege % on %. Check for inherited role privileges or PUBLIC grants.',
                    v_priv, v_tbl;
            END IF;
        END LOOP;

        -- (2) Verify authenticated has effective SELECT and UPDATE
        IF NOT pg_catalog.has_table_privilege('authenticated', v_tbl, 'SELECT') THEN
            RAISE EXCEPTION 'Security assertion failed: role "authenticated" lacks effective SELECT privilege on %.', v_tbl;
        END IF;

        IF NOT pg_catalog.has_table_privilege('authenticated', v_tbl, 'UPDATE') THEN
            RAISE EXCEPTION 'Security assertion failed: role "authenticated" lacks effective UPDATE privilege on %.', v_tbl;
        END IF;

        -- (3) Verify authenticated has NO other effective privileges (strictly SELECT and UPDATE only)
        FOREACH v_priv IN ARRAY v_disallowed_auth_privs LOOP
            IF pg_catalog.has_table_privilege('authenticated', v_tbl, v_priv) THEN
                RAISE EXCEPTION 'Security assertion failed: role "authenticated" has unexpected effective privilege % on %. Base tables must be restricted to SELECT and UPDATE only.',
                    v_priv, v_tbl;
            END IF;
        END LOOP;
    END LOOP;

    -- (4) Verify public view is readable by both anon and authenticated
    IF NOT pg_catalog.has_table_privilege('anon', 'public.public_submission_portal_settings', 'SELECT') THEN
        RAISE EXCEPTION 'Security assertion failed: role "anon" lacks effective SELECT on public.public_submission_portal_settings.';
    END IF;

    IF NOT pg_catalog.has_table_privilege('authenticated', 'public.public_submission_portal_settings', 'SELECT') THEN
        RAISE EXCEPTION 'Security assertion failed: role "authenticated" lacks effective SELECT on public.public_submission_portal_settings.';
    END IF;
END $$;


-- ============================================================================
-- SECTION 8: ROW LEVEL SECURITY & POLICY PURGE (AVOIDS PERMISSIVE 'OR' BYPASS)
-- ============================================================================

ALTER TABLE public.submission_category_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_portal_config ENABLE ROW LEVEL SECURITY;

-- Purge ALL existing policies on these two tables to avoid permissive OR collisions
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('submission_category_settings', 'submission_portal_config')
    LOOP
        EXECUTE pg_catalog.format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Policies: Only admin users (public.is_admin() = true) can SELECT or UPDATE base tables
CREATE POLICY "Admin select submission_category_settings"
    ON public.submission_category_settings FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admin update submission_category_settings"
    ON public.submission_category_settings FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admin select submission_portal_config"
    ON public.submission_portal_config FOR SELECT TO authenticated
    USING (public.is_admin());

CREATE POLICY "Admin update submission_portal_config"
    ON public.submission_portal_config FOR UPDATE TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
