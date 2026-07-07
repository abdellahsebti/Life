# LifePulse — Tech Stack & Deployment Guide

> A personal wellness + connection tracker. Log your daily mood and energy, manage the people you care about, and get email nudges when you haven't checked in.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technologies Used](#technologies-used)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Database & Auth](#database--auth)
   - [Email](#email)
   - [Dev Tooling](#dev-tooling)
3. [How Everything Fits Together](#how-everything-fits-together)
4. [Deploying to Vercel](#deploying-to-vercel)
   - [Step 1 — Set up Supabase](#step-1--set-up-supabase)
   - [Step 2 — Set up Resend](#step-2--set-up-resend)
   - [Step 3 — Import to Vercel](#step-3--import-to-vercel)
   - [Step 4 — Add Environment Variables](#step-4--add-environment-variables)
   - [Step 5 — Deploy](#step-5--deploy)
   - [Step 6 — Post-deploy checklist](#step-6--post-deploy-checklist)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Local Development](#local-development)

---

## Architecture Overview

```
Browser
  │
  ├─── React SPA (Vite)          ← all UI, runs in the browser
  │      │
  │      ├─ /api/*  ─────────────→ Vercel Serverless Functions  (Node.js)
  │      │                              │
  │      │                              ├─ Supabase (Postgres + Auth)
  │      │                              └─ Resend (email)
  │      │
  │      └─ Supabase JS client ──→ Supabase Auth  (sign-in / sign-up)
  │
  └─── Vercel Cron  ─────────────→ /api/reminders/send  (daily at 09:00 UTC)
```

In **production** (Vercel) the React build is served as static files and `/api/*` routes are Vercel Serverless Functions. In **local development** a small Express server handles the API on port 3001 while Vite proxies requests to it.

---

## Technologies Used

### Frontend

| Technology | Why |
|---|---|
| **React 19** | Component-based UI library. Handles all rendering and state. |
| **Vite 7** | Blazing-fast dev server and bundler. Replaces Create React App. |
| **TypeScript** | Static types across the entire frontend — catches bugs before runtime. |
| **Tailwind CSS v4** | Utility-first CSS. Styles are written directly in JSX as class names. |
| **shadcn/ui** | Pre-built, accessible React components (dialogs, tabs, sliders, etc.) built on Radix UI primitives. |
| **Radix UI** | Unstyled, accessible component primitives that shadcn/ui builds on. |
| **Recharts** | Composable chart library built on D3. Used for mood/energy history graphs. |
| **Framer Motion** | Declarative animations. Used for page transitions and micro-interactions. |
| **Wouter** | Tiny client-side router (~2 KB). Handles `/dashboard`, `/contacts`, `/history`. |
| **TanStack Query** | Server-state management — caching, background refetching, and loading states for API calls. |
| **React Hook Form** | Performant form library with minimal re-renders. |
| **Zod** | Schema validation used on both the frontend (form parsing) and backend (request bodies). |
| **Lucide React** | Clean, consistent icon set. |
| **date-fns** | Lightweight date utility library (formatting, diffing, parsing). |
| **Sonner** | Toast notification library. |

### Backend

| Technology | Why |
|---|---|
| **Vercel Serverless Functions** | Each file in `api/` becomes an auto-scaled HTTP endpoint. No server to manage — Vercel handles cold starts, scaling, and SSL. |
| **Node.js (ESM)** | Runtime for the API functions. All files use ES module syntax (`import`/`export`). |
| **Express** | Used only in local development as a thin wrapper to run the Vercel-style handlers on port 3001. Not deployed to Vercel. |
| **Zod** | Validates incoming request bodies before any database call. Returns a structured 400 error on invalid input. |
| **Concurrently** | Runs the Express dev server and Vite in parallel with a single `npm run dev` command. Dev-only. |

### Database & Auth

| Technology | Why |
|---|---|
| **Supabase** | Managed Postgres database with a generous free tier. Provides the database, authentication, and the PostgREST API layer. |
| **Supabase Auth** | Handles user sign-up, sign-in, JWT issuance, and session management. The frontend uses the Supabase JS client directly for auth flows. |
| **Row Level Security (RLS)** | Postgres-level policies that ensure every user can only read and write their own rows — even if the API layer has a bug. |
| **@supabase/supabase-js** | Official JavaScript SDK. Used in the browser (auth session management) and in the serverless functions (user verification and data access). |

**Database tables:**

```
profiles        — one row per user (mirrors auth.users via a trigger)
daily_logs      — mood + energy check-ins, one per user per day
contacts        — people the user wants to stay in touch with
interactions    — log of every time the user contacted someone
```

### Email

| Technology | Why |
|---|---|
| **Resend** | Transactional email API. Clean REST interface, excellent deliverability, generous free tier (3,000 emails/month). |

The `api/reminders/send` function runs daily (via Vercel Cron), finds users who haven't logged today, and sends a reminder email through Resend.

### Dev Tooling

| Technology | Why |
|---|---|
| **ESLint / TypeScript compiler** | Static analysis. `npm run typecheck` reports type errors without building. |
| **npm** | Package manager. A flat `package.json` at the project root handles everything. |
| **.npmrc** (`legacy-peer-deps=true`) | Resolves peer dependency conflicts between some Radix UI packages and React 19. |

---

## How Everything Fits Together

### Authentication flow

```
User fills in email + password
  → POST /api/auth/register  (or /api/auth/login)
  → Serverless function calls supabase.auth.signUp / signInWithPassword
  → Supabase issues a JWT (access_token + refresh_token)
  → Function returns the tokens to the browser
  → Browser calls supabase.auth.setSession(tokens)
  → Supabase JS client now attaches the JWT to every subsequent request
```

### Data flow (protected routes)

```
React component calls api.fetchContacts()
  → apiFetch('/api/contacts')
  → Attaches Authorization: Bearer <JWT>
  → Serverless function calls requireAuth(req, res)
  → requireAuth creates a per-request Supabase client with the user's JWT
  → Supabase's RLS policies enforce that only the user's own rows are returned
  → JSON response → React state
```

### Daily reminder cron

```
Every day at 09:00 UTC
  → Vercel calls GET /api/reminders/send
  → Attaches Authorization: Bearer <CRON_SECRET>
  → Function queries all profiles
  → Filters out users who already have a log for today
  → Sends reminder emails via Resend to everyone remaining
```

---

## Deploying to Vercel

### Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Click **New project** and choose a name, password, and region.
3. Once the project is ready, open **SQL Editor → New query**.
4. Paste the entire contents of [`supabase-schema.sql`](./supabase-schema.sql) and click **Run**.
   This creates all four tables, RLS policies, and the auto-profile trigger.
5. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The `service_role` key bypasses RLS. Keep it server-side only — never expose it in the browser.

6. *(Optional but recommended)* Go to **Authentication → Email** and disable **Confirm email** during development so users can log in immediately after registering.

---

### Step 2 — Set up Resend

1. Go to [resend.com](https://resend.com) and create a free account.
2. Add and verify a sending domain under **Domains**.
3. Create an API key under **API Keys** → copy it as `RESEND_API_KEY`.
4. Open `api/reminders/send.js` and update the `from:` address to match your verified domain:
   ```js
   from: 'LifePulse <reminders@yourdomain.com>',
   ```

> The free Resend tier allows 3,000 emails/month and 100/day — more than enough for a personal app.

---

### Step 3 — Import to Vercel

1. Push your code to GitHub (already done if you cloned this repo).
2. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. Click **Import** next to your repository.
4. Vercel will auto-detect the framework settings from `vercel.json`:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - Leave everything else as-is.

---

### Step 4 — Add Environment Variables

In the Vercel project dashboard, go to **Settings → Environment Variables** and add all of the following. Set them for **Production**, **Preview**, and **Development**.

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role *(mark as Secret)* |
| `VITE_SUPABASE_URL` | Same value as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Same value as `SUPABASE_ANON_KEY` |
| `RESEND_API_KEY` | Resend → API Keys *(mark as Secret)* |
| `CRON_SECRET` | Generate a random string — e.g. `openssl rand -hex 32` *(mark as Secret)* |
| `VITE_APP_URL` | Your Vercel deployment URL — e.g. `https://lifepulse.vercel.app` |

> `VITE_*` variables are embedded into the browser bundle at build time. The non-prefixed versions are available only in the serverless functions at runtime.

---

### Step 5 — Deploy

Click **Deploy**. Vercel will:

1. Install dependencies (`npm install`)
2. Build the React app (`npm run build` → `dist/`)
3. Deploy `dist/` as a global CDN-backed static site
4. Register every file in `api/` as a serverless function
5. Set up the daily cron job from `vercel.json`

The first deploy usually takes 60–90 seconds.

---

### Step 6 — Post-deploy checklist

- [ ] Visit your deployment URL and create an account — confirm the register flow works end-to-end.
- [ ] Add a contact and log an interaction.
- [ ] Submit a daily check-in.
- [ ] *(Optional)* Manually trigger the reminder cron by calling:
  ```
  curl -X GET https://your-app.vercel.app/api/reminders/send \
    -H "Authorization: Bearer <your-CRON_SECRET>"
  ```
  and verify an email arrives.
- [ ] Update `VITE_APP_URL` in Vercel env vars to your final deployment URL (the "Check In Now" link in reminder emails uses it).

---

## Environment Variables Reference

```
# ── Supabase (server-side — serverless functions) ──────────────────────────
SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Secret — never expose to browser

# ── Supabase (client-side — embedded in browser bundle by Vite) ────────────
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# ── Email ──────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_...                   # Secret

# ── Cron protection ────────────────────────────────────────────────────────
CRON_SECRET=<random 32-byte hex>        # Secret — used to authenticate Vercel Cron calls

# ── App URL (used in reminder email links) ────────────────────────────────
VITE_APP_URL=https://your-app.vercel.app
```

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/abdellahsebti/Life.git
cd Life

# 2. Create a local env file
cp .env.local.example .env.local   # then fill in your Supabase keys

# 3. Install dependencies
npm install

# 4. Start the dev server (Vite + Express API server run together)
npm run dev
```

The app runs at `http://localhost:5173` (or the `PORT` env var if set).  
The API dev server runs at `http://localhost:3001`.  
Vite automatically proxies all `/api/*` requests to the Express server.

> **Note:** `RESEND_API_KEY` is not required for local development — the reminder endpoint simply won't send emails if it's missing. All other features (auth, contacts, check-ins) work without it.
