-- ============================================================
-- LifePulse — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES
-- Mirrors auth.users; populated automatically via trigger.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- Trigger: create a profile row whenever a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Insert is handled by the trigger (security definer), but allow direct insert too
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);


-- 2. DAILY LOGS
create table if not exists public.daily_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  log_date   date not null,
  mood       smallint not null check (mood between 1 and 5),
  energy     smallint not null check (energy between 1 and 10),
  note       text default '',
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

alter table public.daily_logs enable row level security;

create policy "Users can view own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.daily_logs for delete
  using (auth.uid() = user_id);


-- 3. CONTACTS
create table if not exists public.contacts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  name             text not null,
  relationship     text not null check (relationship in ('friend','family','colleague','mentor')),
  frequency_days   int not null default 7,
  last_contacted   timestamptz not null default now(),
  notes            text default '',
  created_at       timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "Users can view own contacts"
  on public.contacts for select
  using (auth.uid() = user_id);

create policy "Users can insert own contacts"
  on public.contacts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own contacts"
  on public.contacts for update
  using (auth.uid() = user_id);

create policy "Users can delete own contacts"
  on public.contacts for delete
  using (auth.uid() = user_id);


-- 4. INTERACTIONS
create table if not exists public.interactions (
  id               uuid primary key default gen_random_uuid(),
  contact_id       uuid not null references public.contacts(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  interaction_date timestamptz not null default now(),
  type             text not null check (type in ('call','text','in-person','email','video','other')),
  note             text default '',
  created_at       timestamptz not null default now()
);

alter table public.interactions enable row level security;

create policy "Users can view own interactions"
  on public.interactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own interactions"
  on public.interactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own interactions"
  on public.interactions for update
  using (auth.uid() = user_id);

create policy "Users can delete own interactions"
  on public.interactions for delete
  using (auth.uid() = user_id);
