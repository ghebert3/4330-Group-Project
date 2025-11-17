
-- 0. LSU-ONLY EMAILS ON AUTH.SIGNUP

create or replace function public.enforce_lsu_email()
returns trigger
language plpgsql
as $$
begin
  -- Only allow @lsu.edu addresses
  if position('@lsu.edu' in new.email) = 0 then
    raise exception 'Only @lsu.edu emails allowed.';
  end if;
  return new;
end;
$$;

-- Attach to auth.users so it's enforced on sign-up / email change
-- Drop the old trigger
drop trigger if exists trg_enforce_lsu_email on auth.users;

-- Recreate it so it only fires:
--   - on INSERT (new signups)
--   - on UPDATE *of the email column* (when email changes)
create trigger trg_enforce_lsu_email
before insert or update of email on auth.users
for each row
execute function public.enforce_lsu_email();

-- 1. TYPE(S)

do $$ begin
  create type swipe_choice as enum ('right','left');
exception when duplicate_object then
  null;
end $$;


-- 2. TABLE DEFINITIONS

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  created_at timestamptz default now()
);

-- extra columns for Kanban features (safe to run multiple times)
alter table public.profiles
  add column if not exists username text unique,
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists is_private boolean default false,
  add column if not exists theme_preference text default 'system';

-- POSTS (feed)
create table if not exists public.posts (
  id bigserial primary key,
  author uuid references public.profiles(id) on delete cascade,
  caption text,
  image_url text,
  created_at timestamptz default now()
);

-- STORIES (24h)
create table if not exists public.stories (
  id bigserial primary key,
  author uuid references public.profiles(id) on delete cascade,
  image_url text,
  caption text,
  created_at timestamptz default now(),
  expires_at timestamptz not null
);

-- SWIPES
create table if not exists public.swipes (
  swiper uuid references public.profiles(id) on delete cascade,
  swipee uuid references public.profiles(id) on delete cascade,
  choice swipe_choice not null,
  created_at timestamptz default now(),
  primary key (swiper, swipee)
);

-- MATCHES
create table if not exists public.matches (
  a uuid not null,
  b uuid not null,
  matched_at timestamptz default now(),
  primary key (a,b),
  check (a <> b)
);

-- FOLLOWS
create table if not exists public.follows (
  follower uuid references public.profiles(id) on delete cascade,
  followee uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower, followee),
  check (follower <> followee)
);

-- EVENTS
create table if not exists public.events (
  id bigserial primary key,
  host uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text,
  created_at timestamptz default now()
);

-- REPORTS
create table if not exists public.reports (
  id bigserial primary key,
  reporter uuid references public.profiles(id) on delete cascade,
  reported_user uuid references public.profiles(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);

-- INTERESTS + USER_INTERESTS
create table if not exists public.interests (
  id bigserial primary key,
  label text unique not null
);

create table if not exists public.user_interests (
  user_id uuid references public.profiles(id) on delete cascade,
  interest_id bigint references public.interests(id) on delete cascade,
  primary key (user_id, interest_id)
);


-- 3. AUTO-CREATE PROFILE ON AUTH.SIGNUP

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. ENABLE RLS ON ALL APP TABLES

alter table public.profiles       enable row level security;
alter table public.posts          enable row level security;
alter table public.stories        enable row level security;
alter table public.swipes         enable row level security;
alter table public.matches        enable row level security;
alter table public.follows        enable row level security;
alter table public.events         enable row level security;
alter table public.reports        enable row level security;
alter table public.user_interests enable row level security;


-- 5. ROW-LEVEL SECURITY POLICIES

-- ---------- PROFILES ----------
drop policy if exists "profiles read all"                 on public.profiles;
drop policy if exists "profiles insert (user or service)" on public.profiles;
drop policy if exists "profiles update own"               on public.profiles;
drop policy if exists "profiles insert via auth trigger"  on public.profiles;

-- anyone can read profiles (later filter by is_private in queries)
create policy "profiles read all"
on public.profiles for select
using (true);

-- allow service_role (backend) and owners to insert
drop policy if exists "profiles insert (user or service)" on public.profiles;

create policy "profiles insert via auth trigger"
on public.profiles for insert
with check (true);

-- owners can update their own profile
create policy "profiles update own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);


-- ---------- POSTS ----------
drop policy if exists "posts read all"     on public.posts;
drop policy if exists "posts insert own"   on public.posts;
drop policy if exists "posts update own"   on public.posts;
drop policy if exists "posts delete own"   on public.posts;

-- public feed
create policy "posts read all"
on public.posts for select
using (true);

-- only author can create, update, delete
create policy "posts insert own"
on public.posts for insert
with check (auth.uid() = author);

create policy "posts update own"
on public.posts for update
using (auth.uid() = author)
with check (auth.uid() = author);

create policy "posts delete own"
on public.posts for delete
using (auth.uid() = author);


-- ---------- STORIES ----------
drop policy if exists "stories read unexpired" on public.stories;
drop policy if exists "stories insert own"     on public.stories;
drop policy if exists "stories delete own"     on public.stories;

-- show only unexpired stories
create policy "stories read unexpired"
on public.stories for select
using (expires_at > now());

-- only author creates/deletes
create policy "stories insert own"
on public.stories for insert
with check (auth.uid() = author);

create policy "stories delete own"
on public.stories for delete
using (auth.uid() = author);


-- ---------- SWIPES ----------
drop policy if exists "swipes read participants" on public.swipes;
drop policy if exists "swipes insert own"        on public.swipes;
drop policy if exists "swipes update own"        on public.swipes;
drop policy if exists "swipes delete own"        on public.swipes;

create policy "swipes read participants"
on public.swipes for select
using (
  auth.uid() = swiper
  or auth.uid() = swipee
);

create policy "swipes insert own"
on public.swipes for insert
with check (auth.uid() = swiper);

create policy "swipes update own"
on public.swipes for update
using (auth.uid() = swiper)
with check (auth.uid() = swiper);

create policy "swipes delete own"
on public.swipes for delete
using (auth.uid() = swiper);


-- ---------- MATCHES ----------
drop policy if exists "matches read participants" on public.matches;
drop policy if exists "matches insert server"     on public.matches;

-- only participants can see the match
create policy "matches read participants"
on public.matches for select
using (auth.uid() in (a, b));

-- only backend (service_role / edge function) should insert matches
create policy "matches insert server"
on public.matches for insert
with check (false);


-- ---------- FOLLOWS ----------
drop policy if exists "follows read participants" on public.follows;
drop policy if exists "follows insert own"        on public.follows;
drop policy if exists "follows update own"        on public.follows;
drop policy if exists "follows delete own"        on public.follows;

create policy "follows read participants"
on public.follows for select
using (auth.uid() in (follower, followee));

create policy "follows insert own"
on public.follows for insert
with check (auth.uid() = follower);

create policy "follows update own"
on public.follows for update
using (auth.uid() = follower)
with check (auth.uid() = follower);

create policy "follows delete own"
on public.follows for delete
using (auth.uid() = follower);


-- ---------- EVENTS ----------
drop policy if exists "events read all"    on public.events;
drop policy if exists "events insert host" on public.events;
drop policy if exists "events update host" on public.events;
drop policy if exists "events delete host" on public.events;

-- everyone can see events (later add private events with a flag)
create policy "events read all"
on public.events for select
using (true);

-- host manages their own events
create policy "events insert host"
on public.events for insert
with check (auth.uid() = host);

create policy "events update host"
on public.events for update
using (auth.uid() = host)
with check (auth.uid() = host);

create policy "events delete host"
on public.events for delete
using (auth.uid() = host);


-- ---------- REPORTS ----------
drop policy if exists "reports insert own" on public.reports;
drop policy if exists "reports read own"   on public.reports;

-- users can file reports; can read their own
create policy "reports insert own"
on public.reports for insert
with check (auth.uid() = reporter);

create policy "reports read own"
on public.reports for select
using (auth.uid() = reporter);


-- ---------- USER_INTERESTS ----------
drop policy if exists "user_interests read own"   on public.user_interests;
drop policy if exists "user_interests insert own" on public.user_interests;
drop policy if exists "user_interests update own" on public.user_interests;
drop policy if exists "user_interests delete own" on public.user_interests;

-- privacy-first version: only see own interests
create policy "user_interests read own"
on public.user_interests for select
using (auth.uid() = user_id);

create policy "user_interests insert own"
on public.user_interests for insert
with check (auth.uid() = user_id);

create policy "user_interests update own"
on public.user_interests for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_interests delete own"
on public.user_interests for delete
using (auth.uid() = user_id);