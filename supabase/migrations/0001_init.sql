-- ============================================================================
-- DA // LEARNING OS  —  initial schema  (FROZEN CONTRACT)
-- ----------------------------------------------------------------------------
-- Every table has Row Level Security ON. The only rows a signed-in user can
-- read or write are their own (user_id = auth.uid()), except reference data
-- (video_catalog) which is world-readable and only written by migrations /
-- the service role.
--
-- Apply with either:
--   supabase db push                     (Supabase CLI, preferred)
--   or paste this whole file into the SQL Editor in the Supabase dashboard
--
-- Safe to re-run: uses IF NOT EXISTS and drops policies before recreating.
-- ============================================================================

-- ---------- helpers ---------------------------------------------------------

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- create a profile row automatically when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, split_part(coalesce(new.email, 'analyst'), '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- profiles ------------------------------------------------------

create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  theme         text not null default 'dark' check (theme in ('dark','light')),
  wallpaper_id  text not null default 'starfield',
  onboarding_done boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- curriculum progress ----------------------------------------

create table if not exists public.node_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  node_id     text not null,
  node_level  text not null check (node_level in ('topic','sub')),
  topic_id    text,
  state       text not null default 'available'
              check (state in ('available','active','completed')),
  started_at  timestamptz,
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  unique (user_id, node_id)
);
create index if not exists node_progress_user_idx on public.node_progress(user_id);

-- ---------- xp + activity --------------------------------------------------

create table if not exists public.xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  action     text not null,
  amount     integer not null,
  meta       jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists xp_events_user_idx on public.xp_events(user_id, created_at desc);

create table if not exists public.heatmap_activity (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null default (now() at time zone 'utc')::date,
  source     text not null,   -- daily_log | video | game | canvas | case_start | case_submit | node_complete | review
  weight     integer not null check (weight between 1 and 4),
  created_at timestamptz not null default now()
);
create index if not exists heatmap_user_day_idx on public.heatmap_activity(user_id, day);

-- ---------- daily log ----------------------------------------------------

create table if not exists public.daily_log (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null default (now() at time zone 'utc')::date,
  body       text not null check (char_length(body) <= 280),
  node_tag   text,
  locked     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

-- ---------- notes + textbook -------------------------------------------

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  node_id    text not null,
  body       text not null default '',
  updated_at timestamptz not null default now(),
  unique (user_id, node_id)
);

create table if not exists public.chapter_reads (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  chapter_slug text not null,
  book         text,
  read_at      timestamptz not null default now(),
  unique (user_id, chapter_slug)
);

create table if not exists public.bookmarks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  chapter_slug text not null,
  label        text,
  created_at   timestamptz not null default now(),
  unique (user_id, chapter_slug)
);

-- ---------- video ------------------------------------------------------

-- reference data: world-readable, written by scripts/import-videos.mjs
create table if not exists public.video_catalog (
  id               text primary key,           -- youtube video id
  title            text not null,
  channel          text not null,
  duration_seconds integer,
  difficulty       text check (difficulty in ('beginner','intermediate','advanced')),
  skill_tags       text[] not null default '{}',
  created_at       timestamptz not null default now()
);

create table if not exists public.video_watches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  video_id   text not null references public.video_catalog(id) on delete cascade,
  watched_at timestamptz not null default now(),
  note       text,
  unique (user_id, video_id)
);

create table if not exists public.watch_queue (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  video_id text not null references public.video_catalog(id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (user_id, video_id)
);

-- ---------- case files -----------------------------------------------
-- case CONTENT lives in the repo as markdown (app/content/cases/*.md).
-- only submissions are stored.

create table if not exists public.case_submissions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  case_id        text not null,
  status         text not null default 'in_progress'
                 check (status in ('in_progress','submitted','complete','complete_override')),
  body           text not null default '',
  pm_ai_response jsonb,
  started_at     timestamptz not null default now(),
  submitted_at   timestamptz,
  updated_at     timestamptz not null default now(),
  unique (user_id, case_id)
);

-- ---------- PM-AI ----------------------------------------------------

create table if not exists public.pm_ai_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('user','assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists pm_ai_messages_user_idx on public.pm_ai_messages(user_id, created_at);

create table if not exists public.pm_ai_declines (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  kind           text not null check (kind in ('decline','override','disagreement')),
  prompt_summary text not null,
  response       text,
  case_id        text,
  created_at     timestamptz not null default now()
);

-- ---------- canvas --------------------------------------------------

create table if not exists public.canvases (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null default 'Untitled Canvas',
  doc           jsonb not null default '{}',
  thumbnail_url text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists canvases_user_idx on public.canvases(user_id, updated_at desc);

-- ---------- games -------------------------------------------------

create table if not exists public.game_scores (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  game      text not null check (game in ('sql_dojo','data_detective','pivot_puzzle','chart_critiquer')),
  level     integer not null default 1,
  score     integer not null default 0,
  meta      jsonb not null default '{}',
  played_at timestamptz not null default now()
);
create index if not exists game_scores_user_idx on public.game_scores(user_id, game);

create table if not exists public.game_attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  game       text not null,
  level      integer not null,
  passed     boolean not null,
  detail     jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------- spaced repetition -----------------------------------

create table if not exists public.review_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  node_id          text not null,
  concept          text not null,
  ease             real not null default 2.5,
  interval_days    integer not null default 0,
  reps             integer not null default 0,
  due_on           date not null default (now() at time zone 'utc')::date,
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now(),
  unique (user_id, node_id, concept)
);
create index if not exists review_items_due_idx on public.review_items(user_id, due_on);

-- ---------- onboarding + toolkit ------------------------------

create table if not exists public.diagnostic_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  answers      jsonb not null default '{}',
  seeded_nodes text[] not null default '{}',
  score        jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create table if not exists public.tool_installs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  tool_id      text not null,
  installed_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

-- ---------- updated_at triggers ---------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','node_progress','daily_log','notes','case_submissions','canvases'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ============================================================================
-- Row Level Security
-- ============================================================================

-- every user-scoped table: enable RLS + one "own rows" policy for all verbs
do $$
declare t text;
begin
  foreach t in array array[
    'node_progress','xp_events','heatmap_activity','daily_log','notes',
    'chapter_reads','bookmarks','video_watches','watch_queue','case_submissions',
    'pm_ai_messages','pm_ai_declines','canvases','game_scores','game_attempts',
    'review_items','diagnostic_results','tool_installs'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists own_rows on public.%I', t);
    execute format(
      'create policy own_rows on public.%I
         for all
         using (user_id = auth.uid())
         with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- profiles: keyed by id, not user_id
alter table public.profiles enable row level security;
drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- video_catalog: world-readable reference data, no client writes
alter table public.video_catalog enable row level security;
drop policy if exists catalog_read on public.video_catalog;
create policy catalog_read on public.video_catalog for select using (true);
