-- ============================================================================
-- Braosa Tales — Vôr: Discord session reminders and announcements
--
-- Each campaign gets a Discord channel, a language and two fixed reminder
-- texts. Each scheduled session automatically gets three messages in the queue:
--   post_session  after the session ends, only goes out once João approves it,
--                 expires 24h after the end
--   confirm_3d    3 days before; the approved draft goes out, otherwise the fixed text
--   final_24h     24h before;    the approved draft goes out, otherwise the fixed text
-- One-off announcements (kind = 'announcement') always need approval.
--
-- The website (Vercel Cron, service role) sends what is due. Nobody else gets in.
-- Run ONCE in the Supabase SQL editor, AFTER campaign_listings.sql. Safe to re-run.
-- ============================================================================

begin;

-- 1. Discord settings per campaign ----------------------------------------------
alter table public.campaigns add column if not exists discord_channel_id text;   -- where Vôr posts for this group
alter table public.campaigns add column if not exists discord_language   text not null default 'en'
  check (discord_language in ('en', 'pt'));
-- Fixed texts used when a draft was not approved in time.
-- Placeholders: {campaign} {session} {when} (full date in each reader's timezone) {in} ("in 3 days")
alter table public.campaigns add column if not exists discord_templates  jsonb not null default '{}'::jsonb;

-- 2. Scheduled sessions -------------------------------------------------------------
create table if not exists public.campaign_sessions (
  id              uuid primary key default gen_random_uuid(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  session_number  int check (session_number is null or session_number > 0),
  title           text,
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  status          text not null default 'scheduled' check (status in ('scheduled', 'played', 'cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists campaign_sessions_campaign_start on public.campaign_sessions (campaign_id, starts_at);

-- 3. Message queue --------------------------------------------------------------------
create table if not exists public.discord_messages (
  id                  uuid primary key default gen_random_uuid(),
  campaign_id         uuid references public.campaigns(id) on delete cascade,
  session_id          uuid references public.campaign_sessions(id) on delete cascade,
  kind                text not null check (kind in ('post_session', 'confirm_3d', 'final_24h', 'announcement')),
  channel_id          text,                      -- null = the campaign's discord_channel_id
  send_at             timestamptz not null,      -- earliest moment it may go out
  expires_at          timestamptz,               -- after this, an unapproved message is skipped
  draft_content       text,                      -- written by Claude/João, edited in Manage
  status              text not null default 'draft'
    check (status in ('draft', 'approved', 'sending', 'sent', 'skipped', 'cancelled', 'failed')),
  approved_at         timestamptz,
  approved_by         uuid references auth.users(id) on delete set null,
  sent_at             timestamptz,
  sent_content        text,                      -- exactly what went out (draft or fixed text)
  used_fallback       boolean not null default false,
  discord_message_id  text,
  attempts            int not null default 0,
  last_error          text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (session_id is not null or kind = 'announcement'),
  check (channel_id is not null or campaign_id is not null)
);
-- One of each reminder per session
create unique index if not exists discord_messages_session_kind on public.discord_messages (session_id, kind) where session_id is not null;
-- What the cron looks at
create index if not exists discord_messages_due on public.discord_messages (send_at) where status in ('draft', 'approved');

-- 4. A session creates, moves or cancels its three messages by itself ------------------
-- Messages already sent (or being sent) are never touched.
create or replace function public.sync_session_messages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'cancelled' then
    update public.discord_messages
       set status = 'cancelled', updated_at = now()
     where session_id = new.id and status in ('draft', 'approved');
    return null;
  end if;

  insert into public.discord_messages (campaign_id, session_id, kind, send_at, expires_at)
  values
    (new.campaign_id, new.id, 'confirm_3d',   new.starts_at - interval '3 days',   new.starts_at),
    (new.campaign_id, new.id, 'final_24h',    new.starts_at - interval '24 hours', new.starts_at),
    (new.campaign_id, new.id, 'post_session', new.ends_at,                         new.ends_at + interval '24 hours')
  on conflict (session_id, kind) where session_id is not null do update
     set send_at    = excluded.send_at,
         expires_at = excluded.expires_at,
         status     = case when discord_messages.status = 'cancelled' then 'draft' else discord_messages.status end,
         updated_at = now()
   where discord_messages.status in ('draft', 'approved', 'cancelled');

  return null;
end;
$$;

drop trigger if exists campaign_sessions_messages     on public.campaign_sessions;

create trigger campaign_sessions_messages
  after insert or update of starts_at, ends_at, status on public.campaign_sessions
  for each row execute function public.sync_session_messages();

-- 5. Locked down: only the website's server (service role) reads and writes -----------
alter table public.campaign_sessions enable row level security;
alter table public.discord_messages  enable row level security;
drop policy if exists "sessions_deny_all"         on public.campaign_sessions;
drop policy if exists "discord_messages_deny_all" on public.discord_messages;
create policy "sessions_deny_all"         on public.campaign_sessions for all to public using (false);
create policy "discord_messages_deny_all" on public.discord_messages  for all to public using (false);

-- 6. Channels and languages of the three groups (only the first time) -----------------
update public.campaigns set discord_channel_id = '1559336537844355092', discord_language = 'en'
 where slug = 'wings-over-phandalin' and discord_channel_id is null;
update public.campaigns set discord_channel_id = '1559350044401074276', discord_language = 'en'
 where slug = 'eve-of-giants' and discord_channel_id is null;
update public.campaigns set discord_channel_id = '1559353165852188692', discord_language = 'pt'
 where slug = 'the-8-adventurers' and discord_channel_id is null;

-- 7. Starting fixed texts (João rewrites them in his own words; only fills empty ones) --
update public.campaigns set discord_templates = $${
  "confirm_3d": "**{campaign}, session {session}** is on {when} ({in}). React with ✅ if you're in, or let me know here if something came up.",
  "final_24h":  "Tomorrow: **{campaign}, session {session}**, {when}. See you at the table."
}$$::jsonb
 where slug in ('wings-over-phandalin', 'eve-of-giants') and discord_templates = '{}'::jsonb;

update public.campaigns set discord_templates = $${
  "confirm_3d": "**{campaign}, sessão {session}**: {when} ({in}). Reajam com ✅ se contam estar, ou digam aqui se surgiu alguma coisa.",
  "final_24h":  "Amanhã: **{campaign}, sessão {session}**, {when}. Até lá, à mesa."
}$$::jsonb
 where slug = 'the-8-adventurers' and discord_templates = '{}'::jsonb;

commit;

-- Check:
-- select slug, discord_channel_id, discord_language, discord_templates from public.campaigns order by sort_order;
-- After adding a test session, it should have three messages:
-- select s.starts_at, m.kind, m.send_at, m.expires_at, m.status
--   from public.campaign_sessions s join public.discord_messages m on m.session_id = s.id order by m.send_at;
