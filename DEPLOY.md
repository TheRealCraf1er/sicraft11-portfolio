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

### 1.3 Turn off email confirmation

Reviewers sign up with a *username*, which the app maps to a fake email address.
There's no real inbox, so confirmation must be off or nobody can register.

- [ ] **Authentication** → **Sign In / Providers** → **Email**
- [ ] Turn **OFF** "Confirm email"
- [ ] **Save**

### 1.4 Create your owner account

- [ ] **Authentication** → **Users** → **Add user** → **Create new user**
  - Email: `hethenet598@gmail.com`
  - Password: pick a strong one — **this is your site's edit-mode password**
  - ✅ Tick **Auto Confirm User**
- [ ] **Create user**

### 1.5 Promote yourself to owner

- [ ] **SQL Editor** → **New query** → paste and **Run**:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'hethenet598@gmail.com';
```

- [ ] Expect: *"Success. 1 row"*. If it says 0 rows, the user wasn't created — redo 1.4.

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
