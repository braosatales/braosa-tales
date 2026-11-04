import { createServerSupabase } from '@/lib/supabase-server'
import type { LinkedLoreEntry, LoreCategory, LoreEntry, Quest, RevealBlock } from './types'

/**
 * Progressive reveal: lore entries and quests are made of blocks the GM reveals
 * one at a time, and links between entries have their own reveal switch.
 * Everything here runs on the server; players never receive a hidden block,
 * a hidden link, a link to a hidden entry, or GM notes.
 */

const CHUNK = 100
const BLOCK_COLS = 'id, lore_entry_id, quest_id, body, is_revealed, revealed_at, sort_order, created_at'
type Db = ReturnType<typeof createServerSupabase>
type BlockRow = RevealBlock & { lore_entry_id: string | null; quest_id: string | null; created_at: string }

async function inChunks<T>(ids: string[], run: (chunk: string[]) => PromiseLike<{ data: T[] | null }>): Promise<T[]> {
  const out: T[] = []
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { data } = await run(ids.slice(i, i + CHUNK))
    if (data) out.push(...data)
  }
  return out
}

const byOrder = (a: BlockRow, b: BlockRow) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)
const clean = ({ id, body, is_revealed, revealed_at, sort_order }: BlockRow): RevealBlock => ({ id, body, is_revealed, revealed_at, sort_order })

export async function blocksFor(db: Db, kind: 'lore' | 'quest', ids: string[], gm: boolean) {
  const col = kind === 'lore' ? 'lore_entry_id' : 'quest_id'
  const rows = await inChunks<BlockRow>(ids, (chunk) => db.from('the8_reveal_blocks').select(BLOCK_COLS).in(col, chunk))
  const map = new Map<string, RevealBlock[]>()
  for (const r of rows.sort(byOrder)) {
    if (!gm && !r.is_revealed) continue
    const key = (kind === 'lore' ? r.lore_entry_id : r.quest_id) as string
    map.set(key, [...(map.get(key) ?? []), clean(r)])
  }
  return map
}

type LinkRow = { lore_entry_id: string; target: string; is_revealed: boolean }

/** Faction and location links for these entries. Players only get revealed links to visible entries. */
export async function linksFor(db: Db, campaignId: string, ids: string[], gm: boolean) {
  const [fac, loc] = await Promise.all([
    inChunks<{ lore_entry_id: string; faction_entry_id: string; is_revealed: boolean }>(ids, (chunk) =>
      db.from('the8_lore_entry_factions').select('lore_entry_id, faction_entry_id, is_revealed').in('lore_entry_id', chunk)),
    inChunks<{ lore_entry_id: string; location_entry_id: string; is_revealed: boolean }>(ids, (chunk) =>
      db.from('the8_lore_entry_locations').select('lore_entry_id, location_entry_id, is_revealed').in('lore_entry_id', chunk)),
  ])
  const facRows: LinkRow[] = fac.map((r) => ({ lore_entry_id: r.lore_entry_id, target: r.faction_entry_id, is_revealed: !!r.is_revealed }))
  const locRows: LinkRow[] = loc.map((r) => ({ lore_entry_id: r.lore_entry_id, target: r.location_entry_id, is_revealed: !!r.is_revealed }))
  const targetIds = Array.from(new Set([...facRows, ...locRows].map((r) => r.target)))
  const targets = await inChunks<{ id: string; title: string; category: LoreCategory; is_secret: boolean }>(targetIds, (chunk) =>
    db.from('the8_lore_entries').select('id, title, category, is_secret').eq('campaign_id', campaignId).in('id', chunk))
  const byId = new Map(targets.map((t) => [t.id, t]))

  const build = (rows: LinkRow[]) => {
    const map = new Map<string, LinkedLoreEntry[]>()
    for (const r of rows) {
      const t = byId.get(r.target)
      if (!t) continue
      if (!gm && (!r.is_revealed || t.is_secret)) continue
      const link: LinkedLoreEntry = gm
        ? { id: t.id, title: t.title, category: t.category, is_revealed: r.is_revealed, target_secret: t.is_secret }
        : { id: t.id, title: t.title, category: t.category }
      map.set(r.lore_entry_id, [...(map.get(r.lore_entry_id) ?? []), link])
    }
    map.forEach((list) => list.sort((a, b) => a.title.localeCompare(b.title)))
    return map
  }
  return { factions: build(facRows), locations: build(locRows) }
}

type RawEntry = Omit<LoreEntry, 'blocks' | 'linked_factions' | 'linked_locations'> & { description?: string | null }

/** Lore entries as the person asking may see them: blocks, links, and no GM notes for players. */
export async function hydrateLore(db: Db, campaignId: string, rows: RawEntry[], gm: boolean): Promise<LoreEntry[]> {
  const visible = gm ? rows : rows.filter((r) => !r.is_secret)
  const ids = visible.map((r) => r.id)
  const [blocks, links] = await Promise.all([blocksFor(db, 'lore', ids, gm), linksFor(db, campaignId, ids, gm)])
  return visible.map((r) => {
    const { gm_notes, description: _d, ...rest } = r
    return {
      ...rest,
      ...(gm ? { gm_notes } : {}),
      blocks: blocks.get(r.id) ?? [],
      linked_factions: links.factions.get(r.id) ?? [],
      linked_locations: links.locations.get(r.id) ?? [],
    }
  })
}

type RawQuest = Omit<Quest, 'blocks'> & { description?: string | null }

export async function hydrateQuests(db: Db, rows: RawQuest[], gm: boolean): Promise<Quest[]> {
  const visible = gm ? rows : rows.filter((r) => !r.is_secret)
  const blocks = await blocksFor(db, 'quest', visible.map((r) => r.id), gm)
  return visible.map((r) => {
    const { gm_notes, description: _d, ...rest } = r
    return { ...rest, ...(gm ? { gm_notes } : {}), blocks: blocks.get(r.id) ?? [] } as Quest
  })
}

/** The first thing a card should show: first revealed block for players, first block for the GM. */
export function previewText(blocks: RevealBlock[] | undefined) {
  return (blocks ?? [])[0]?.body ?? null
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export type BlockInput = { id?: string; body: string; is_revealed?: boolean }

/** Make the parent's blocks exactly this list, in this order. Keeps reveal times for blocks already revealed. */
export async function syncBlocks(db: Db, campaignId: string, parent: { lore_entry_id: string } | { quest_id: string }, input: unknown) {
  if (!Array.isArray(input)) return
  const col = 'lore_entry_id' in parent ? 'lore_entry_id' : 'quest_id'
  const parentId = 'lore_entry_id' in parent ? parent.lore_entry_id : parent.quest_id
  const wanted = (input as BlockInput[])
    .filter((b) => b && typeof b.body === 'string' && b.body.trim())
    .map((b, i) => ({ id: typeof b.id === 'string' ? b.id : undefined, body: b.body.trim().slice(0, 20000), is_revealed: !!b.is_revealed, sort_order: i }))

  const { data: existing } = await db.from('the8_reveal_blocks').select('id, is_revealed, revealed_at').eq(col, parentId)
  const have = new Map((existing ?? []).map((b) => [b.id as string, b]))
  const keep = new Set(wanted.filter((b) => b.id && have.has(b.id)).map((b) => b.id as string))
  const drop = Array.from(have.keys()).filter((id) => !keep.has(id))
  if (drop.length) await db.from('the8_reveal_blocks').delete().in('id', drop)

  const now = new Date().toISOString()
  for (const b of wanted) {
    const old = b.id ? have.get(b.id) : undefined
    const revealed_at = b.is_revealed ? (old?.is_revealed ? old.revealed_at ?? now : now) : null
    if (old && b.id) {
      await db.from('the8_reveal_blocks').update({ body: b.body, is_revealed: b.is_revealed, revealed_at, sort_order: b.sort_order, updated_at: now }).eq('id', b.id)
    } else {
      await db.from('the8_reveal_blocks').insert({ campaign_id: campaignId, [col]: parentId, body: b.body, is_revealed: b.is_revealed, revealed_at, sort_order: b.sort_order })
    }
  }
}

export type LinkInput = { id: string; is_revealed?: boolean }

/** Make an entry's faction or location links exactly this list. New links start hidden unless marked revealed. */
export async function syncLinks(db: Db, campaignId: string, entryId: string, kind: 'faction' | 'location', input: unknown) {
  if (!Array.isArray(input)) return
  const table = kind === 'faction' ? 'the8_lore_entry_factions' : 'the8_lore_entry_locations'
  const col = kind === 'faction' ? 'faction_entry_id' : 'location_entry_id'
  // Accept plain ids too (older clients): those start hidden.
  const list = (input as (LinkInput | string)[]).map((x) => (typeof x === 'string' ? { id: x, is_revealed: false } : x)).filter((x) => x && typeof x.id === 'string' && x.id !== entryId)
  const { data: valid } = list.length
    ? await db.from('the8_lore_entries').select('id').eq('campaign_id', campaignId).eq('category', kind === 'faction' ? 'factions' : 'locations').in('id', list.map((x) => x.id))
    : { data: [] as { id: string }[] }
  const ok = new Set((valid ?? []).map((v) => v.id))
  await db.from(table).delete().eq('lore_entry_id', entryId)
  const seen = new Set<string>()
  const rows = list.filter((x) => ok.has(x.id) && !seen.has(x.id) && !!seen.add(x.id)).map((x) => ({ lore_entry_id: entryId, [col]: x.id, is_revealed: !!x.is_revealed }))
  if (rows.length) await db.from(table).insert(rows)
}

type RawPin = { lore_entry_id: string; the8_lore_entries?: RawEntry | null }

/** Map pins with their location entry hydrated. Players lose pins on hidden entries. */
export async function hydratePins<P extends RawPin>(db: Db, campaignId: string, pins: P[], gm: boolean) {
  const entries = pins.map((p) => p.the8_lore_entries).filter((e): e is RawEntry => !!e)
  const unique = Array.from(new Map(entries.map((e) => [e.id, e])).values())
  const hydrated = new Map((await hydrateLore(db, campaignId, unique, gm)).map((e) => [e.id, e]))
  return pins.filter((p) => hydrated.has(p.lore_entry_id)).map((p) => ({ ...p, the8_lore_entries: hydrated.get(p.lore_entry_id) as LoreEntry }))
}
