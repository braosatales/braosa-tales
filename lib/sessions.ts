// ─────────────────────────────────────────────────────────────────────────────
// Live campaigns shown on the homepage and /games.
// Edit this file to change what the site shows — no other code needs to change.
//   • bookUrl: paste each StartPlaying listing URL here once it's live
//     (falls back to the GM profile).
//   • cover: image in /public/campaigns (16:9, ~1600px wide).
// ─────────────────────────────────────────────────────────────────────────────

export const GM = {
  name: 'John Rodrigues',
  profileUrl: 'https://startplaying.games/gm/johnrodrigues',
  rating: 5.0,
  reviews: 11,
  gamesRun: 29,
  // When the numbers above were last checked on StartPlaying.
  statsCheckedOn: 'October 2026',
  platforms: ['Discord', 'Foundry VTT', 'D&D Beyond'],
  languages: ['English', 'Português', 'Español'],
}

/** Session window, in Lisbon time. Converted to each visitor's own time zone on the page. */
export const SCHEDULE = {
  timeZone: 'Europe/Lisbon',
  start: '05:00',
  end: '08:00',
  label: 'Weekday mornings in Lisbon',
}

export type Act = { name: string; levels: string; summary: string }

export type Campaign = {
  slug: string
  title: string
  listedAs: string
  levels: string
  system: string
  hook: string
  pitch: string
  acts: Act[]
  cover: string
  coverAlt: string
  pricePerSession: string
  sessionLength: string
  bookUrl: string
  status: 'open' | 'full' | 'soon'
}

export const CAMPAIGNS: Campaign[] = [
  {
    slug: 'eve-of-giants',
    title: 'Eve of Giants',
    listedAs: "Storm King's Thunder → Vecna: Eve of Ruin",
    levels: '1–20',
    system: 'D&D 5e (2024)',
    hook: 'Who gets to remake the world?',
    pitch:
      'The giants’ ancient order lies shattered, a dragon whispers in a storm king’s court, and the North is burning. Survive it, and a god of secrets will try to rewrite the whole multiverse. One story, three villains, the same ambition at a growing scale.',
    acts: [
      { name: 'Phandalin', levels: '1–5', summary: 'A drow called the Black Spider hunts a lost forge of spells.' },
      { name: 'Storm King’s Thunder', levels: '5–11', summary: 'Giants go to war with the small folk, and someone wants it that way.' },
      { name: 'Vecna: Eve of Ruin', levels: '11–20', summary: 'A lich-god gathers stolen secrets to remake reality in his image.' },
    ],
    cover: '/campaigns/eve-of-giants.webp',
    coverAlt: 'Eve of Giants campaign cover art',
    pricePerSession: '$20',
    sessionLength: '3 hours',
    bookUrl: 'https://startplaying.games/gm/johnrodrigues',
    status: 'open',
  },
  {
    slug: 'wings-over-phandalin',
    title: 'Wings over Phandalin',
    listedAs: 'Tyranny of Dragons',
    levels: '1–15',
    system: 'D&D 5e (2024)',
    hook: 'Someone is buying the end of the world.',
    pitch:
      'Gems vanish from caravans and a dragon cult hoards gold for a goddess. Follow the money up the Sword Coast, make a ruined town your home, and unite frightened cities before Tiamat rises.',
    acts: [
      { name: 'Phandalin', levels: '1–6', summary: 'Cultists in the shadows, and a white dragon who refused them.' },
      { name: 'Follow the money', levels: '6–8', summary: 'The stolen hoard leads north, through inns, swamps and a flying castle.' },
      { name: 'The war', levels: '8–15', summary: 'Councils, alliances and dragons, all the way to the Well of Dragons.' },
    ],
    cover: '/campaigns/wings-over-phandalin.webp',
    coverAlt: 'Wings over Phandalin campaign cover art',
    pricePerSession: '$20',
    sessionLength: '3 hours',
    bookUrl: 'https://startplaying.games/gm/johnrodrigues',
    status: 'open',
  },
]
