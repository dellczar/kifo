-- ═══════════════════════════════════════════════════════════
-- KIFO DATABASE SCHEMA
-- Run in Supabase SQL editor or via: supabase db push
-- ═══════════════════════════════════════════════════════════

create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  plan text not null default 'free' check (plan in ('free', 'premium', 'lifetime')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  subscription_status text,
  subscription_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- MEMORIALS
create table public.memorials (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.profiles(id) on delete cascade not null,
  slug text not null unique,
  first_name text not null,
  middle_name text,
  last_name text not null,
  relationship text,
  date_of_birth date,
  date_of_passing date,
  birthplace text,
  place_of_passing text,
  biography text,
  profile_photo_url text,
  cover_photo_url text,
  theme text default 'sage',
  music_url text,
  music_title text,
  privacy text not null default 'public' check (privacy in ('public', 'private', 'password')),
  password_hash text,
  plan text not null default 'free',
  is_veteran boolean default false,
  special_designation text,
  visitor_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memorial_admins (
  memorial_id uuid references public.memorials(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (memorial_id, user_id)
);

-- TRIBUTES
create table public.tributes (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null,
  author_name text not null,
  author_relationship text,
  content text not null,
  tribute_type text not null default 'tribute' check (tribute_type in ('tribute', 'story', 'candle')),
  is_ai_assisted boolean default false,
  heart_count integer default 0,
  candle_count integer default 0,
  is_approved boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CANDLES
create table public.candles (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  lit_by_id uuid references public.profiles(id) on delete set null,
  lit_by_name text not null,
  message text,
  created_at timestamptz not null default now()
);

-- PHOTOS
create table public.photos (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  url text not null,
  thumbnail_url text,
  caption text,
  taken_at date,
  sort_order integer default 0,
  created_at timestamptz not null default now()
);

-- EVENTS
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  is_virtual boolean default false,
  virtual_url text,
  rsvp_enabled boolean default true,
  created_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  status text not null default 'attending' check (status in ('attending', 'maybe', 'not_attending')),
  created_at timestamptz not null default now()
);

-- REMINDERS
create table public.reminders (
  id uuid primary key default uuid_generate_v4(),
  memorial_id uuid references public.memorials(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reminder_type text not null check (reminder_type in ('birthday', 'anniversary', 'custom')),
  reminder_date date not null,
  is_active boolean default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique(memorial_id, user_id, reminder_type)
);

-- AI USAGE
create table public.ai_usage (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  memorial_id uuid references public.memorials(id) on delete set null,
  tool text not null check (tool in ('tribute_writer', 'life_story', 'biography')),
  tokens_used integer,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.memorials enable row level security;
alter table public.memorial_admins enable row level security;
alter table public.tributes enable row level security;
alter table public.candles enable row level security;
alter table public.photos enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;
alter table public.reminders enable row level security;
alter table public.ai_usage enable row level security;

create policy "Profiles viewable by all" on public.profiles for select using (true);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Public memorials viewable" on public.memorials for select using (privacy = 'public' or owner_id = auth.uid());
create policy "Owners insert memorials" on public.memorials for insert with check (auth.uid() = owner_id);
create policy "Owners update memorials" on public.memorials for update using (auth.uid() = owner_id);
create policy "Owners delete memorials" on public.memorials for delete using (auth.uid() = owner_id);
create policy "Tributes viewable on public memorials" on public.tributes for select using (exists(select 1 from public.memorials m where m.id = memorial_id and m.privacy = 'public'));
create policy "Anyone can post tributes" on public.tributes for insert with check (true);
create policy "Authors update own tributes" on public.tributes for update using (auth.uid() = author_id);
create policy "Candles viewable on public memorials" on public.candles for select using (exists(select 1 from public.memorials m where m.id = memorial_id and m.privacy = 'public'));
create policy "Anyone can light candles" on public.candles for insert with check (true);
create policy "Photos viewable on public memorials" on public.photos for select using (exists(select 1 from public.memorials m where m.id = memorial_id and m.privacy = 'public'));
create policy "Owners manage photos" on public.photos for all using (exists(select 1 from public.memorials m where m.id = memorial_id and m.owner_id = auth.uid()));
create policy "Users view own AI usage" on public.ai_usage for select using (auth.uid() = user_id);
create policy "Users insert own AI usage" on public.ai_usage for insert with check (auth.uid() = user_id);

-- INDEXES
create index idx_memorials_slug on public.memorials(slug);
create index idx_memorials_owner on public.memorials(owner_id);
create index idx_tributes_memorial on public.tributes(memorial_id);
create index idx_candles_memorial on public.candles(memorial_id);
create index idx_photos_memorial on public.photos(memorial_id);
create index idx_events_memorial on public.events(memorial_id);

-- UPDATED_AT
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.memorials for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.tributes for each row execute procedure public.set_updated_at();
