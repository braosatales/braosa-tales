-- ============================================================================
-- Progressive reveal for campaign sites
--
-- Lore entries and quests are now made of BLOCKS. Each block is hidden from
-- players until the GM reveals it, one at a time, as the party learns more.
-- Faction and location links get their own reveal switch too.
--
--   * An entry (or quest) still has its own "visible to players" switch
--     (is_secret). Players see a visible entry's title, plus only the blocks
--     and links the GM has revealed.
--   * GM notes stay GM-only, always.
--
-- What this script does to existing data:
--   * Each entry's / quest's description becomes its first block. It starts
--     revealed if the entry is currently visible to players, hidden otherwise,
--     so nothing players can see today disappears and nothing new appears.
--   * Links between two entries that are both visible today stay revealed;
--     every other link starts hidden.
--   * Old seed files (which still write a description) keep working: a
--     trigger turns any description into a new hidden block.
--
-- Run ONCE in the Supabase SQL editor, AFTER campaign_engine.sql.
-- Safe to re-run: nothing is duplicated and nothing you've revealed is undone.
-- ============================================================================

BEGIN;

-- 1. Blocks ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.the8_reveal_blocks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lore_entry_id uuid REFERENCES public.the8_lore_entries(id) ON DELETE CASCADE,
  quest_id      uuid REFERENCES public.the8_quests(id) ON DELETE CASCADE,
  body          text NOT NULL,
  is_revealed   boolean NOT NULL DEFAULT false,
  revealed_at   timestamptz,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT the8_reveal_blocks_one_parent CHECK (num_nonnulls(lore_entry_id, quest_id) = 1)
);
CREATE INDEX IF NOT EXISTS the8_reveal_blocks_lore_idx  ON public.the8_reveal_blocks (lore_entry_id, sort_order) WHERE lore_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS the8_reveal_blocks_quest_idx ON public.the8_reveal_blocks (quest_id, sort_order) WHERE quest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS the8_reveal_blocks_recent_idx ON public.the8_reveal_blocks (campaign_id, revealed_at DESC) WHERE is_revealed;

-- Same lock-down as every other hub table: only the server (service role) reads/writes.
ALTER TABLE public.the8_reveal_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reveal_blocks_deny_all" ON public.the8_reveal_blocks;
CREATE POLICY "reveal_blocks_deny_all" ON public.the8_reveal_blocks FOR ALL TO public USING (false);

-- 2. Links get their own reveal switch ---------------------------------------
DO $links$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'the8_lore_entry_factions' AND column_name = 'is_revealed') THEN
    ALTER TABLE public.the8_lore_entry_factions ADD COLUMN is_revealed boolean NOT NULL DEFAULT false;
    UPDATE public.the8_lore_entry_factions l SET is_revealed = true
    FROM public.the8_lore_entries a, public.the8_lore_entries b
    WHERE a.id = l.lore_entry_id AND b.id = l.faction_entry_id AND NOT a.is_secret AND NOT b.is_secret;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'the8_lore_entry_locations' AND column_name = 'is_revealed') THEN
    ALTER TABLE public.the8_lore_entry_locations ADD COLUMN is_revealed boolean NOT NULL DEFAULT false;
    UPDATE public.the8_lore_entry_locations l SET is_revealed = true
    FROM public.the8_lore_entries a, public.the8_lore_entries b
    WHERE a.id = l.lore_entry_id AND b.id = l.location_entry_id AND NOT a.is_secret AND NOT b.is_secret;
  END IF;
END $links$;

-- 3. Descriptions become first blocks ----------------------------------------
INSERT INTO public.the8_reveal_blocks (campaign_id, lore_entry_id, body, is_revealed, revealed_at, sort_order)
SELECT e.campaign_id, e.id, btrim(e.description), NOT e.is_secret, CASE WHEN e.is_secret THEN NULL ELSE now() END, 0
FROM public.the8_lore_entries e
WHERE e.campaign_id IS NOT NULL AND e.description IS NOT NULL AND btrim(e.description) <> ''
  AND NOT EXISTS (SELECT 1 FROM public.the8_reveal_blocks b WHERE b.lore_entry_id = e.id);
UPDATE public.the8_lore_entries e SET description = NULL
WHERE e.description IS NOT NULL AND EXISTS (SELECT 1 FROM public.the8_reveal_blocks b WHERE b.lore_entry_id = e.id);

INSERT INTO public.the8_reveal_blocks (campaign_id, quest_id, body, is_revealed, revealed_at, sort_order)
SELECT q.campaign_id, q.id, btrim(q.description), NOT q.is_secret, CASE WHEN q.is_secret THEN NULL ELSE now() END, 0
FROM public.the8_quests q
WHERE q.campaign_id IS NOT NULL AND q.description IS NOT NULL AND btrim(q.description) <> ''
  AND NOT EXISTS (SELECT 1 FROM public.the8_reveal_blocks b WHERE b.quest_id = q.id);
UPDATE public.the8_quests q SET description = NULL
WHERE q.description IS NOT NULL AND EXISTS (SELECT 1 FROM public.the8_reveal_blocks b WHERE b.quest_id = q.id);

-- 4. Keep old seed files working ---------------------------------------------
-- Anything that still writes a description (the campaign seeds do) gets it
-- turned into a new block at the end of the list: hidden if the entry is
-- secret, revealed if it's already visible.
CREATE OR REPLACE FUNCTION public.the8_description_to_block() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE
  next_order integer;
BEGIN
  IF NEW.description IS NULL OR btrim(NEW.description) = '' OR NEW.campaign_id IS NULL THEN
    RETURN NULL;
  END IF;
  IF TG_TABLE_NAME = 'the8_lore_entries' THEN
    SELECT coalesce(max(sort_order) + 1, 0) INTO next_order FROM the8_reveal_blocks WHERE lore_entry_id = NEW.id;
    INSERT INTO the8_reveal_blocks (campaign_id, lore_entry_id, body, is_revealed, revealed_at, sort_order)
    VALUES (NEW.campaign_id, NEW.id, btrim(NEW.description), NOT NEW.is_secret, CASE WHEN NEW.is_secret THEN NULL ELSE now() END, next_order);
    UPDATE the8_lore_entries SET description = NULL WHERE id = NEW.id;
  ELSE
    SELECT coalesce(max(sort_order) + 1, 0) INTO next_order FROM the8_reveal_blocks WHERE quest_id = NEW.id;
    INSERT INTO the8_reveal_blocks (campaign_id, quest_id, body, is_revealed, revealed_at, sort_order)
    VALUES (NEW.campaign_id, NEW.id, btrim(NEW.description), NOT NEW.is_secret, CASE WHEN NEW.is_secret THEN NULL ELSE now() END, next_order);
    UPDATE the8_quests SET description = NULL WHERE id = NEW.id;
  END IF;
  RETURN NULL;
END $fn$;

DROP TRIGGER IF EXISTS the8_lore_description_to_block ON public.the8_lore_entries;
CREATE TRIGGER the8_lore_description_to_block
  AFTER INSERT OR UPDATE OF description ON public.the8_lore_entries
  FOR EACH ROW EXECUTE FUNCTION public.the8_description_to_block();

DROP TRIGGER IF EXISTS the8_quest_description_to_block ON public.the8_quests;
CREATE TRIGGER the8_quest_description_to_block
  AFTER INSERT OR UPDATE OF description ON public.the8_quests
  FOR EACH ROW EXECUTE FUNCTION public.the8_description_to_block();

COMMIT;
