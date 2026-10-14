-- ============================================================================
-- Braosa Tales — campaign engine
-- Turns The Eight Adventurers hub into one engine that serves every campaign:
-- every hub table gets a campaign_id, campaigns get a description and links,
-- characters can sync from D&D Beyond, and players can pin lore and quests.
--
-- Run ONCE in the Supabase SQL editor, AFTER dashboard_campaigns.sql and
-- account_settings.sql, and BEFORE deploying the code. Safe to re-run.
-- Existing Eight Adventurers content is kept and assigned to that campaign.
-- ============================================================================

begin;

-- 1. Campaign details ---------------------------------------------------------
alter table public.campaigns add column if not exists description text;
alter table public.campaigns add column if not exists links jsonb not null default '[]'::jsonb;  -- [{ "label": "Discord", "url": "https://…" }]
alter table public.campaigns add column if not exists created_by uuid references auth.users(id) on delete set null;

-- Every campaign now has a site at /campaigns/<slug>
update public.campaigns set hub_path = '/campaigns/' || slug where hub_path is distinct from '/campaigns/' || slug;

-- 2. Hub tables belong to a campaign -------------------------------------------
do $$
declare
  cid uuid;
  t   text;
begin
  select id into cid from public.campaigns where slug = 'the-8-adventurers';
  if cid is null then
    raise exception 'Campaign the-8-adventurers not found. Run dashboard_campaigns.sql first.';
  end if;

  foreach t in array array[
    'the8_players', 'the8_achievements', 'the8_lore_entries', 'the8_quests',
    'the8_maps', 'the8_session_recaps', 'the8_timeline_events', 'the8_session_notes'
  ] loop
    execute format('alter table public.%I add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade', t);
    execute format('update public.%I set campaign_id = %L where campaign_id is null', t, cid);
    execute format('alter table public.%I alter column campaign_id set not null', t);
    execute format('create index if not exists %I on public.%I (campaign_id)', t || '_campaign_idx', t);
  end loop;
end $$;

-- Journals: one per person per campaign (was one per person)
alter table public.the8_session_notes drop constraint if exists the8_session_notes_user_id_key;
create unique index if not exists the8_session_notes_campaign_user on public.the8_session_notes (campaign_id, user_id);

-- 3. Characters can follow a D&D Beyond sheet ----------------------------------
alter table public.the8_players add column if not exists ddb_character_id text;
alter table public.the8_players add column if not exists ddb_synced_at    timestamptz;
alter table public.the8_players add column if not exists ddb_error        text;

-- Character identity lives on the party sheet (the8_players), so these are no longer needed
alter table public.campaign_members drop column if exists character_name;
alter table public.campaign_members drop column if exists character_avatar_url;

-- 4. Pins: lore and quests a player keeps on their campaign overview --------------
create table if not exists public.campaign_pins (
  user_id     uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  kind        text not null check (kind in ('lore', 'quest')),
  item_id     uuid not null,
  pinned_at   timestamptz not null default now(),
  primary key (user_id, kind, item_id)
);
create index if not exists campaign_pins_user_campaign on public.campaign_pins (user_id, campaign_id);

-- The website reads and writes through the server (service role); nobody else gets in.
alter table public.campaign_pins enable row level security;
drop policy if exists "pins_deny_all" on public.campaign_pins;
create policy "pins_deny_all" on public.campaign_pins for all to public using (false);

commit;

-- Check (should list every hub table with a count for The Eight Adventurers):
-- select 'lore' t, count(*) from the8_lore_entries where campaign_id is not null
-- union all select 'quests', count(*) from the8_quests where campaign_id is not null
-- union all select 'players', count(*) from the8_players where campaign_id is not null;
