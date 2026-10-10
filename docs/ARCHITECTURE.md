# Architecture (brief)

## Frontend

- **Vite + React 19** SPA; theme **ballroom** under `src/themes/ballroom/`.
- **Content**: defaults in `src/config/wedding.config.ts`, merged with Supabase `site_content` via `WeddingContentContext`.
- **Guest reads** (CMS row, guest slug, wishes list, RSVP/wish submit): lightweight **`src/lib/supabase-rest.ts`** (fetch + anon key).
- **Admin** (`/admin`): Supabase Auth + **`@supabase/supabase-js`** for CRUD, storage, moderation, guest list.

## Backend

- **Supabase Postgres** with RLS; migrations in `supabase/migrations/` (through `012_strict_guests.sql`).
- **Edge function** `submit`: RSVP + wishes validation, rate limits, strict guest_id (no public RSVP/wish without personal link).
- **012**: `ensure_guest_by_slug` revoked for `anon`/`authenticated`; guests must be seeded in admin.

## Deploy

- **CI** on push/PR: lint, unit tests, build, Playwright, Lighthouse.
- **Deploy workflow** after green CI on `main`: Vercel prebuilt, Supabase db push + function deploy, smoke curl.
- Vercel Git auto-deploy for `main` is disabled; production is workflow-driven.

## PWA / assets

- Service worker `public/sw.js` with build-injected cache version; hashed Vite assets cache-first, ballroom media stale-while-revalidate.
- Icons generated from logo via `npm run icons:generate`.
