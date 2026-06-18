ALTER TABLE the8_lore_entries ADD COLUMN IF NOT EXISTS gm_notes text;
ALTER TABLE the8_quests ADD COLUMN IF NOT EXISTS gm_notes text;
ALTER TABLE the8_achievements ADD COLUMN IF NOT EXISTS gm_notes text;
