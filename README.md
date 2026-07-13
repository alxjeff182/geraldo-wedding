# Geraldo & Christin — Wedding Invitation

Modern wedding invitation built with Vite, React, TypeScript, Tailwind CSS, and Supabase. Includes a lightweight CMS at `/admin` for content and media.

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Personalized guest URL

- By name: `?to=Jeffry+%26+Istri`
- By guest slug: `?guest=jeffry-istri`

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor (in order):
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_cms.sql`
   - `supabase/migrations/003_security.sql`
3. Deploy edge function:
   ```bash
   supabase functions deploy submit
   supabase secrets set ALLOWED_ORIGIN=https://your-domain.com
   ```
4. Copy Project URL and anon key to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_SITE_URL=http://localhost:5173
   ```
5. Create admin user in Supabase Dashboard → Authentication → Users
6. Seed guests:
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:guests scripts/guests.sample.csv
   ```

## CMS Admin (`/admin`)

1. Open `/admin` and sign in with your Supabase Auth admin account
2. Edit content tabs: Umum, Mempelai, Acara, Galeri, Gift, Media
3. Upload images/audio/video to Supabase Storage (`wedding-media` bucket)
4. Click **Simpan** — content is stored in `site_content` and merged with defaults from `src/config/wedding.config.ts`

When CMS is empty or offline, the site falls back to `wedding.config.ts`.

**Media tips:** Prefer WebP for photos; keep hero video under ~5MB when possible.

## Edit Default Content

Fallback defaults live in `src/config/wedding.config.ts`:
- Couple names, dates, events, gallery, gift accounts
- Local media paths under `public/assets/`

## Build & Deploy

```bash
npm run build
npm run preview
```

Deploy to Vercel:
```bash
npx vercel --prod
```

### Pre-deploy checklist

- [ ] Run migrations `001`, `002`, `003` on production Supabase
- [ ] Deploy `submit` edge function + set `ALLOWED_ORIGIN` secret
- [ ] Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` in Vercel
- [ ] Create admin user in Supabase Auth
- [ ] Login `/admin` → upload media and save content
- [ ] Test guest URL `?guest=...`, RSVP, and guestbook
- [ ] Verify `sitemap.xml` uses your `VITE_SITE_URL` (generated at build)

## Testing

```bash
npm run lint
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright e2e
```

CI runs lint → unit tests → build → Playwright on push/PR (`.github/workflows/ci.yml`).

## Security Notes

- RSVP and guestbook submit via edge function `submit` (honeypot + rate limiting)
- Direct public inserts to `rsvp_submissions` / `wishes` are disabled after migration `003`
- Guest lookup uses RPC `get_guest_by_slug` — no full guest table exposure
- Never commit `.env.local` or service role keys
- Only `VITE_SUPABASE_ANON_KEY` belongs in the frontend
- Legacy Elementor export may contain exposed OAuth credentials — revoke in Google Cloud Console if still active

## Project Structure

```
src/
  config/wedding.config.ts      # Default content (CMS fallback)
  context/WeddingContentContext # CMS fetch + merge
  pages/AdminPage.tsx           # CMS admin UI
  components/                   # UI sections
  hooks/                        # useGuestName, useCountdown, useAudio, usePageMeta
  lib/                          # supabase, submit-form, merge-content, storage
public/assets/                  # Default images, audio, video
supabase/migrations/            # Database schema + RLS
supabase/functions/submit/      # Secure form submission edge function
e2e/                            # Playwright tests
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (+ sitemap from `VITE_SITE_URL`) |
| `npm run lint` | ESLint check |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e tests |
| `npm run seed:guests` | Import guest CSV to Supabase |

## Legacy Assets

The original Elementor export (`legacy/`, `asset/`) is excluded from the main repo via `.gitignore`. Keep a local copy for reference only.
