-- The Eight Adventurers — V2 Migration
-- Run in Supabase SQL editor for project: irvixvhpwgsubwbxninv (Braosa Tales)

-- ============================================================
-- DROP old tables (cascade kills dependent FKs/rows)
-- ============================================================
DROP TABLE IF EXISTS the8_lore_entries CASCADE;
DROP TABLE IF EXISTS the8_quests CASCADE;
DROP TABLE IF EXISTS the8_quest_items CASCADE;
DROP TABLE IF EXISTS the8_world_map CASCADE;

-- ============================================================
-- NEW TABLES — in dependency order
-- ============================================================

-- 1. Players (no deps among new tables)
CREATE TABLE the8_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  portrait_url text,
  clerk_user_id text,
  level integer,
  class text,
  race text,
  background text,
  hp_current integer,
  hp_max integer,
  stat_strength integer,
  stat_dexterity integer,
  stat_constitution integer,
  stat_intelligence integer,
  stat_wisdom integer,
  stat_charisma integer,
  public_notes text,
  secret_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_players ENABLE ROW LEVEL SECURITY;

-- 2. Per-field secrecy control
-- field_name: 'portrait','level','class','race','background','hp','stats'
CREATE TABLE the8_player_field_secrecy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES the8_players(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  is_secret boolean NOT NULL DEFAULT false,
  UNIQUE (player_id, field_name)
);
ALTER TABLE the8_player_field_secrecy ENABLE ROW LEVEL SECURITY;

-- 3. Achievements (no deps)
CREATE TABLE the8_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  portrait_url text,
  unlock_text text,
  is_secret boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_achievements ENABLE ROW LEVEL SECURITY;

-- 4. Achievement ↔ Player join table
CREATE TABLE the8_achievement_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id uuid NOT NULL REFERENCES the8_achievements(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES the8_players(id) ON DELETE CASCADE,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (achievement_id, player_id)
);
ALTER TABLE the8_achievement_players ENABLE ROW LEVEL SECURITY;

-- 5. Lore entries (new categories)
CREATE TABLE the8_lore_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('history','locations','friends','foes','factions','monsters')),
  title text NOT NULL,
  description text,
  portrait_url text,
  is_secret boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_lore_entries ENABLE ROW LEVEL SECURITY;

-- 6. Quests (references the8_achievements for reward_achievement_id)
CREATE TABLE the8_quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  portrait_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','in_progress','completed','failed')),
  is_secret boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  reward_platinum integer DEFAULT 0,
  reward_gold integer DEFAULT 0,
  reward_electrum integer DEFAULT 0,
  reward_silver integer DEFAULT 0,
  reward_copper integer DEFAULT 0,
  reward_achievement_id uuid REFERENCES the8_achievements(id) ON DELETE SET NULL,
  reward_items text,
  reward_other text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_quests ENABLE ROW LEVEL SECURITY;

-- 7. Quest sub-items checklist (same structure as v1)
CREATE TABLE the8_quest_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES the8_quests(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_done boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_quest_items ENABLE ROW LEVEL SECURITY;

-- 8. Quest ↔ Player assignment
CREATE TABLE the8_quest_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES the8_quests(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES the8_players(id) ON DELETE CASCADE,
  UNIQUE (quest_id, player_id)
);
ALTER TABLE the8_quest_players ENABLE ROW LEVEL SECURITY;

-- 9. Per-player EXP reward per quest
CREATE TABLE the8_quest_exp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id uuid NOT NULL REFERENCES the8_quests(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES the8_players(id) ON DELETE CASCADE,
  exp_amount integer NOT NULL DEFAULT 0,
  UNIQUE (quest_id, player_id)
);
ALTER TABLE the8_quest_exp ENABLE ROW LEVEL SECURITY;

-- 10. Maps (multi-map, replaces single the8_world_map)
CREATE TABLE the8_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_maps ENABLE ROW LEVEL SECURITY;

-- 11. Map pins (link map position to a lore entry)
CREATE TABLE the8_map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES the8_maps(id) ON DELETE CASCADE,
  lore_entry_id uuid NOT NULL REFERENCES the8_lore_entries(id) ON DELETE CASCADE,
  pos_x numeric NOT NULL,  -- percentage 0-100 of image width
  pos_y numeric NOT NULL,  -- percentage 0-100 of image height
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE the8_map_pins ENABLE ROW LEVEL SECURITY;
