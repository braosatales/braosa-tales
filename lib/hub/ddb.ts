import { createServerSupabase } from '@/lib/supabase-server'

/**
 * D&D Beyond character sync.
 *
 * D&D Beyond has no official public API. Their character sheet app reads from
 * character-service.dndbeyond.com, which returns a character's JSON when the
 * character's privacy is set to Public. We read only that, cache what we need
 * on the character row, and keep the last good copy if D&D Beyond is down,
 * changes the format, or the character goes private.
 */

const ENDPOINT = (id: string) => `https://character-service.dndbeyond.com/character/v5/character/${id}`
export const DDB_MAX_AGE_MIN = 30

export type DdbSheet = {
  name: string
  race: string | null
  classLine: string | null
  level: number | null
  background: string | null
  avatar: string | null
  hpMax: number | null
  hpCurrent: number | null
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number } | null
}

/** Accepts a full D&D Beyond URL (…/characters/123456789) or just the number. */
export function parseDdbId(input: unknown): string | null {
  const s = String(input ?? '').trim()
  if (!s) return null
  const m = s.match(/characters\/(\d{4,12})/) ?? s.match(/^(\d{4,12})$/)
  return m ? m[1] : null
}

export const ddbSheetUrl = (id: string) => `https://www.dndbeyond.com/characters/${id}`

type Mod = { type?: string; subType?: string; value?: number | null; componentId?: number }
type AnyObj = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

const ABILITIES = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const

function activeModifiers(d: AnyObj): Mod[] {
  const groups = d.modifiers ?? {}
  const equipped = new Set<number>()
  for (const item of d.inventory ?? []) {
    const def = item?.definition ?? {}
    if (item?.equipped && (!def.canAttune || item?.isAttuned)) equipped.add(def.id)
  }
  const out: Mod[] = []
  for (const [group, list] of Object.entries(groups)) {
    if (!Array.isArray(list)) continue
    for (const m of list as Mod[]) {
      if (group === 'item' && !equipped.has(m.componentId as number)) continue
      out.push(m)
    }
  }
  return out
}

export function parseDdb(d: AnyObj): DdbSheet {
  const classes: AnyObj[] = Array.isArray(d.classes) ? d.classes : []
  const level = classes.reduce((n, c) => n + (Number(c.level) || 0), 0) || null
  const classLine = classes.length
    ? classes
        .map((c) => {
          const name = c.definition?.name ?? 'Class'
          const sub = c.subclassDefinition?.name
          const base = sub ? `${name} (${sub})` : name
          return classes.length > 1 ? `${base} ${c.level}` : base
        })
        .join(' / ')
    : null

  const mods = activeModifiers(d)
  let stats: DdbSheet['stats'] = null
  if (Array.isArray(d.stats) && d.stats.length >= 6) {
    const val = (arr: AnyObj[] | undefined, id: number) => arr?.find((s) => s.id === id)?.value ?? null
    const scores = ABILITIES.map((ab, i) => {
      const id = i + 1
      const override = val(d.overrideStats, id)
      if (override) return override as number
      let score = (val(d.stats, id) ?? 10) + (val(d.bonusStats, id) ?? 0)
      for (const m of mods) if (m.type === 'bonus' && m.subType === `${ab}-score`) score += Number(m.value) || 0
      for (const m of mods) if (m.type === 'set' && m.subType === `${ab}-score`) score = Math.max(score, Number(m.value) || 0)
      return score
    })
    stats = { str: scores[0], dex: scores[1], con: scores[2], int: scores[3], wis: scores[4], cha: scores[5] }
  }

  let hpMax: number | null = null
  if (d.overrideHitPoints) hpMax = d.overrideHitPoints
  else if (typeof d.baseHitPoints === 'number') {
    const conMod = stats ? Math.floor((stats.con - 10) / 2) : 0
    const perLevel = mods.filter((m) => m.type === 'bonus' && m.subType === 'hit-points-per-level').reduce((n, m) => n + (Number(m.value) || 0), 0)
    hpMax = d.baseHitPoints + (d.bonusHitPoints ?? 0) + (conMod + perLevel) * (level ?? 0)
  }
  const hpCurrent = hpMax !== null ? Math.max(0, hpMax - (d.removedHitPoints ?? 0)) : null

  return {
    name: String(d.name ?? '').trim() || 'Unnamed character',
    race: d.race?.fullName ?? d.race?.baseName ?? null,
    classLine,
    level,
    background: d.background?.definition?.name ?? d.background?.customBackground?.name ?? null,
    avatar: d.decorations?.avatarUrl ?? d.avatarUrl ?? null,
    hpMax,
    hpCurrent,
    stats,
  }
}

export async function fetchDdb(id: string): Promise<{ sheet: DdbSheet } | { error: string }> {
  try {
    const res = await fetch(ENDPOINT(id), {
      cache: 'no-store',
      headers: { Accept: 'application/json', 'User-Agent': 'BraosaTales/1.0 (+https://braosatales.com)' },
      signal: AbortSignal.timeout(6000),
    })
    const json = (await res.json().catch(() => null)) as AnyObj | null
    if (res.status === 403 || res.status === 401) return { error: 'This character is private on D&D Beyond. Set Character Privacy to Public.' }
    if (res.status === 404) return { error: 'D&D Beyond can’t find that character.' }
    if (!res.ok || !json?.data) return { error: json?.message ? String(json.message) : `D&D Beyond didn’t answer (${res.status}).` }
    return { sheet: parseDdb(json.data) }
  } catch {
    return { error: 'D&D Beyond didn’t answer in time.' }
  }
}

/** Columns on the8_players to update from a sheet. Keeps an uploaded portrait over the D&D Beyond one. */
export function sheetToRow(sheet: DdbSheet, currentPortrait: string | null) {
  const keepPortrait = currentPortrait && !/dndbeyond\.com/i.test(currentPortrait)
  return {
    name: sheet.name,
    race: sheet.race,
    class: sheet.classLine,
    level: sheet.level,
    background: sheet.background,
    portrait_url: keepPortrait ? currentPortrait : sheet.avatar ?? currentPortrait,
    hp_max: sheet.hpMax,
    hp_current: sheet.hpCurrent,
    stat_strength: sheet.stats?.str ?? null,
    stat_dexterity: sheet.stats?.dex ?? null,
    stat_constitution: sheet.stats?.con ?? null,
    stat_intelligence: sheet.stats?.int ?? null,
    stat_wisdom: sheet.stats?.wis ?? null,
    stat_charisma: sheet.stats?.cha ?? null,
    ddb_synced_at: new Date().toISOString(),
    ddb_error: null,
  }
}

type SyncRow = { id: string; ddb_character_id: string | null; ddb_synced_at: string | null; portrait_url: string | null }

/** Refresh one character now. Returns the error message, if any. */
export async function syncCharacter(row: SyncRow): Promise<string | null> {
  if (!row.ddb_character_id) return null
  const db = createServerSupabase()
  const result = await fetchDdb(row.ddb_character_id)
  if ('error' in result) {
    await db.from('the8_players').update({ ddb_error: result.error, ddb_synced_at: new Date().toISOString() }).eq('id', row.id)
    return result.error
  }
  await db.from('the8_players').update({ ...sheetToRow(result.sheet, row.portrait_url), updated_at: new Date().toISOString() }).eq('id', row.id)
  return null
}

/** Refresh any linked characters older than DDB_MAX_AGE_MIN. Returns true if anything was refreshed. */
export async function syncStale(rows: SyncRow[]): Promise<boolean> {
  const cutoff = Date.now() - DDB_MAX_AGE_MIN * 60_000
  const stale = rows.filter((r) => r.ddb_character_id && (!r.ddb_synced_at || new Date(r.ddb_synced_at).getTime() < cutoff))
  if (!stale.length) return false
  await Promise.allSettled(stale.map(syncCharacter))
  return true
}
