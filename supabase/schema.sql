-- Users (CRM)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  full_name text,
  tier text default 'wanderer',
  credits integer default 100,
  credits_reset_date timestamptz default now() + interval '30 days',
  daily_credits integer default 5,
  daily_reset_date timestamptz default now(),
  signed_up_at timestamptz default now(),
  last_active timestamptz default now()
);

-- Saved names
create table saved_names (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  pronunciation text,
  language text,
  root_words text,
  meaning text,
  resonance text,
  saved_at timestamptz default now()
);

-- Generation history
create table generation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  target text,
  languages jsonb,
  vibe text,
  themes jsonb,
  style text,
  results jsonb,
  credits_used integer,
  generated_at timestamptz default now()
);

-- Generated names log (dedup)
create table generated_names_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  generated_at timestamptz default now()
);

-- Presets
create table presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  settings jsonb not null,
  created_at timestamptz default now()
);

-- Waitlist
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'games',
  signed_up_at timestamptz default now(),
  unique(email, source)
);

-- Newsletter
create table newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean default true,
  signed_up_at timestamptz default now()
);

-- Stripe events log
create table stripe_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text unique not null,
  type text not null,
  payload jsonb,
  processed_at timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table saved_names enable row level security;
alter table generation_history enable row level security;
alter table generated_names_log enable row level security;
alter table presets enable row level security;
alter table waitlist enable row level security;
alter table newsletter enable row level security;
alter table stripe_events enable row level security;

-- RLS Policies
create policy "Users can read own row" on users for select using (clerk_id = current_setting('app.clerk_id', true));
create policy "Users can update own row" on users for update using (clerk_id = current_setting('app.clerk_id', true));
create policy "Users can read own saved names" on saved_names for all using (user_id = (select id from users where clerk_id = current_setting('app.clerk_id', true)));
create policy "Users can read own history" on generation_history for all using (user_id = (select id from users where clerk_id = current_setting('app.clerk_id', true)));
create policy "Users can read own name log" on generated_names_log for all using (user_id = (select id from users where clerk_id = current_setting('app.clerk_id', true)));
create policy "Users can read own presets" on presets for all using (user_id = (select id from users where clerk_id = current_setting('app.clerk_id', true)));
create policy "Anyone can insert waitlist" on waitlist for insert with check (true);
create policy "Anyone can insert newsletter" on newsletter for insert with check (true);
create policy "Service role only on stripe_events" on stripe_events for all using (false);
