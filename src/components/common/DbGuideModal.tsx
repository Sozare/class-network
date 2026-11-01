import React, { useState } from 'react';
import { Modal } from './Modal';
import { Database, Check, Copy, ExternalLink, Key } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface DbGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SQL_SCHEMA_SCRIPT = `-- ==============================================================================
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
    private_email TEXT, -- Never exposed publicly
    publication_status TEXT NOT NULL DEFAULT 'pending' CHECK (publication_status IN ('pending', 'approved', 'rejected', 'archived')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    consent_to_publish BOOLEAN NOT NULL DEFAULT TRUE CHECK (consent_to_publish = TRUE),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members (publication_status);
CREATE INDEX IF NOT EXISTS idx_members_category ON public.members (category);
CREATE INDEX IF NOT EXISTS idx_members_featured ON public.members (featured);
CREATE INDEX IF NOT EXISTS idx_members_skills ON public.members USING GIN (skills);

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

-- Policy A: Anyone (public anon visitors) can ONLY view APPROVED profiles
-- (Note: private_email is excluded at the query level or via view)
DROP POLICY IF EXISTS "Public can only read approved profiles" ON public.members;
CREATE POLICY "Public can only read approved profiles"
    ON public.members
    FOR SELECT
    TO anon, authenticated
    USING (publication_status = 'approved');

-- Policy B: Anyone (anon) can submit a new registration profile with 'pending' status
DROP POLICY IF EXISTS "Public can submit registration" ON public.members;
CREATE POLICY "Public can submit registration"
    ON public.members
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        publication_status = 'pending' AND
        consent_to_publish = TRUE AND
        featured = FALSE
    );

-- Policy C: Authenticated admin users have full access to moderate, edit, and delete
DROP POLICY IF EXISTS "Admins have full access" ON public.members;
CREATE POLICY "Admins have full access"
    ON public.members
    FOR ALL
    TO authenticated
    USING (TRUE)
    WITH CHECK (TRUE);

-- 5. Storage Bucket Configuration for Member Photos
-- In Supabase dashboard -> Storage, create a public bucket named 'member-photos'
INSERT INTO storage.buckets (id, name, public)
VALUES ('member-photos', 'member-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket Policies
DROP POLICY IF EXISTS "Public can view member photos" ON storage.objects;
CREATE POLICY "Public can view member photos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'member-photos');

DROP POLICY IF EXISTS "Anyone can upload member photo" ON storage.objects;
CREATE POLICY "Anyone can upload member photo"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'member-photos');
`;

export const DbGuideModal: React.FC<DbGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2 text-slate-900">
          <Database className="w-5 h-5 text-sky-600" />
          Supabase Free Tier Setup & SQL Script
        </span>
      }
      subtitle="Complete instructions to connect your free production database."
      maxWidth="3xl"
    >
      <div className="space-y-6 pt-1 text-sm text-slate-700">
        {/* Status card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isSupabaseConfigured
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div>
            <div className="font-bold flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>Current Status: {isSupabaseConfigured ? 'Connected to live Supabase database' : 'Running in Local Storage / Demo Mode'}</span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {isSupabaseConfigured
                ? 'All member submissions and photo uploads are persisting directly to your PostgreSQL database.'
                : 'The application is fully functional right now using browser storage. Follow the 3 steps below to connect a live database.'}
            </p>
          </div>
        </div>

        {/* 3 Step Guide */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick 3-Step Setup
          </h4>

          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Step 1: Create a Free Supabase Project</span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-600 hover:underline inline-flex items-center gap-1"
              >
                <span>supabase.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-500">
              Go to supabase.com and click &ldquo;Start your project&rdquo;. The free tier includes 500MB PostgreSQL, 1GB Storage, and 50,000 MAUs forever with no credit card required.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Step 2: Run the SQL Migration Script</span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-900 text-white hover:bg-slate-800 font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              In your Supabase project dashboard, open the <strong>SQL Editor</strong> tab on the left, paste the SQL script below, and click <strong>Run</strong>.
            </p>
            <div className="relative">
              <pre className="max-h-48 overflow-y-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-slate-200 leading-relaxed scrollbar-none">
                {SQL_SCHEMA_SCRIPT}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-sky-600" />
              <span>Step 3: Add API Keys to .env</span>
            </div>
            <p className="text-xs text-slate-500">
              In your Supabase dashboard, go to <strong>Project Settings → API</strong>. Copy the Project URL and anon public key, then add them to your local <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">.env</code> file:
            </p>
            <pre className="rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-emerald-400">
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
