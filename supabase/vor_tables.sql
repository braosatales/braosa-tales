-- ============================================================================
-- Braosa Tales — Vôr redesign: StartPlaying is the master for session dates,
-- and João approves posts in Clot (his iPhone app) instead of the Manage page.
--
--   campaigns.startplaying_listing   the listing id in each StartPlaying event's link
--   campaign_sessions.startplaying_uid  the iCal event this session came from
--   campaign_sessions.recap_draft / analysed_at   Claude's recap from the transcript
--   discord_messages.change_request  what João asked Claude to change
--   discord_messages.drafted_at      when the current draft was written
--   discord_messages.notified_at / nudged_at / failure_notified_at
--                                    when Vôr DM'd João about it (once each)
--
-- Run ONCE in the Supabase SQL editor, AFTER discord_reminders.sql. Safe to re-run.
-- ============================================================================

begin;

-- 1. Which StartPlaying listing is which campaign --------------------------------
alter table public.campaigns add column if not exists startplaying_listing text;
create unique index if not exists campaigns_startplaying_listing
  on public.campaigns (startplaying_listing) where startplaying_listing is not null;

update public.campaigns set startplaying_listing = '00fsjv06zhjz2yfa'
 where slug = 'wings-over-phandalin' and startplaying_listing is null;
update public.campaigns set startplaying_listing = '003zjy06bvggk3uo'
 where slug = 'eve-of-giants' and startplaying_listing is null;   -- listed as "Vecna: Eve of Ruin"
-- The 8 Adventurers isn't on StartPlaying: its sessions stay manual.

-- 2. Sessions remember their StartPlaying event and carry the recap ----------------
alter table public.campaign_sessions add column if not exists startplaying_uid text;
alter table public.campaign_sessions add column if not exists recap_draft      text;
alter table public.campaign_sessions add column if not exists analysed_at      timestamptz;
create unique index if not exists campaign_sessions_startplaying_uid
  on public.campaign_sessions (startplaying_uid) where startplaying_uid is not null;

-- 3. Drafting and notices on each post ----------------------------------------------
alter table public.discord_messages add column if not exists change_request      text;
alter table public.discord_messages add column if not exists drafted_at          timestamptz;
alter table public.discord_messages add column if not exists notified_at         timestamptz;
alter table public.discord_messages add column if not exists nudged_at           timestamptz;
alter table public.discord_messages add column if not exists failure_notified_at timestamptz;

-- 4. A moved session gets a fresh deadline nudge ------------------------------------
create or replace function public.reset_nudge_on_move()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.discord_messages
     set nudged_at = null
   where session_id = new.id and status in ('draft', 'approved');
  return null;
end;
$$;

drop trigger if exists campaign_sessions_reset_nudge on public.campaign_sessions;
create trigger campaign_sessions_reset_nudge
  after update of starts_at, ends_at on public.campaign_sessions
  for each row when (old.starts_at is distinct from new.starts_at or old.ends_at is distinct from new.ends_at)
  execute function public.reset_nudge_on_move();

commit;

-- Check:
-- select slug, startplaying_listing from public.campaigns order by sort_order;
-- select column_name from information_schema.columns where table_name = 'discord_messages' and column_name like '%_at' order by 1;
