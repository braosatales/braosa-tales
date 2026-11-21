-- ============================================================================
-- Braosa Tales — Vôr learns from João's corrections.
--
-- Run AFTER vor_tables.sql. Safe to re-run.
--
--  - discord_messages.ai_draft: Claude's last version of a post (João's edits go to draft_content)
--  - campaign_sessions.ai_recap: Claude's recap from the transcript (João's edits go to recap_draft)
--  - vor_feedback: each correction (before → after) and each "what should change" note.
--    The bridge feeds the latest ones to Claude as examples when it writes.
-- ============================================================================
begin;

alter table public.discord_messages  add column if not exists ai_draft text;
alter table public.campaign_sessions add column if not exists ai_recap text;

create table if not exists public.vor_feedback (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  session_id  uuid references public.campaign_sessions(id) on delete cascade,
  message_id  uuid references public.discord_messages(id) on delete cascade,
  kind        text not null check (kind in ('confirm_3d', 'final_24h', 'post_session', 'announcement', 'recap')),
  before      text,      -- what Claude wrote
  after       text,      -- what João made of it (null for a note)
  note        text,      -- João's "what should change" (null for an edit)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One edit row per post and per recap (later edits update it); notes are one row each.
create unique index if not exists vor_feedback_post_edit  on public.vor_feedback (message_id) where note is null and message_id is not null;
create unique index if not exists vor_feedback_recap_edit on public.vor_feedback (session_id) where kind = 'recap';
create index if not exists vor_feedback_recent on public.vor_feedback (created_at desc);

-- Server only (service role); nobody reads it from the browser.
alter table public.vor_feedback enable row level security;

commit;
