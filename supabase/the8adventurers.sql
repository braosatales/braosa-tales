-- The Eight Adventurers — Campaign Hub Tables
-- Run this in the Supabase SQL editor for project: irvixvhpwgsubwbxninv

-- 1. Lore Entries
create table if not exists the8_lore_entries (
  id uuid default gen_random_uuid() primary key,
  category text not null check (category in ('enemy_boss','enemy_monster','friend','location','faction')),
  title text not null,
  content text,
  is_secret boolean default true,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table the8_lore_entries enable row level security;
create policy "deny all" on the8_lore_entries for all to public using (false);

-- 2. Quests
create table if not exists the8_quests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  is_secret boolean default true,
  is_done boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table the8_quests enable row level security;
create policy "deny all" on the8_quests for all to public using (false);

-- 3. Quest Items
create table if not exists the8_quest_items (
  id uuid default gen_random_uuid() primary key,
  quest_id uuid not null references the8_quests(id) on delete cascade,
  label text not null,
  is_done boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now()
);
alter table the8_quest_items enable row level security;
create policy "deny all" on the8_quest_items for all to public using (false);

-- 4. Timeline Events
create table if not exists the8_timeline_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  event_date text,
  sort_order integer default 0,
  is_secret boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table the8_timeline_events enable row level security;
create policy "deny all" on the8_timeline_events for all to public using (false);

-- 5. World Map (single-row)
create table if not exists the8_world_map (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  caption text,
  updated_at timestamptz default now()
);
alter table the8_world_map enable row level security;
create policy "deny all" on the8_world_map for all to public using (false);

-- 6. Session Recaps
create table if not exists the8_session_recaps (
  id uuid default gen_random_uuid() primary key,
  session_number integer,
  title text,
  content text,
  session_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table the8_session_recaps enable row level security;
create policy "deny all" on the8_session_recaps for all to public using (false);

-- 7. Session Notes (private per-user)
create table if not exists the8_session_notes (
  id uuid default gen_random_uuid() primary key,
  user_id text not null unique,
  content text,
  updated_at timestamptz default now()
);
alter table the8_session_notes enable row level security;
create policy "deny all" on the8_session_notes for all to public using (false);
