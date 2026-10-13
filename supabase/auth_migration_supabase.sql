-- ============================================================================
-- Braosa Tales — move auth to Supabase Auth  (project irvixvhpwgsubwbxninv)
-- ============================================================================
-- Run ONCE in the Supabase SQL editor, BEFORE deploying the new code.
-- Idempotent where possible. Wrapped in a transaction: all or nothing.
--
-- What it does
--   1. Snapshots old account identities into legacy_* bridge tables (for reclaim)
--   2. FKs that point at users(id) get ON UPDATE CASCADE (so reclaim can re-key)
--   3. Drops the old RLS policies + users.clerk_id
--   4. users.id now references auth.users(id)   → users.id = auth.uid()
--   5. New RLS policies on auth.uid()
--   6. the8_players.clerk_user_id → the8_players.user_id (uuid → auth.users)
--   7. Trigger on auth.users: on email confirmation, RECLAIM the old users row
--      with the same email (credits, tier, saved names, history, presets,
--      8 Adventurers notes + player link) — or create a fresh row.
-- ============================================================================

begin;

-- 1. Bridge tables (service-role only: RLS on, no policies) ------------------
create table if not exists public.legacy_clerk_accounts (
  clerk_id        text primary key,
  email           text not null,
  legacy_user_id  uuid not null,
  claimed_by      uuid,
  claimed_at      timestamptz
);
alter table public.legacy_clerk_accounts enable row level security;

create table if not exists public.legacy_clerk_player_links (
  player_id  uuid primary key references public.the8_players(id) on delete cascade,
  clerk_id   text not null
);
alter table public.legacy_clerk_player_links enable row level security;

do $$
begin
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'users' and column_name = 'clerk_id') then
    insert into public.legacy_clerk_accounts (clerk_id, email, legacy_user_id)
    select clerk_id, lower(trim(email)), id from public.users
    where clerk_id is not null and coalesce(email, '') <> ''
    on conflict (clerk_id) do nothing;
  end if;

  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'the8_players' and column_name = 'clerk_user_id') then
    insert into public.legacy_clerk_player_links (player_id, clerk_id)
    select id, clerk_user_id from public.the8_players
    where coalesce(clerk_user_id, '') <> ''
    on conflict (player_id) do nothing;
  end if;
end $$;

-- 2. Every FK referencing public.users(id) → ON UPDATE CASCADE --------------
do $$
declare r record;
begin
  for r in
    select con.conname, rel.relname as tbl, att.attname as col, con.confdeltype
    from pg_constraint con
    join pg_class rel      on rel.oid = con.conrelid
    join pg_namespace ns   on ns.oid = rel.relnamespace and ns.nspname = 'public'
    join pg_attribute att  on att.attrelid = con.conrelid and att.attnum = con.conkey[1]
    where con.contype = 'f'
      and con.confrelid = 'public.users'::regclass
      and array_length(con.conkey, 1) = 1
  loop
    execute format('alter table public.%I drop constraint %I', r.tbl, r.conname);
    execute format(
      'alter table public.%I add constraint %I foreign key (%I) references public.users(id) on update cascade on delete %s',
      r.tbl, r.conname, r.col,
      case r.confdeltype when 'c' then 'cascade' when 'n' then 'set null' when 'r' then 'restrict' when 'd' then 'set default' else 'no action' end
    );
  end loop;
end $$;

-- 3. Old policies (they depend on clerk_id) + the column itself --------------
do $$
declare t text; p text;
begin
  for t, p in values
    ('users', 'Users can read own row'),
    ('users', 'Users can update own row'),
    ('saved_names', 'Users can read own saved names'),
    ('generation_history', 'Users can read own history'),
    ('generated_names_log', 'Users can read own name log'),
    ('presets', 'Users can read own presets')
  loop
    if to_regclass('public.' || t) is not null then
      execute format('drop policy if exists %I on public.%I', p, t);
    end if;
  end loop;
end $$;

alter table public.users drop column if exists clerk_id;

-- 4. users.id = auth.uid() ---------------------------------------------------
-- NOT VALID: existing (unclaimed legacy) rows aren't checked yet, but every new
-- insert/update must point at a real auth user. Validate later (see bottom).
alter table public.users alter column id drop default;
alter table public.users drop constraint if exists users_id_fkey;
alter table public.users
  add constraint users_id_fkey foreign key (id) references auth.users(id) on delete cascade not valid;

-- 5. RLS on auth.uid() -------------------------------------------------------
-- The app writes through the service role. Browser clients may only READ their
-- own users row — never update it (credits/tier live there).
do $$
begin
  drop policy if exists "users_select_own" on public.users;
  create policy "users_select_own" on public.users for select using (id = auth.uid());

  if to_regclass('public.saved_names') is not null then
    drop policy if exists "saved_names_own" on public.saved_names;
    create policy "saved_names_own" on public.saved_names for all
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if to_regclass('public.presets') is not null then
    drop policy if exists "presets_own" on public.presets;
    create policy "presets_own" on public.presets for all
      using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;
  if to_regclass('public.generation_history') is not null then
    drop policy if exists "generation_history_select_own" on public.generation_history;
    create policy "generation_history_select_own" on public.generation_history for select using (user_id = auth.uid());
  end if;
  if to_regclass('public.generated_names_log') is not null then
    drop policy if exists "generated_names_log_select_own" on public.generated_names_log;
    create policy "generated_names_log_select_own" on public.generated_names_log for select using (user_id = auth.uid());
  end if;
end $$;

-- 6. 8 Adventurers: player ↔ account link -----------------------------------
alter table public.the8_players
  add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.the8_players drop column if exists clerk_user_id;
-- the8_session_notes.user_id stays text; new rows hold auth.uid()::text.

-- 7. Create-or-reclaim trigger on auth.users ---------------------------------
create or replace function public.handle_auth_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email     text := lower(trim(new.email));
  v_legacy_id uuid;
begin
  -- Only act on verified accounts (Google sign-ins arrive verified).
  if new.email_confirmed_at is null then
    return new;
  end if;

  -- Already linked: just keep email in sync.
  if exists (select 1 from public.users where id = new.id) then
    update public.users set email = new.email where id = new.id and email is distinct from new.email;
    return new;
  end if;

  -- Reclaim: newest unclaimed legacy row with the same (verified) email.
  select u.id into v_legacy_id
  from public.users u
  where lower(trim(u.email)) = v_email
    and not exists (select 1 from auth.users a where a.id = u.id)
  order by u.last_active desc nulls last
  limit 1;

  if v_legacy_id is not null then
    -- Re-key the row; ON UPDATE CASCADE carries saved_names/history/presets/log.
    update public.users set id = new.id, email = new.email, last_active = now() where id = v_legacy_id;

    update public.the8_session_notes n
       set user_id = new.id::text
      from public.legacy_clerk_accounts l
     where l.legacy_user_id = v_legacy_id and n.user_id = l.clerk_id;

    update public.the8_players p
       set user_id = new.id
      from public.legacy_clerk_player_links pl
      join public.legacy_clerk_accounts l on l.clerk_id = pl.clerk_id
     where l.legacy_user_id = v_legacy_id and p.id = pl.player_id and p.user_id is null;

    update public.legacy_clerk_accounts
       set claimed_by = new.id, claimed_at = now()
     where legacy_user_id = v_legacy_id;
  else
    insert into public.users (id, email, full_name, tier, credits, daily_credits, signed_up_at, last_active)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
      'wanderer', 100, 5, now(), now()
    )
    on conflict (id) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after insert or update of email_confirmed_at, email on auth.users
  for each row execute function public.handle_auth_user_confirmed();

commit;

-- ============================================================================
-- Sanity checks (run after)
-- ============================================================================
-- select count(*) as legacy_unclaimed from public.users u where not exists (select 1 from auth.users a where a.id = u.id);
-- select * from public.legacy_clerk_accounts order by claimed_at nulls first;

-- ============================================================================
-- LATER — once alpha users have re-signed up (or you've given up on the rest):
-- ============================================================================
-- delete from public.users u where not exists (select 1 from auth.users a where a.id = u.id);
-- alter table public.users validate constraint users_id_fkey;
-- drop table public.legacy_clerk_player_links;
-- drop table public.legacy_clerk_accounts;
