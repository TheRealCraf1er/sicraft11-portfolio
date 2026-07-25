# SiCraft11 — Staff Portfolio

A full-screen staff dossier for **SiCraft11** — Minecraft & Discord staff.
Built with Vite + React + TypeScript + Tailwind v4, with a free-tier Supabase
backend for accounts, reviews, and owner-editable content.

**Visual direction:** *Moonlit Dossier* — a personnel file lit by a single
torch. Ink-black surfaces, bone text, one ember accent, mono data labels,
oversized display type, film grain, and clip-path wipe reveals.

---

## Quick start

```bash
npm install
```

```bash
npm run dev
```

The site works immediately with **no backend**. It falls back to seed data +
your browser's local storage so you can edit and preview offline.

---

## Owner edit mode

The edit gate is hidden from visitors. To open it:

- Press **Ctrl + Shift + E** (or **Cmd + Shift + E** on Mac), **or**
- Load the page with `#owner` in the URL

**Without Supabase:** unlock with the PIN in `VITE_ADMIN_PIN`
(default `sicraft-owner`). Changes stay in your browser only.

**With Supabase:** unlock with your owner email + password. Changes publish to
the shared database and are visible to everyone.

Once unlocked, a bar appears at the bottom of the screen:

| Control | What it does |
| :-- | :-- |
| **Editing / Preview** | Toggles the inline edit affordances on and off |
| **Publish changes** | Pushes your edits to Supabase (lights up when there are unsaved changes) |
| **Reset** | Restores the original seed data |
| **Lock** | Exits owner mode |

While **Editing** is on you can click any dashed-outlined text to rewrite it,
upload or swap the cover image (top-left panel on the landing), edit category
descriptions, add/edit/reorder/delete server entries, change skill icons, and
toggle review approval.

---

## Connecting Supabase (free tier)

Needed for real accounts, shared reviews, and edits that persist for visitors.

### 1. Create the project

Sign up at [supabase.com](https://supabase.com) and create a new project.

### 2. Run the schema

Open **SQL Editor** in the Supabase dashboard, paste the contents of
[`supabase/schema.sql`](supabase/schema.sql), and run it. This creates:

- `site_state` — all editable site content as one JSON row
- `reviews` — account-backed reviews with RLS
- `admins` — the owner allow-list
- A `site-assets` storage bucket for the cover image
- Rate limiting (1 review per 10 min, 5 per account) and a server-enforced
  approval toggle

### 3. Turn off email confirmation

**Authentication → Providers → Email → uncheck "Confirm email".**

Reviewers sign up with a *username*; the app maps it to a synthetic email
address, so there is no real inbox to confirm.

### 4. Create your owner account

**Authentication → Users → Add user** (email + password, mark as confirmed).
Then promote it in the SQL Editor:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';
```

### 5. Add your keys

Copy `.env.example` to `.env` and fill in:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

Restart the dev server. The owner bar will now read **Supabase** instead of
**Local only**.

---

## Live Discord presence

The Discord card shows real-time status (online/idle/dnd, custom status,
current game, Spotify) via [Lanyard](https://github.com/Phineas/lanyard) — free,
no bot required.

1. Join the Lanyard Discord: **https://discord.gg/lanyard**
2. Get your Discord user ID (Settings → Advanced → Developer Mode, then
   right-click your name → Copy User ID)
3. Paste it into the site's `discordUserId` field

Without a user ID the card degrades gracefully to a static identity card with
the copyable tag.

---

## Deploying

Build output goes to `dist/`. The base path is relative, so it works anywhere.

```bash
npm run build
```

**Cloudflare Pages / Netlify / Vercel** — connect the repo, set:
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables

**GitHub Pages** — push `dist/` to a `gh-pages` branch, or use an action.

> The `anon` key is safe to expose publicly — Row Level Security is what
> protects your data, and the schema locks all writes behind the `admins` table.

---

## Project structure

```
src/
  lib/
    types.ts      Data model, statuses, rank presets
    seed.ts       All 25 server entries + default copy
    store.tsx     Site state, persistence, admin auth
    supabase.ts   Client (null-safe when unconfigured)
    reviews.ts    Auth + reviews API, with local fallback
    utils.ts      Formatting helpers
  components/
    landing/      Full-screen entry: cover, 3D skin, Discord card
    experience/   Server ledger, filters, entry editor
    reviews/      Auth panel, review feed
    admin/        Owner bar + unlock gate
    ui/           Reveal, Editable, Modal, SectionHeader
supabase/
  schema.sql      One-shot database setup
```

---

## Scripts

| Command | Description |
| :-- | :-- |
| `npm run dev` | Dev server at http://localhost:5173 |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |
