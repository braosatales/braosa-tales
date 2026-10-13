-- ============================================================================
-- Braosa Tales — player dashboard: campaigns, memberships, invites, pinned tools
-- Run ONCE in the Supabase SQL editor (project irvixvhpwgsubwbxninv), BEFORE
-- deploying the dashboard code. Safe to re-run.
-- ============================================================================

begin;

-- Campaigns shown on dashboards ----------------------------------------------
create table if not exists public.campaigns (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  tagline      text,
  system       text,
  levels       text,
  cover_url    text,
  hub_path     text,              -- campaign website, e.g. '/the8adventurers'; null = "opening soon"
  status       text not null default 'active' check (status in ('active', 'paused', 'finished')),
  invite_code  text unique not null default replace(gen_random_uuid()::text, '-', ''),
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

-- Who is in which campaign ---------------------------------------------------
create table if not exists public.campaign_members (
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'player' check (role in ('gm', 'player')),
  joined_at    timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

-- Added by email before the person has an account ------------------------------
create table if not exists public.campaign_invites (
  campaign_id  uuid not null references public.campaigns(id) on delete cascade,
  email        text not null,
  invited_at   timestamptz not null default now(),
  primary key (campaign_id, email)
);

-- Atelier tools a user pinned to their dashboard -------------------------------
create table if not exists public.user_pinned_tools (
  user_id    uuid not null references auth.users(id) on delete cascade,
  tool_slug  text not null,
  pinned_at  timestamptz not null default now(),
  primary key (user_id, tool_slug)
);

-- RLS: the app reads/writes through the service role; these only allow a signed-in
-- user to read their own rows if a browser client ever asks.
alter table public.campaigns          enable row level security;
alter table public.campaign_members   enable row level security;
alter table public.campaign_invites   enable row level security;
alter table public.user_pinned_tools  enable row level security;

drop policy if exists "members_read_own"   on public.campaign_members;
drop policy if exists "campaigns_members"  on public.campaigns;
drop policy if exists "pins_own"           on public.user_pinned_tools;

create policy "members_read_own" on public.campaign_members
  for select using (user_id = auth.uid());
create policy "campaigns_members" on public.campaigns
  for select using (exists (select 1 from public.campaign_members m where m.campaign_id = campaigns.id and m.user_id = auth.uid()));
create policy "pins_own" on public.user_pinned_tools
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Seed the three campaigns -----------------------------------------------------
insert into public.campaigns (slug, title, tagline, system, levels, cover_url, hub_path, sort_order) values
  ('the-8-adventurers',     'The Eight Adventurers', null,                                       'D&D 5e', null,   null,                                  '/the8adventurers', 0),
  ('eve-of-giants',         'Eve of Giants',         'Who gets to remake the world?',             'D&D 5e (2024)', '1–20', '/campaigns/eve-of-giants.webp',        null, 1),
  ('wings-over-phandalin',  'Wings over Phandalin',  'Someone is buying the end of the world.',   'D&D 5e (2024)', '1–15', '/campaigns/wings-over-phandalin.webp', null, 2)
on conflict (slug) do nothing;

-- You are the GM of all three ----------------------------------------------------
insert into public.campaign_members (campaign_id, user_id, role)
select c.id, u.id, 'gm'
from public.campaigns c
cross join auth.users u
where lower(u.email) = 'braosa.tales@gmail.com'
on conflict (campaign_id, user_id) do update set role = 'gm';

-- Players already linked to an account in the 8 Adventurers hub ----------------
insert into public.campaign_members (campaign_id, user_id, role)
select c.id, p.user_id, 'player'
from public.the8_players p
join public.campaigns c on c.slug = 'the-8-adventurers'
where p.user_id is not null
on conflict (campaign_id, user_id) do nothing;

-- Email invites become memberships when that person's account is confirmed -----
create or replace function public.claim_campaign_invites()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null or new.email is null then
    return new;
  end if;
  insert into public.campaign_members (campaign_id, user_id, role)
  select i.campaign_id, new.id, 'player'
  from public.campaign_invites i
  where lower(i.email) = lower(new.email)
  on conflict (campaign_id, user_id) do nothing;
  delete from public.campaign_invites where lower(email) = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_claim_invites on auth.users;
create trigger on_auth_user_claim_invites
  after insert or update of email_confirmed_at, email on auth.users
  for each row execute function public.claim_campaign_invites();

commit;

-- Check:
-- select c.title, m.role, u.email from public.campaign_members m
--   join public.campaigns c on c.id = m.campaign_id join auth.users u on u.id = m.user_id order by c.sort_order;
