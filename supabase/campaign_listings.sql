-- ============================================================================
-- Braosa Tales — public campaign listings, seats and table safety
-- Everything on the Sessions/home campaign cards now lives on the campaign and
-- is edited in its Manage tab. Seats are counted from the players in it.
--
-- Run ONCE in the Supabase SQL editor, AFTER campaign_engine.sql and BEFORE
-- deploying this code. Safe to re-run (won't overwrite edits you've made).
-- ============================================================================

begin;

-- 1. Listing details --------------------------------------------------------
alter table public.campaigns add column if not exists listed          boolean not null default false; -- shown on Sessions + home
alter table public.campaigns add column if not exists listed_as       text;          -- "Listed on StartPlaying as …"
alter table public.campaigns add column if not exists pitch           text;          -- public blurb on the card
alter table public.campaigns add column if not exists acts            jsonb not null default '[]'::jsonb; -- [{ name, levels, summary }]
alter table public.campaigns add column if not exists price           numeric(8,2);
alter table public.campaigns add column if not exists currency        text not null default 'USD';
alter table public.campaigns add column if not exists session_length  text;          -- "3 hours"
alter table public.campaigns add column if not exists frequency       text;          -- "weekly"
alter table public.campaigns add column if not exists booking_url     text;          -- StartPlaying listing
alter table public.campaigns add column if not exists seats_total     int check (seats_total is null or seats_total between 1 and 12);
alter table public.campaigns add column if not exists sessions_played int check (sessions_played is null or sessions_played >= 0);
alter table public.campaigns add column if not exists safety          jsonb not null default '{}'::jsonb; -- { rating, tools[], content[], lines[], veils[], notes }

-- 2. Fill in the two live campaigns from what the site showed until now (only empty fields) --
update public.campaigns set
  listed         = true,
  listed_as      = coalesce(listed_as, $$Storm King's Thunder → Vecna: Eve of Ruin$$),
  pitch          = coalesce(pitch, $$The giants’ ancient order lies shattered, a dragon whispers in a storm king’s court, and the North is burning. Survive it, and a god of secrets will try to rewrite the whole multiverse. One story, three villains, the same ambition at a growing scale.$$),
  acts           = case when acts = '[]'::jsonb then $$[
    {"name":"Phandalin","levels":"1–5","summary":"A drow called the Black Spider hunts a lost forge of spells."},
    {"name":"Storm King’s Thunder","levels":"5–11","summary":"Giants go to war with the small folk, and someone wants it that way."},
    {"name":"Vecna: Eve of Ruin","levels":"11–20","summary":"A lich-god gathers stolen secrets to remake reality in his image."}
  ]$$::jsonb else acts end,
  price          = coalesce(price, 20),
  session_length = coalesce(session_length, '3 hours'),
  frequency      = coalesce(frequency, 'weekly'),
  booking_url    = coalesce(booking_url, 'https://startplaying.games/gm/johnrodrigues'),
  seats_total    = coalesce(seats_total, 5)
where slug = 'eve-of-giants';

update public.campaigns set
  listed         = true,
  listed_as      = coalesce(listed_as, 'Tyranny of Dragons'),
  pitch          = coalesce(pitch, $$Gems vanish from caravans and a dragon cult hoards gold for a goddess. Follow the money up the Sword Coast, make a ruined town your home, and unite frightened cities before Tiamat rises.$$),
  acts           = case when acts = '[]'::jsonb then $$[
    {"name":"Phandalin","levels":"1–6","summary":"Cultists in the shadows, and a white dragon who refused them."},
    {"name":"Follow the money","levels":"6–8","summary":"The stolen hoard leads north, through inns, swamps and a flying castle."},
    {"name":"The war","levels":"8–15","summary":"Councils, alliances and dragons, all the way to the Well of Dragons."}
  ]$$::jsonb else acts end,
  price          = coalesce(price, 20),
  session_length = coalesce(session_length, '3 hours'),
  frequency      = coalesce(frequency, 'weekly'),
  booking_url    = coalesce(booking_url, 'https://startplaying.games/gm/johnrodrigues'),
  seats_total    = coalesce(seats_total, 5)
where slug = 'wings-over-phandalin';

-- 3. "Tell me when a seat opens" -----------------------------------------------
create table if not exists public.campaign_seat_watchers (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  email       text not null,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  notified_at timestamptz,
  unique (campaign_id, email)
);

-- 4. Lines and veils players send privately (no name attached) -----------------
create table if not exists public.campaign_safety_notes (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kind        text not null check (kind in ('line', 'veil', 'other')),
  body        text not null check (char_length(body) between 1 and 500),
  created_at  timestamptz not null default now()
);
create index if not exists campaign_safety_notes_campaign on public.campaign_safety_notes (campaign_id);

-- Only the website's server (service role) reads or writes these.
alter table public.campaign_seat_watchers enable row level security;
alter table public.campaign_safety_notes  enable row level security;
drop policy if exists "watchers_deny_all" on public.campaign_seat_watchers;
drop policy if exists "safety_notes_deny_all" on public.campaign_safety_notes;
create policy "watchers_deny_all" on public.campaign_seat_watchers for all to public using (false);
create policy "safety_notes_deny_all" on public.campaign_safety_notes for all to public using (false);

commit;
