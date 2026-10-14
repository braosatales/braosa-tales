-- ============================================================================
-- Braosa Tales — account settings: avatar and preferences
-- Run ONCE in the Supabase SQL editor, BEFORE deploying the settings code.
-- Requires dashboard_campaigns.sql to have run first. Safe to re-run.
-- ============================================================================

begin;

-- Profile picture + display preferences on the user's row
alter table public.users add column if not exists avatar_url  text;
alter table public.users add column if not exists preferences jsonb not null default '{}'::jsonb;

-- Public bucket for profile and character pictures.
-- Uploads go through the website's server (service role), so no write policies are needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

commit;
