# Geraldo & Christin — Wedding Invitation

Modern wedding invitation built with Vite, React 19, TypeScript, Tailwind CSS, and Supabase. Includes a full CMS at `/admin` for content, media, guest invites, and RSVP tracking.

**Live:** https://geraldo-christin.vercel.app

## Quick Start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Personalized guest URL

- Canonical: `?guest=jeffry-istri`
- Legacy (auto-normalized): `?to=Jeffry+%26+Istri`

Link personal membuka RSVP & ucapan. Setelah migration **`012_strict_guests`**, slug **harus sudah ada** di daftar tamu admin (tidak ada auto-create dari link publik).

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor (**in order**), or `npm run db:apply > pending-migrations.sql` then paste:
   - `001_init.sql` … `006_admin_hardening.sql`
   - `007_rsvp_antispam.sql` — RSVP one-per-guest
   - `008_guest_invite_sent.sql` — WA invite sent tracking
   - `009_reset_gw5_copy.sql` — optional CMS copy reset (review before prod)
   - `010_wishes_moderation.sql` — wishes `hidden` + admin moderation RLS
   - `011_ensure_guest.sql` — `ensure_guest_by_slug` (ops/service role)
   - `012_strict_guests.sql` — revoke `ensure_guest_by_slug` for anon/auth (strict invites)
3. Deploy edge function (**redeploy after wish/RSVP logic changes**):
   ```bash
   npx supabase functions deploy submit
   npx supabase secrets set ALLOWED_ORIGIN=https://geraldo-christin.vercel.app
   ```
4. Copy Project URL and anon key to `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   VITE_SITE_URL=http://localhost:5173
   ```
5. Create admin user in Supabase Dashboard → Authentication → Users (use a **private email**, not shown on the site)
6. Add that email to `admin_allowlist`:
   ```sql
   insert into admin_allowlist (email) values ('email-admin-anda@domain.com')
   on conflict (email) do nothing;
   ```
7. Seed guests:
   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:guests scripts/guests.sample.csv
   ```

## CMS Admin (`/admin`)

1. Open `/admin` and sign in with an **allowlisted** Supabase Auth account
2. Tabs: Umum, Undangan, Mempelai, Acara, Galeri, Gift, RSVP, Buku Tamu, Penutup, Media
3. **Undangan** — 3 template pesan WhatsApp, daftar tamu, kirim WA per tamu
4. **RSVP** — edit form + lihat daftar konfirmasi kehadiran (export CSV)
5. **Gift** — upload QRIS, cek nomor WA pasangan di tab Undangan
6. Upload images/audio/video to Supabase Storage (`wedding-media` bucket)
7. Click **Simpan Perubahan** — content stored in `site_content` and merged with `wedding.config.ts` defaults

When CMS is empty or offline, the site falls back to `src/config/wedding.config.ts`.

### WhatsApp invite template variables

`{nama}`, `{link}`, `{tanggal}`, `{lokasi}`, `{pasangan}`, `{salam}`, `{slug}`, `{acara}`, `{venue}`

## Edit Default Content

Fallback defaults live in `src/config/wedding.config.ts`:

- Couple names, dates, events, gallery, gift accounts
- 3 WhatsApp invite templates in `src/config/invite-templates.ts`
- Local media paths under `public/assets/`

## Build & Deploy

Requires **Node 22+**. Production build needs `VITE_SITE_URL` (real URL, not placeholder).

```bash
npm run build
npm run preview
```

**Default:** push to `main` → CI (`.github/workflows/ci.yml`) → deploy workflow (`.github/workflows/deploy.yml`) → Vercel prebuilt + Supabase. Vercel Git deploy for `main` is disabled in `vercel.json`.

GitHub secrets for deploy: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `VITE_SITE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

Emergency manual deploy:

```bash
npx vercel deploy --prod --yes
npx vercel alias set <deployment-url> geraldo-christin.vercel.app
```

Disable Vercel SSO protection for public access (if needed):

```bash
npx vercel project protection disable geraldo-wedding --sso
```

### Pre-deploy checklist

- [ ] Run migrations `001` through `012` (`npm run db:apply` + SQL Editor; `npm run db:verify` incl. anon blocked on `ensure_guest_by_slug`)
- [ ] Redeploy `submit` edge function + set `ALLOWED_ORIGIN` secret
- [ ] Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL` in Vercel
- [ ] Create admin user + verify email in `admin_allowlist`
- [ ] Disable Vercel Deployment Protection (SSO) for public guest access
- [ ] Login `/admin` → set nomor WhatsApp asli, upload QRIS + galeri, save
- [ ] Test `?guest=...`, RSVP (hadir/berhalangan, max 3 tamu), and guestbook
- [ ] Verify `sitemap.xml` uses your `VITE_SITE_URL` (generated at build)

## Testing

```bash
npm run lint
npm run test        # Vitest unit tests
npm run test:e2e    # Playwright e2e
```

CI runs lint → unit tests → coverage → build → Playwright (desktop + mobile) → Lighthouse on push/PR (`.github/workflows/ci.yml`).

## Troubleshooting

| Issue                                 | Fix                                                               |
| ------------------------------------- | ----------------------------------------------------------------- |
| Site redirects to Vercel login        | Run `vercel project protection disable geraldo-wedding --sso`     |
| RSVP/guestbook submit fails           | Deploy edge function; set `ALLOWED_ORIGIN` to exact site URL      |
| Admin "Akses ditolak"                 | Add user email to `admin_allowlist` table                         |
| Guest list / RSVP admin empty         | Run migrations `004`–`006`                                        |
| Ucapan kosong / moderasi error        | Run migration `010`; redeploy `submit`                            |
| Form ucapan terkunci di link personal | Run migration `011`; open via `?guest=` / `?to=`                  |
| Social preview image missing          | Set `VITE_SITE_URL` in Vercel; OG tags use absolute URLs at build |

## Security Notes

- RSVP and guestbook submit via edge function `submit` (honeypot + rate limiting + origin check)
- Direct public inserts to `rsvp_submissions` / `wishes` are disabled after migration `003`
- Admin CMS, guests, RSVP admin, and media writes require `admin_allowlist` + `is_admin()` (migration `006`)
- Guest lookup uses RPC `get_guest_by_slug`; `ensure_guest_by_slug` is **not** callable by anon after `012`
- Guest-facing reads/submit use `src/lib/supabase-rest.ts` (fetch); admin keeps `@supabase/supabase-js`
- Wishes require a personal invite key; public list hides `hidden=true` rows (`010`)
- Never commit `.env.local` or service role keys
- Only `VITE_SUPABASE_ANON_KEY` belongs in the frontend
- `/admin` is `noindex` for search engines and blocked in `robots.txt`
- Use a **private admin email** (not shown in UI placeholders or public docs)
- Enable Supabase Auth rate limiting + strong password policy in Dashboard
- Rotate admin password if it was ever shared or used in development

## Project Structure

```
src/
  config/wedding.config.ts      # Default content (CMS fallback)
  config/invite-templates.ts    # 3 WhatsApp invite templates
  context/WeddingContentContext # CMS fetch + merge
  pages/AdminPage.tsx           # CMS shell (auth, tabs, save)
  components/admin/             # Admin tab panels + login
  components/                   # UI sections + admin panels
  hooks/                        # useGuestName, useCountdown, useAudio, usePageMeta
  lib/                          # supabase, submit-form, merge-content, storage
public/assets/                  # Default images, audio, video
supabase/migrations/            # Database schema + RLS (001–012)
supabase/functions/submit/      # Secure form submission edge function
e2e/                            # Playwright tests
```

## Scripts

| Command                  | Description                                                  |
| ------------------------ | ------------------------------------------------------------ |
| `npm run dev`            | Start dev server                                             |
| `npm run build`          | Production build (+ sitemap from `VITE_SITE_URL`)            |
| `npm run lint`           | ESLint check                                                 |
| `npm run test`           | Vitest unit tests                                            |
| `npm run test:e2e`       | Playwright e2e tests                                         |
| `npm run seed:guests`    | Import guest CSV to Supabase                                 |
| `npm run db:verify`      | Verify migrations 004–012 (service role; anon check for 012) |
| `npm run db:apply`       | Print combined SQL for pending migrations                    |
| `npm run icons:generate` | PWA icons from logo (sharp)                                  |
| `npm run test:coverage`  | Vitest with V8 coverage                                      |
| `npm run format:check`   | Prettier check                                               |

## Legacy Assets

The original Elementor export (`legacy/`, `asset/`) is excluded from the main repo via `.gitignore`. Keep a local copy for reference only.
