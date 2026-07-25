-- =============================================================================
-- SiCraft11 Portfolio — Supabase schema
-- Run this once in your project's SQL Editor (Supabase Dashboard → SQL Editor).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ADMINS — the allow-list of owner accounts that may edit the site.
-- -----------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Helper: is the caller an owner?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- A signed-in user may check their own admin row (needed by the app to
-- decide whether to show edit mode). Nobody can write to this table from
-- the client — add owners manually via the SQL editor.
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 2. SITE STATE — the whole editable site (copy, categories, servers) as one
--    JSON document. Small dataset, so a single row keeps things simple.
-- -----------------------------------------------------------------------------
create table if not exists public.site_state (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_state_single_row check (id = 1)
);

alter table public.site_state enable row level security;

drop policy if exists "site state is public" on public.site_state;
create policy "site state is public"
  on public.site_state for select
  to anon, authenticated
  using (true);

drop policy if exists "owners write site state" on public.site_state;
create policy "owners write site state"
  on public.site_state for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "owners update site state" on public.site_state;
create policy "owners update site state"
  on public.site_state for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. REVIEWS — account-backed, with rate limiting and an approval toggle.
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 32),
  body text not null check (char_length(body) between 4 and 1200),
  rating int check (rating between 1 and 5),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists reviews_created_at_idx
  on public.reviews (created_at desc);

alter table public.reviews enable row level security;

-- Public sees approved reviews; you always see your own; owners see everything.
drop policy if exists "read approved reviews" on public.reviews;
create policy "read approved reviews"
  on public.reviews for select
  to anon, authenticated
  using (
    approved
    or user_id = auth.uid()
    or public.is_admin()
  );

drop policy if exists "signed in users post reviews" on public.reviews;
create policy "signed in users post reviews"
  on public.reviews for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "authors edit own reviews" on public.reviews;
create policy "authors edit own reviews"
  on public.reviews for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "authors or owners delete reviews" on public.reviews;
create policy "authors or owners delete reviews"
  on public.reviews for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- Abuse protection: one review per user per 10 minutes, 5 total per user,
-- and the approval toggle is enforced server-side (not trustable on the client).
create or replace function public.enforce_review_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_count int;
  total_count int;
  needs_approval boolean;
begin
  new.user_id := auth.uid();

  select count(*) into recent_count
  from public.reviews
  where user_id = new.user_id
    and created_at > now() - interval '10 minutes';

  if recent_count > 0 then
    raise exception 'RATE_LIMIT: please wait a few minutes before posting again';
  end if;

  select count(*) into total_count
  from public.reviews
  where user_id = new.user_id;

  if total_count >= 5 then
    raise exception 'RATE_LIMIT: you have reached the maximum number of reviews';
  end if;

  select coalesce((data -> 'content' ->> 'reviewsRequireApproval')::boolean, false)
  into needs_approval
  from public.site_state
  where id = 1;

  new.approved := not coalesce(needs_approval, false);
  return new;
end;
$$;

drop trigger if exists reviews_before_insert on public.reviews;
create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.enforce_review_rules();

-- -----------------------------------------------------------------------------
-- 4. STORAGE — public bucket for the landing cover image.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read site assets" on storage.objects;
create policy "public read site assets"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'site-assets');

drop policy if exists "owners upload site assets" on storage.objects;
create policy "owners upload site assets"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "owners update site assets" on storage.objects;
create policy "owners update site assets"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets' and public.is_admin())
  with check (bucket_id = 'site-assets' and public.is_admin());

drop policy if exists "owners delete site assets" on storage.objects;
create policy "owners delete site assets"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets' and public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. SEED the single site_state row so the first publish is an UPDATE.
-- -----------------------------------------------------------------------------
insert into public.site_state (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- =============================================================================
-- AFTER RUNNING THIS FILE
-- =============================================================================
-- 1. Authentication → Providers → Email:  turn OFF "Confirm email".
--    (Reviewers sign up with a username mapped to a synthetic email address,
--     so there is no real inbox to confirm.)
--
-- 2. Create your owner account, then promote it:
--
--      insert into public.admins (user_id)
--      select id from auth.users where email = 'you@example.com';
--
--    Use that email + password to unlock edit mode on the site.
-- =============================================================================
