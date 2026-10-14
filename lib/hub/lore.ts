import type { LoreCategory } from './types'

export const LORE_CATEGORIES: { slug: LoreCategory; label: string; blurb: string }[] = [
  { slug: 'history', label: 'History', blurb: 'What happened before you arrived.' },
  { slug: 'locations', label: 'Locations', blurb: 'Places you’ve been or heard of.' },
  { slug: 'friends', label: 'Friends', blurb: 'People on your side, for now.' },
  { slug: 'foes', label: 'Foes', blurb: 'People who aren’t.' },
  { slug: 'factions', label: 'Factions', blurb: 'Guilds, cults, crowns and companies.' },
  { slug: 'monsters', label: 'Monsters', blurb: 'Things that bite.' },
]

export const loreLabel = (c: string) => LORE_CATEGORIES.find((x) => x.slug === c)?.label ?? 'Lore'
