# Class Network — Telegram Class Professional Networking Directory

A production-ready, peer networking directory designed specifically for members of an educational Telegram class cohort. It allows classmates to discover peers, browse verified skills, explore collaboration opportunities, and initiate direct conversations via Telegram.

---

## 🌟 Key Features

1. **Public Member Directory (No Login Required to Browse)**:
   - Modern, clean layout with spacious card grid inspired by the reference design.
   - Circular profile photos with fallback initials avatars.
   - Direct Telegram contact deep links (`https://t.me/<username>`), LinkedIn, and portfolio links.
   - Dynamic member counters based on actual approved profiles.
   - Skill badges, category pills, and location indicators.

2. **Real-Time Search & Multi-Faceted Filters**:
   - Instant search across full name, professional title, bio, category, and skills.
   - Filter by professional category (Software Engineering, AI & Data, Product & Design, Marketing, etc.).
   - Interactive skill tag filter chips.
   - "Only members with Telegram" toggle.
   - Sorting options: Recently Joined, Name (A-Z), and Featured First.

3. **Individual Member Profile (Deep Linkable)**:
   - Comprehensive profile modal with shareable URL hash (`#member-<id>`).
   - "How I Can Help Others" and "Looking For / Collaboration Goals" highlight callouts.
   - Direct Telegram action button ("Message on Telegram").
   - "Share Profile" button with 1-click clipboard link copy.

4. **Moderated Registration Workflow**:
   - Intuitive form with live inline Zod validation and drag-and-drop photo upload.
   - **Interactive Live Card Preview**: lets users see their card before submitting.
   - Anti-spam honeypot trap (`website_trap`) and file size/format restrictions (< 2MB, JPG/PNG/WebP).
   - Strict privacy safeguards: private email addresses are never exposed publicly.
   - Mandatory consent checkbox.
   - **Moderation Queue**: all submissions start with `publication_status = 'pending'` and must be approved by an administrator before appearing publicly.

5. **Secure Admin Moderation Dashboard**:
   - Protected by authentication (Supabase Auth or secure local fallback credentials).
   - Pending Reviews tab with 1-click "Approve & Publish" and "Reject".
   - Edit modal to correct typos, adjust categories, or add tags.
   - Toggle "Featured" badge for standout classmates.
   - Demographic analytics and category distribution charts.
   - **Production Readiness Controls**: 1-click "Clear All Demo Profiles" to wipe sample profiles before opening the site to real cohort members.
   - Data backup export (JSON).

6. **Dual-Mode Repository Architecture**:
   - **Supabase Live Mode**: Connected to PostgreSQL, Supabase Storage, and Auth with Row Level Security (RLS).
   - **Local Storage / Demo Mode**: Fully functional offline fallback with pre-seeded realistic development profiles, allowing instant zero-dependency testing.

---

## 🏗️ Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Telegram color palette & typography
- **Typography**: Inter & Vazirmatn (crisp rendering for both English and Persian)
- **Icons**: Lucide React + custom inline SVG brand icons
- **Form Validation**: Zod schema validation
- **Backend / Database**: Supabase (PostgreSQL 15+, Storage Bucket `member-photos`, Row-Level Security)
- **Deployment Targets**: Cloudflare Pages, Vercel, Netlify (all 100% free static hosting tiers)

---

## 💰 Free-Tier Architecture & Limitations

This project is intentionally designed to run **100% free** with zero paid subscriptions or credit card requirements:

| Service | Free Tier Allowance | Project Utilization & Impact |
| :--- | :--- | :--- |
| **Supabase Database** | 500 MB PostgreSQL | Sufficient for ~50,000+ member profiles. |
| **Supabase Storage** | 1 GB file storage | Photos are restricted to 2MB (averaging ~150KB), supporting ~6,000+ member avatars. |
| **Supabase Auth** | 50,000 Monthly Active Users | Only used for cohort administrators/moderators. |
| **Cloudflare Pages** | Unlimited bandwidth, 500 builds/month | Completely free static hosting with global CDN. |
| **Vercel** | 100 GB bandwidth / month | Free Hobby tier covers high class traffic. |

> [!NOTE]
> Supabase pauses free-tier projects after 7 days of inactivity. To prevent this, logging into the admin portal or querying the directory once a week will keep the database active.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js v18+ or v24+
- npm or pnpm

### 2. Installation
```bash
git clone <repository-url>
cd "Class Directory"
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. The app runs immediately in **Demo Mode** using local browser storage with 6 realistic development profiles.

### 4. Admin Demo Credentials
- **Email**: `admin@classnetwork.local`
- **Password**: `AdminClass2026!`

---

## 🗄️ Supabase Database Setup (3 Minutes)

To connect your own free PostgreSQL database and image storage:

### Step 1: Create a Free Project
1. Go to [https://supabase.com](https://supabase.com) and click **Start your project** (free, no credit card required).
2. Choose a project name (e.g. `class-network`) and set a secure database password.

### Step 2: Run the SQL Schema Migration
1. In your Supabase dashboard, navigate to the **SQL Editor** tab on the left menu.
2. Click **New query**, open the file [`supabase/migrations/20261101000000_init_directory.sql`](file:///c:/Users/Soroush/Desktop/Class%20Directory/supabase/migrations/20261101000000_init_directory.sql), copy its entire contents, paste it into the SQL editor, and click **Run**.
3. (Optional) Run [`supabase/seed.sql`](file:///c:/Users/Soroush/Desktop/Class%20Directory/supabase/seed.sql) if you want sample profiles in Supabase.

### Step 3: Configure Environment Variables
1. In Supabase, go to **Project Settings → API**.
2. Copy your **Project URL** and **anon public key**.
3. Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
4. Restart your Vite dev server (`npm run dev`). The status indicator in the top header will change to **🟢 Supabase Connected**!

---

## 🛡️ Database Security & Row-Level Security (RLS)

The database schema strictly implements PostgreSQL Row-Level Security:
- **Public / Anonymous Visitors**:
  - Can `SELECT` only records where `publication_status = 'approved'`.
  - Can `INSERT` new submissions only with `publication_status = 'pending'`, `consent_to_publish = TRUE`, and `featured = FALSE`.
  - Can never read unapproved or rejected profiles.
  - Public API queries never request the `private_email` column.
- **Administrators**:
  - Authenticated admin users have full permissions (`SELECT`, `UPDATE`, `DELETE`) to moderate the queue.

---

## 🌐 Free Deployment Instructions

### Option A: Cloudflare Pages (Recommended - 100% Free)
1. Push your code to a GitHub or GitLab repository.
2. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com) and select **Workers & Pages**.
3. Click **Create Application → Pages → Connect to Git**.
4. Select your repository and configure build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Add your Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Save and Deploy**. Cloudflare automatically handles single-page app routing via the included `public/_redirects` file.

### Option B: Vercel
1. Install Vercel CLI or import the repository in [vercel.com](https://vercel.com).
2. The included `vercel.json` ensures all route rewrites direct to `/index.html`.
3. Add the environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project settings.
4. Deploy.

---

## 🧹 Launching to Production (Wiping Demo Data)

Before sharing the live link with your Telegram group:
1. Log in to the **Admin Portal** (`#admin`).
2. Navigate to the **Database Setup** tab.
3. Click **Clear All Demo Profiles for Production Launch**.
4. Only real cohort submissions will be kept, ensuring a clean, authentic directory for your class!

---

## 📁 Project File Structure

```
Class Directory/
├── public/
│   ├── _redirects                  # Cloudflare Pages / Netlify SPA rewrite
│   └── favicon.svg                 # Telegram paper plane icon
├── src/
│   ├── assets/                     # Logos and media
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx   # Moderation queue, stats & cleanup
│   │   │   ├── AdminLoginModal.tsx  # Admin authentication modal
│   │   │   └── EditMemberModal.tsx  # Moderator edit modal
│   │   ├── common/
│   │   │   ├── Avatar.tsx           # Photo avatar with initials fallback
│   │   │   ├── Badge.tsx            # Tag badges & category pills
│   │   │   ├── DbGuideModal.tsx     # In-app Supabase setup guide
│   │   │   ├── Icons.tsx            # Crisp SVG brand icons (Telegram, LinkedIn)
│   │   │   └── Modal.tsx            # Accessible modal dialog
│   │   ├── directory/
│   │   │   ├── DirectoryFilters.tsx # Search, category pills, skill chips, sort
│   │   │   ├── Hero.tsx             # Cohort headline & dynamic counters
│   │   │   ├── MemberCard.tsx       # Pixel-perfect member card
│   │   │   ├── MemberDetailModal.tsx# Comprehensive profile & Telegram CTA
│   │   │   └── MemberGrid.tsx       # Responsive grid with load-more
│   │   ├── layout/
│   │   │   ├── Header.tsx           # Top navigation with live status
│   │   │   └── Footer.tsx           # Privacy notice & admin access
│   │   └── registration/
│   │       └── RegistrationModal.tsx# Multi-field form + live preview + confetti
│   ├── lib/
│   │   ├── constants.ts             # Categories, popular skills, sample members
│   │   ├── supabase.ts              # Supabase client initializer
│   │   └── validation.ts            # Zod validation schemas
│   ├── services/
│   │   ├── authService.ts           # Admin login & session management
│   │   ├── memberService.ts         # Dual-mode data repository (Supabase + Local)
│   │   └── storageService.ts        # Photo upload (Supabase Storage + Base64)
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── App.tsx                      # Root application & URL routing
│   ├── index.css                    # Tailwind CSS directives
│   └── main.tsx                     # React application entry point
├── supabase/
│   ├── migrations/
│   │   └── 20261101000000_init_directory.sql # Complete PostgreSQL schema & RLS
│   └── seed.sql                     # Initial sample data
├── .env.example                     # Environment variables template
├── tailwind.config.js               # Custom colors, shadows & fonts
├── vercel.json                      # Vercel SPA routing
└── package.json                     # Project manifest & scripts
```
