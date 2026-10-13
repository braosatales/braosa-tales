// The Atelier's tools, in one place. Used by /atelier, the homepage and the dashboard.
// Set `href` when a tool opens — that's what makes it "live".

export type AtelierTool = {
  slug: string
  name: string
  description: string
  icon: string // file in /public/icons/atelier/48 and /512
  group: 'campaign' | 'generator'
  href?: string
}

export const TOOLS: AtelierTool[] = [
  // Live
  { slug: 'signet', name: 'The Signet', description: 'Names for characters, places, factions and artifacts.', icon: '10 The Signet.svg', group: 'generator', href: '/atelier/signet' },

  // Campaign tools
  { slug: 'athenaeum', name: 'The Athenaeum', description: 'World wiki with GM and player visibility controls.', icon: '01 The Athenaeum.svg', group: 'campaign' },
  { slug: 'atlas', name: 'The Atlas', description: 'Interactive maps linked to locations and in-world lore.', icon: '02 The Atlas.svg', group: 'campaign' },
  { slug: 'chronicle', name: 'The Chronicle', description: 'Session notes with private GM and player-visible layers.', icon: '03 The Chronicle.svg', group: 'campaign' },
  { slug: 'easel', name: 'The Easel', description: 'Mood boards and scene reference galleries.', icon: '04 The Easel.svg', group: 'campaign' },
  { slug: 'journal', name: 'The Journal', description: 'Private GM notes, never visible to players.', icon: '05 The Journal.svg', group: 'campaign' },
  { slug: 'blade', name: 'The Blade', description: 'Encounter builder with initiative and combat tracking.', icon: '06 The Blade.svg', group: 'campaign' },
  { slug: 'hourglass', name: 'The Hourglass', description: 'Campaign timeline for in-world events and history.', icon: '07 The Hourglass.svg', group: 'campaign' },
  { slug: 'armature', name: 'The Armature', description: 'D&D 5e character sheets, live and player-editable.', icon: '08 The Armature.svg', group: 'campaign' },
  { slug: 'tome', name: 'The Tome', description: 'One dashboard for every campaign you run.', icon: '09 The Tome.svg', group: 'campaign' },

  // Generators
  { slug: 'mallet', name: 'The Mallet', description: 'Weapons, armour and magic items.', icon: '11 The Mallet.svg', group: 'generator' },
  { slug: 'chisel', name: 'The Chisel', description: 'NPCs with personality, secrets and hooks.', icon: '12 The Chisel.svg', group: 'generator' },
  { slug: 'blueprint', name: 'The Blueprint', description: 'Towns, dungeons and ruins in detail.', icon: '13 The Blueprint.svg', group: 'generator' },
  { slug: 'compass', name: 'The Compass', description: 'Quest hooks, objectives and complications.', icon: '14 The Compass.svg', group: 'generator' },
  { slug: 'bestiary', name: 'The Bestiary', description: 'Original creatures with lore and stat blocks.', icon: '15 The Bestiary.svg', group: 'generator' },
  { slug: 'crucible', name: 'The Crucible', description: 'Factions with goals, tensions and hierarchies.', icon: '16 The Crucible.svg', group: 'generator' },
  { slug: 'loupe', name: 'The Loupe', description: 'Tavern rumours, gossip and local intrigue.', icon: '17 The Loupe.svg', group: 'generator' },
  { slug: 'letter', name: 'The Letter', description: 'In-world handouts: letters, notices, inscriptions.', icon: '18 The Letter.svg', group: 'generator' },
  { slug: 'loom', name: 'The Loom', description: 'Story threads woven into narrative arcs.', icon: '19 The Loom.svg', group: 'generator' },
  { slug: 'cipher', name: 'The Cipher', description: 'Invented languages, scripts and ciphers.', icon: '20 The Cipher.svg', group: 'generator' },
  { slug: 'charter', name: 'The Charter', description: 'Laws, customs and taboos of your world.', icon: '21 The Charter.svg', group: 'generator' },
  { slug: 'dice-cup', name: 'The Dice Cup', description: 'Random tables for encounters, weather and events.', icon: '22 The Dice Cup.svg', group: 'generator' },
]

export const isLive = (t: AtelierTool) => Boolean(t.href)
export const toolBySlug = (slug: string) => TOOLS.find((t) => t.slug === slug)
export const TOOL_SLUGS = new Set(TOOLS.map((t) => t.slug))
