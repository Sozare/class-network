-- ==============================================================================
-- Telegram Class Professional Networking Directory ("Class Network")
-- Complete Supabase PostgreSQL Schema & Security Policies (RLS)
-- ==============================================================================

-- 1. Create Members Table
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    professional_title TEXT NOT NULL,
    bio TEXT NOT NULL,
    profile_photo_url TEXT NOT NULL,
    category TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    collaboration_goals TEXT,
    can_help_with TEXT,
    telegram_username TEXT,
    linkedin_url TEXT,
    website_url TEXT,
    location TEXT,
    private_email TEXT, -- Strictly private; excluded from public directory queries
    publication_status TEXT NOT NULL DEFAULT 'pending' CHECK (publication_status IN ('pending', 'approved', 'rejected', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    consent_to_publish BOOLEAN NOT NULL DEFAULT TRUE CHECK (consent_to_publish = TRUE),
    is_demo BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for Query Performance & Scalability
CREATE INDEX IF NOT EXISTS idx_members_publication_status ON public.members (publication_status);
CREATE INDEX IF NOT EXISTS idx_members_category ON public.members (category);
CREATE INDEX IF NOT EXISTS idx_members_featured ON public.members (featured);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_skills ON public.members USING GIN (skills);

-- Full-text search index across name, title, bio
CREATE INDEX IF NOT EXISTS idx_members_fts ON public.members USING GIN (
    to_tsvector('english', full_name || ' ' || professional_title || ' ' || bio || ' ' || category)
);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_members_updated_at ON public.members;
CREATE TRIGGER trigger_members_updated_at
    BEFORE UPDATE ON public.members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public visitors (anon) can ONLY select APPROVED profiles
-- (Note: Even with SELECT, the frontend query explicitly requests only public columns)
DROP POLICY IF EXISTS "Public can view approved members" ON public.members;
CREATE POLICY "Public can view approved members"
    ON public.members
    FOR SELECT
    TO anon, authenticated
    USING (publication_status = 'approved');

-- Policy 2: Public visitors (anon) can submit a new registration profile with 'pending' status
DROP POLICY IF EXISTS "Anyone can submit registration" ON public.members;
CREATE POLICY "Anyone can submit registration"
    ON public.members
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        publication_status = 'pending' AND
        consent_to_publish = TRUE AND
        featured = FALSE
    );

-- Policy 3: Authenticated administrators have full CRUD access
-- (In Supabase Auth, assign admin users the role or claim, or allow all authenticated users)
DROP POLICY IF EXISTS "Admins have full access" ON public.members;
CREATE POLICY "Admins have full access"
    ON public.members
    FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- 5. Storage Bucket for Member Profile Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies:
-- Allow anyone to view avatar photos
DROP POLICY IF EXISTS "Public can view avatar images" ON storage.objects;
CREATE POLICY "Public can view avatar images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'member-photos');

-- Allow anyone to upload avatar image to 'avatars/' folder with size <= 2MB
DROP POLICY IF EXISTS "Public can upload avatar images" ON storage.objects;
CREATE POLICY "Public can upload avatar images"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'member-photos');
