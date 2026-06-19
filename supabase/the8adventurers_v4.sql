-- Junction tables for Friends/Foes faction + location links
CREATE TABLE IF NOT EXISTS the8_lore_entry_factions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lore_entry_id uuid NOT NULL REFERENCES the8_lore_entries(id) ON DELETE CASCADE,
  faction_entry_id uuid NOT NULL REFERENCES the8_lore_entries(id) ON DELETE CASCADE,
  UNIQUE (lore_entry_id, faction_entry_id)
);

CREATE TABLE IF NOT EXISTS the8_lore_entry_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lore_entry_id uuid NOT NULL REFERENCES the8_lore_entries(id) ON DELETE CASCADE,
  location_entry_id uuid NOT NULL REFERENCES the8_lore_entries(id) ON DELETE CASCADE,
  UNIQUE (lore_entry_id, location_entry_id)
);

ALTER TABLE the8_lore_entry_factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE the8_lore_entry_locations ENABLE ROW LEVEL SECURITY;

-- Preferred habitat for Monsters
ALTER TABLE the8_lore_entries ADD COLUMN IF NOT EXISTS preferred_habitat text;
