# Deploy checklist — SiCraft11 Portfolio

Everything needed to get the site live and free, 24/7.
Tick these off in order. Total time: ~20 minutes.

> **Tip:** you already have GitHub. Both Supabase and Cloudflare offer
> **"Continue with GitHub"** — use it. No new passwords to invent or remember.

---

## Part 1 — Supabase (the backend)

Powers reviewer accounts, the reviews feed, and edits that persist for visitors.

### 1.1 Create the project

- [ ] Go to **https://supabase.com/dashboard** → **Continue with GitHub**
- [ ] **New project**
  - Name: `sicraft11-portfolio`
  - **Database password:** click Generate, then **save it somewhere safe**
    (you won't need it for the site, but you'll want it later)
  - Region: pick the one closest to you (e.g. *Central EU (Frankfurt)*)
- [ ] Click **Create new project**, wait ~2 minutes for it to finish setting up

### 1.2 Build the database

- [ ] Left sidebar → **SQL Editor** → **New query**
- [ ] Open `supabase/schema.sql` from this folder, copy **all** of it, paste in
- [ ] Click **Run**
- [ ] Expect: *"Success. No rows returned"* — that's correct

### ⚠️ First: there are THREE different passwords. Don't mix them up.

| # | Password | Set where | Used for |
| :-: | :-- | :-- | :-- |
| 1 | Supabase login | "Continue with GitHub" | Getting into the dashboard. None, if you used GitHub. |
| 2 | **Database password** | Step 1.1 (auto-generated) | Direct DB access. **The website never uses it.** |
| 3 | **Owner password** | **Step 1.4 — you invent it** | **Unlocking edit mode on your live site.** |

The one you'll actually type again is **#3, from step 1.4**. Write it down.

### 1.3 Turn off email confirmation

Reviewers sign up with a *username*, which the app maps to a fake email address
(`bob` becomes `bob@users.sicraft11.app`). That inbox doesn't exist — so if
confirmation is left on, Supabase mails a verification link into the void, the
account stays unverified, and **nobody can ever register a review account.**

- [ ] Left sidebar → **Authentication** (shield/person icon)
- [ ] In the sub-menu → **Sign In / Providers**
      *(older dashboards just call this **Providers** — same page)*
- [ ] Click **Email** at the top of the provider list to expand it
- [ ] Find **"Confirm email"** *(some versions: "Enable email confirmations")*
- [ ] Switch it **OFF** — grey, not green
- [ ] Click **Save** at the bottom of that panel

### 1.4 Create your owner account

- [ ] Left sidebar → **Authentication** → **Users**
- [ ] Top right → **Add user** (it's a dropdown) → **Create new user**
      ❌ *not* "Send invitation" — that emails a link instead of creating it now
- [ ] Fill in:
  - Email: `hethenet598@gmail.com`
  - Password: invent a strong one — **this is your site's edit password**
- [ ] ✅ **Tick "Auto Confirm User"** — miss this and you can't unlock edit mode
- [ ] Click **Create user**
- [ ] You should now see one row in the Users table showing your email

### 1.5 Promote yourself to owner

- [ ] **SQL Editor** → **New query** → paste and **Run**:

```sql
insert into public.admins (user_id)
select id from auth.users where lower(trim(email)) = 'hethenet598@gmail.com'
on conflict (user_id) do nothing;
```

- [ ] Expect: **"Success. No rows returned"** — that is the correct result.
      An `INSERT` never reports rows unless you add `RETURNING`, so "no rows"
      does **not** mean it failed.

- [ ] **Verify it actually worked** — run this separately:

```sql
select u.email, u.email_confirmed_at, a.user_id
from public.admins a
join auth.users u on u.id = a.user_id;
```

- [ ] Expect **one row showing your email**, with `email_confirmed_at` filled in.
  - No rows at all → the user from 1.4 doesn't exist; redo 1.4.
  - Row present but `email_confirmed_at` is `null` → "Auto Confirm User" was
    missed; delete the user and redo 1.4 with the box ticked.

### 1.6 Copy your two keys

- [ ] **Project Settings** (gear, bottom left) → **API Keys** (or **Data API**)
- [ ] Copy these two somewhere handy — you'll paste them into Cloudflare:

| What | Looks like |
| :-- | :-- |
| **Project URL** | `https://abcdefgh.supabase.co` |
| **anon / public key** | `eyJhbGciOi...` (very long) |

> ⚠️ Copy the **anon** key, **never** the `service_role` key.
> The anon key is safe to publish — it ships inside the website's code by
> design, and Row Level Security is what actually protects your data.
> The `service_role` key bypasses all of that. Never put it anywhere.

---

## Part 2 — GitHub (the code)

- [ ] Go to **https://github.com/new**
  - Repository name: `sicraft11-portfolio`
  - Public or Private — **either works**, Cloudflare can read both
  - ❌ Do **NOT** tick "Add a README", ".gitignore", or "license"
    (the repo must be empty, or the push will be rejected)
- [ ] **Create repository**
- [ ] Copy the URL from the top of the page, then **send it to Claude** —
      Claude will connect it and push. A GitHub login window may pop up once;
      that's your computer's credential helper, so sign in there yourself.

---

## Part 3 — Cloudflare Pages (the hosting)

- [ ] Go to **https://dash.cloudflare.com** → **Sign up** → **Continue with GitHub**
- [ ] Left sidebar → **Compute (Workers & Pages)** → **Create** → **Pages** tab
      → **Connect to Git**
- [ ] **Authorize Cloudflare** when GitHub asks (you can grant access to just
      this one repository if you prefer)
- [ ] Select `sicraft11-portfolio` → **Begin setup**

### Build settings

| Field | Value |
| :-- | :-- |
| Framework preset | **Vite** |
| Build command | `npm run build` |
| Build output directory | `dist` |

### Environment variables — do this BEFORE deploying

The keys get baked into the site while it builds, so they must be set now.
If you skip this, the site deploys but reviews and editing silently won't work.

- [ ] Expand **Environment variables (advanced)** → add both:

| Variable name | Value |
| :-- | :-- |
| `VITE_SUPABASE_URL` | your Project URL from 1.6 |
| `VITE_SUPABASE_ANON_KEY` | your anon key from 1.6 |

- [ ] **Save and Deploy** → wait ~2 minutes

🎉 You're live at `https://sicraft11-portfolio.pages.dev`

---

## Part 4 — Finish setting up your site

- [ ] **Live Discord status:** join **https://discord.gg/lanyard**
      (just joining is enough — the card starts showing your real status,
      custom status and current game automatically)
- [ ] Open your live site
- [ ] Press **Ctrl + Shift + E** → sign in with `hethenet598@gmail.com` and the
      password from 1.4
- [ ] The owner bar appears at the bottom. Check it says **Supabase**, not
      *Local only* — if it says Local only, the env vars in Part 3 didn't apply
- [ ] Click into any dashed text to rewrite it. Also upload:
  - the landing **cover image** (panel, top-left of the landing)
  - the **NightVanilla logo** (next to the title — currently an "NI" monogram)
- [ ] Fix **Donut SMP Fire Giveaways** — it still says "Present" but is tagged
      Resigned. Set the real end date.
- [ ] Hit **Publish changes** — now everyone sees your version, not the drafts

---

## Making changes later

Anything Claude changes in this folder goes live with:

```bash
git add -A && git commit -m "describe the change" && git push
```

Cloudflare rebuilds automatically in ~2 minutes. Content edits you make in owner
mode don't need this — **Publish changes** is instant.

---

## Good to know

**Supabase free projects pause after ~7 days of zero activity.** Real visitors
keep it awake, so this mostly matters before anyone's found the site. If it
pauses, one click in the dashboard resumes it and no data is lost. The page
itself stays online either way — only reviews and published edits stop loading.

**Cloudflare Pages free tier** has unlimited bandwidth and no sleep. The site
itself is genuinely 24/7.

**Custom domain** (optional): a `.com` costs ~€10/yr from Cloudflare Registrar,
then Pages → your project → **Custom domains** → **Set up a domain**. The
`.pages.dev` URL is free and permanent, so this is purely cosmetic.
