'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Constants ───────────────────────────────────────────────────────────────

const C = {
  gold:      'text-brand-gold-400',
  purple:    'text-brand-purple-400',
  muted:     'text-brand-muted',
  parchment: 'text-brand-parchment',
  border:    'border-brand-border',
  card:      'bg-brand-card',
  bg:        'bg-brand-bg',
}

const TIERS = {
  wanderer:   { label: 'Wanderer',   color: 'text-gray-400' },
  seeker:     { label: 'Seeker',     color: 'text-brand-gold-400' },
  chronicler: { label: 'Chronicler', color: 'text-brand-purple-400' },
  keeper:     { label: 'Keeper',     color: 'text-amber-300' },
}

const LOGO = (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="inline-block flex-shrink-0">
    <circle cx="16" cy="16" r="14" stroke="#9B7FE8" strokeWidth="1.5" fill="none" />
    <path d="M16 4 L19 13 L28 13 L21 18 L23 27 L16 22 L9 27 L11 18 L4 13 L13 13 Z" fill="#9B7FE8" opacity="0.8" />
  </svg>
)

type Lang = { code: string; label: string; family: string }

const LANGS: Record<string, Lang[]> = {
  'Germanic': [
    { code: 'en-old',  label: 'Old English',  family: 'Germanic' },
    { code: 'en-mid',  label: 'Middle English', family: 'Germanic' },
    { code: 'nordic',  label: 'Old Norse',     family: 'Germanic' },
    { code: 'german',  label: 'German',        family: 'Germanic' },
    { code: 'dutch',   label: 'Dutch',         family: 'Germanic' },
  ],
  'Romance': [
    { code: 'latin',      label: 'Latin',       family: 'Romance' },
    { code: 'french',     label: 'Old French',  family: 'Romance' },
    { code: 'spanish',    label: 'Spanish',     family: 'Romance' },
    { code: 'italian',    label: 'Italian',     family: 'Romance' },
    { code: 'romanian',   label: 'Romanian',    family: 'Romance' },
    { code: 'portuguese', label: 'Portuguese',  family: 'Romance' },
  ],
  'Slavic': [
    { code: 'russian',   label: 'Russian',    family: 'Slavic' },
    { code: 'polish',    label: 'Polish',     family: 'Slavic' },
    { code: 'czech',     label: 'Czech',      family: 'Slavic' },
    { code: 'bulgarian', label: 'Bulgarian',  family: 'Slavic' },
    { code: 'serbian',   label: 'Serbian',    family: 'Slavic' },
  ],
  'Celtic': [
    { code: 'gaelic',       label: 'Irish Gaelic',  family: 'Celtic' },
    { code: 'welsh',        label: 'Welsh',          family: 'Celtic' },
    { code: 'breton',       label: 'Breton',         family: 'Celtic' },
    { code: 'scots-gaelic', label: 'Scots Gaelic',   family: 'Celtic' },
  ],
  'Semitic': [
    { code: 'arabic',    label: 'Arabic',    family: 'Semitic' },
    { code: 'hebrew',    label: 'Hebrew',    family: 'Semitic' },
    { code: 'akkadian',  label: 'Akkadian',  family: 'Semitic' },
    { code: 'aramaic',   label: 'Aramaic',   family: 'Semitic' },
  ],
  'Hellenic': [
    { code: 'greek-ancient', label: 'Ancient Greek', family: 'Hellenic' },
    { code: 'greek-modern',  label: 'Modern Greek',  family: 'Hellenic' },
    { code: 'byzantine',     label: 'Byzantine',     family: 'Hellenic' },
  ],
  'East Asian': [
    { code: 'japanese',  label: 'Japanese',           family: 'East Asian' },
    { code: 'chinese',   label: 'Chinese (Mandarin)', family: 'East Asian' },
    { code: 'korean',    label: 'Korean',             family: 'East Asian' },
    { code: 'mongolian', label: 'Mongolian',          family: 'East Asian' },
  ],
  'South Asian': [
    { code: 'sanskrit', label: 'Sanskrit',       family: 'South Asian' },
    { code: 'hindi',    label: 'Hindi',          family: 'South Asian' },
    { code: 'tamil',    label: 'Tamil',          family: 'South Asian' },
    { code: 'persian',  label: 'Persian (Farsi)', family: 'South Asian' },
  ],
  'African': [
    { code: 'swahili',          label: 'Swahili',          family: 'African' },
    { code: 'yoruba',           label: 'Yoruba',           family: 'African' },
    { code: 'zulu',             label: 'Zulu',             family: 'African' },
    { code: 'hausa',            label: 'Hausa',            family: 'African' },
    { code: 'amharic',          label: 'Amharic',          family: 'African' },
    { code: 'egyptian-ancient', label: 'Ancient Egyptian', family: 'African' },
  ],
  'Indigenous Americas': [
    { code: 'nahuatl', label: 'Nahuatl', family: 'Indigenous Americas' },
    { code: 'quechua', label: 'Quechua', family: 'Indigenous Americas' },
    { code: 'maya',    label: 'Mayan',   family: 'Indigenous Americas' },
    { code: 'lakota',  label: 'Lakota',  family: 'Indigenous Americas' },
  ],
  'Turkic & Uralic': [
    { code: 'turkish',   label: 'Turkish',   family: 'Turkic & Uralic' },
    { code: 'hungarian', label: 'Hungarian', family: 'Turkic & Uralic' },
    { code: 'finnish',   label: 'Finnish',   family: 'Turkic & Uralic' },
    { code: 'kazakh',    label: 'Kazakh',    family: 'Turkic & Uralic' },
  ],
  'Constructed': [
    { code: 'elvish-sindarin', label: 'Elvish (Sindarin)', family: 'Constructed' },
    { code: 'elvish-quenya',   label: 'Elvish (Quenya)',   family: 'Constructed' },
    { code: 'dwarvish',        label: 'Dwarvish (Khuzdul)', family: 'Constructed' },
    { code: 'klingon',         label: 'Klingon',           family: 'Constructed' },
    { code: 'esperanto',       label: 'Esperanto',         family: 'Constructed' },
    { code: 'latin-church',    label: 'Ecclesiastical Latin', family: 'Constructed' },
  ],
}

const ALL_LANGS: Lang[] = Object.values(LANGS).flat()

const CAT_META: Record<string, { color: string; icon: string }> = {
  'Germanic':            { color: 'bg-amber-900/30 text-amber-200',     icon: '⚒' },
  'Romance':             { color: 'bg-rose-900/30 text-rose-200',        icon: '✿' },
  'Slavic':              { color: 'bg-blue-900/30 text-blue-200',        icon: '❄' },
  'Celtic':              { color: 'bg-emerald-900/30 text-emerald-200',  icon: '☘' },
  'Semitic':             { color: 'bg-yellow-900/30 text-yellow-200',    icon: '✦' },
  'Hellenic':            { color: 'bg-cyan-900/30 text-cyan-200',        icon: '⚡' },
  'East Asian':          { color: 'bg-red-900/30 text-red-200',          icon: '⛩' },
  'South Asian':         { color: 'bg-orange-900/30 text-orange-200',    icon: '✤' },
  'African':             { color: 'bg-lime-900/30 text-lime-200',        icon: '◈' },
  'Indigenous Americas': { color: 'bg-teal-900/30 text-teal-200',        icon: '◇' },
  'Turkic & Uralic':     { color: 'bg-violet-900/30 text-violet-200',    icon: '◆' },
  'Constructed':         { color: 'bg-purple-900/30 text-purple-200',    icon: '✨' },
}

const VIBES = [
  'Dark & Grim',
  'Heroic & Epic',
  'Whimsical & Fey',
  'Ancient & Mythic',
  'Mysterious & Arcane',
  'Noble & Courtly',
  'Savage & Primal',
  'Melancholic & Elegiac',
  'Cosmic & Strange',
]

const STYLES = [
  'Soft & Flowing',
  'Hard & Harsh',
  'Long & Grand',
  'Short & Sharp',
  'Melodic & Lyrical',
  'Runic & Ancient',
  'Compound Words',
  'Title-like',
]

const ARCHETYPES = [
  'The Hero', 'The Villain', 'The Mentor', 'The Trickster',
  'The Scholar', 'The Warrior', 'The Mystic', 'The Rogue',
  'The Noble', 'The Outcast', 'The Prophet', 'The Beast',
]

const TARGETS = ['Character', 'Location', 'Faction', 'Artifact', 'Deity', 'Creature', 'Language', 'Era / Age']

const THEMES = [
  'War & Conquest', 'Magic & Mystery', 'Nature & Seasons', 'Death & Rebirth',
  'Light & Shadow', 'Blood & Lineage', 'Stars & Cosmos', 'Sea & Storm',
  'Fire & Forge', 'Ancient Ruins', 'Sacred & Holy', 'Forbidden Knowledge',
]

const CHAR_TARGETS = [
  'Any', 'Hero / Protagonist', 'Villain / Antagonist', 'Ruler / Noble',
  'Mage / Scholar', 'Warrior / Soldier', 'Rogue / Scout', 'Healer / Priest',
  'Merchant / Craftsman', 'Common Folk', 'Ancient Being',
]

const ITEM_TARGETS = [
  'Any', 'Weapon', 'Armour', 'Spellbook / Tome', 'Amulet / Ring',
  'Staff / Wand', 'Shield / Aegis', 'Cloak / Garment', 'Relic / Holy Item',
  'Cursed Object', 'Potion / Elixir', 'Vessel / Container',
]

const ITEM_TYPES = ['Mundane', 'Magical', 'Legendary', 'Cursed', 'Divine', 'Eldritch']

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact']

const RARITY_NAMING_GUIDE: Record<string, string> = {
  'Common':    'Simple, one-word or compound names. Practical and unremarkable.',
  'Uncommon':  'Slightly poetic. May have a descriptive epithet.',
  'Rare':      'Memorable names, often with historical or legendary echoes.',
  'Very Rare': 'Names with weight. Often include old-tongue words or titles.',
  'Legendary': 'Grand, sonorous names. Known across the world. Title-like.',
  'Artifact':  'Ancient, sometimes incomprehensible names. Pre-date known history.',
}

const SS = 'text-sm font-sans'
const GS = 'grid gap-3'

// ─── Types ───────────────────────────────────────────────────────────────────

type NameResult = {
  id?: string
  name: string
  pronunciation: string
  language: string
  root_words: string
  meaning: string
  resonance: string
}

type HistoryBatchType = {
  id: string
  created_at: string
  target: string
  results: NameResult[]
}

type PresetType = {
  id: string
  name: string
  settings: Record<string, unknown>
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ComplexityDots({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className={`w-3 h-3 rounded-full border transition-all ${
            i < value
              ? 'bg-brand-purple-500 border-brand-purple-400'
              : 'bg-transparent border-brand-border hover:border-brand-purple-600'
          }`}
        />
      ))}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-cinzel text-xs uppercase tracking-widest text-brand-gold-400/70 mb-1.5">
      {children}
    </label>
  )
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-sans border transition-all ${
        active
          ? 'bg-brand-purple-600/30 border-brand-purple-500 text-brand-purple-200'
          : 'bg-transparent border-brand-border text-brand-muted hover:border-brand-purple-600/50 hover:text-brand-parchment'
      }`}
    >
      {label}
    </button>
  )
}

function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl font-sans text-sm ${
      type === 'success'
        ? 'bg-emerald-950 border-emerald-800 text-emerald-200'
        : 'bg-red-950 border-red-800 text-red-200'
    }`}>
      {message}
    </div>
  )
}

function CreditPill({ credits, tier }: { credits: number; tier: string }) {
  const tierInfo = TIERS[tier as keyof typeof TIERS] ?? TIERS.wanderer
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-border bg-brand-card">
      <span className={`text-xs font-cinzel uppercase tracking-wider ${tierInfo.color}`}>{tierInfo.label}</span>
      <span className="text-brand-border">·</span>
      <span className="text-xs font-sans text-brand-gold-400">{credits} credits</span>
    </div>
  )
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-brand-border bg-brand-bg text-sm font-sans text-brand-parchment hover:border-brand-purple-600/50 transition-all"
      >
        <span className={value ? 'text-brand-parchment' : 'text-brand-muted'}>{value || placeholder || 'Select…'}</span>
        <span className="text-brand-muted text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-brand-border bg-brand-card shadow-xl">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full px-3 py-2 bg-transparent border-b border-brand-border text-sm font-sans text-brand-parchment placeholder:text-brand-muted outline-none"
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.map(o => (
              <button
                key={o}
                type="button"
                onClick={() => { onChange(o); setOpen(false); setQuery('') }}
                className={`w-full text-left px-3 py-2 text-sm font-sans hover:bg-brand-purple-600/10 transition-colors ${
                  o === value ? 'text-brand-purple-300' : 'text-brand-parchment'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function LanguagePicker({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (langs: string[]) => void
}) {
  const toggle = (code: string) =>
    onChange(selected.includes(code) ? selected.filter(c => c !== code) : [...selected, code])

  return (
    <div className="space-y-4">
      {Object.entries(LANGS).map(([cat, langs]) => {
        const meta = CAT_META[cat] ?? { color: 'bg-gray-900/30 text-gray-200', icon: '◆' }
        return (
          <div key={cat}>
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-cinzel uppercase tracking-wider mb-2 ${meta.color}`}>
              <span>{meta.icon}</span>
              <span>{cat}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {langs.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => toggle(lang.code)}
                  className={`px-2.5 py-1 rounded text-xs font-sans border transition-all ${
                    selected.includes(lang.code)
                      ? 'bg-brand-purple-600/30 border-brand-purple-500 text-brand-purple-200'
                      : 'bg-transparent border-brand-border text-brand-muted hover:border-brand-purple-600/50 hover:text-brand-parchment'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function MultiDropdown({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-md border border-brand-border bg-brand-bg text-sm font-sans hover:border-brand-purple-600/50 transition-all"
      >
        <span className={selected.length ? 'text-brand-parchment' : 'text-brand-muted'}>
          {selected.length ? selected.join(', ') : placeholder || 'Select…'}
        </span>
        <span className="text-brand-muted text-xs">▾</span>
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-brand-border bg-brand-card shadow-xl max-h-56 overflow-y-auto">
          {options.map(o => (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className="w-full flex items-center gap-2 text-left px-3 py-2 text-sm font-sans hover:bg-brand-purple-600/10 transition-colors"
            >
              <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                selected.includes(o) ? 'bg-brand-purple-600 border-brand-purple-500' : 'border-brand-border'
              }`}>
                {selected.includes(o) && <span className="text-white text-[9px] leading-none">✓</span>}
              </span>
              <span className={selected.includes(o) ? 'text-brand-purple-200' : 'text-brand-parchment'}>{o}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PresetDropdown({
  presets,
  onLoad,
  onDelete,
  onSave,
}: {
  presets: PresetType[]
  onLoad: (p: PresetType) => void
  onDelete: (id: string) => void
  onSave: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSaving(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-brand-border bg-brand-bg text-xs font-cinzel uppercase tracking-wider text-brand-muted hover:border-brand-purple-600/50 hover:text-brand-parchment transition-all"
      >
        Presets ▾
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-64 rounded-md border border-brand-border bg-brand-card shadow-xl">
          {saving ? (
            <div className="p-3 space-y-2">
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Preset name…"
                className="w-full px-2 py-1.5 bg-brand-bg border border-brand-border rounded text-sm font-sans text-brand-parchment placeholder:text-brand-muted outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && name.trim()) {
                    onSave(name.trim())
                    setSaving(false)
                    setName('')
                    setOpen(false)
                  }
                  if (e.key === 'Escape') setSaving(false)
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (name.trim()) {
                      onSave(name.trim())
                      setSaving(false)
                      setName('')
                      setOpen(false)
                    }
                  }}
                  className="flex-1 px-2 py-1 bg-brand-purple-600/30 border border-brand-purple-500 rounded text-xs font-cinzel text-brand-purple-200 hover:bg-brand-purple-600/50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setSaving(false)}
                  className="px-2 py-1 border border-brand-border rounded text-xs font-sans text-brand-muted hover:text-brand-parchment"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="p-2 border-b border-brand-border">
                <button
                  type="button"
                  onClick={() => setSaving(true)}
                  className="w-full text-left px-2 py-1.5 text-xs font-cinzel uppercase tracking-wider text-brand-gold-400/70 hover:text-brand-gold-400 transition-colors"
                >
                  + Save current settings
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {presets.length === 0 && (
                  <p className="px-3 py-3 text-xs font-sans text-brand-muted">No presets saved yet.</p>
                )}
                {presets.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2 hover:bg-brand-purple-600/10 group">
                    <button
                      type="button"
                      onClick={() => { onLoad(p); setOpen(false) }}
                      className="flex-1 text-left text-sm font-sans text-brand-parchment"
                    >
                      {p.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(p.id)}
                      className="text-brand-muted hover:text-red-400 text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.85
    window.speechSynthesis.speak(utterance)
  }
}

function ResultCard({
  result,
  isSaved,
  onSave,
  onUnsave,
}: {
  result: NameResult
  isSaved: boolean
  onSave: (r: NameResult) => void
  onUnsave: (name: string) => void
}) {
  return (
    <div className="p-5 rounded-lg border border-brand-border bg-brand-card hover:border-brand-purple-600/30 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-cinzel font-bold text-xl text-brand-parchment leading-tight">{result.name}</h3>
          <p className="font-fell text-brand-muted text-sm mt-0.5">{result.pronunciation}</p>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => speak(result.name)}
            title="Pronounce"
            className="p-1.5 rounded border border-brand-border text-brand-muted hover:text-brand-parchment hover:border-brand-purple-600/50 transition-all text-xs"
          >
            ♪
          </button>
          <button
            type="button"
            onClick={() => isSaved ? onUnsave(result.name) : onSave(result)}
            title={isSaved ? 'Unsave' : 'Save'}
            className={`p-1.5 rounded border transition-all text-xs ${
              isSaved
                ? 'bg-brand-purple-600/20 border-brand-purple-500 text-brand-purple-300'
                : 'border-brand-border text-brand-muted hover:border-brand-purple-600/50 hover:text-brand-parchment'
            }`}
          >
            {isSaved ? '★' : '☆'}
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm font-sans">
        {[
          ['Language', result.language],
          ['Roots',    result.root_words],
          ['Meaning',  result.meaning],
        ].map(([label, val]) => (
          <div key={label} className="flex gap-2">
            <span className="text-brand-gold-400/60 w-20 flex-shrink-0">{label}</span>
            <span className="text-brand-parchment">{val}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <span className="text-brand-gold-400/60 w-20 flex-shrink-0">Resonance</span>
          <span className="text-brand-muted italic">{result.resonance}</span>
        </div>
      </div>
    </div>
  )
}

function HistoryBatch({
  batch,
  savedNames,
  onSave,
  onUnsave,
}: {
  batch: HistoryBatchType
  savedNames: NameResult[]
  onSave: (r: NameResult) => void
  onUnsave: (name: string) => void
}) {
  const [open, setOpen] = useState(false)
  const savedSet = new Set(savedNames.map(s => s.name))
  const date = new Date(batch.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div className="border border-brand-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-brand-card hover:bg-brand-purple-600/5 transition-colors"
      >
        <div className="flex items-center gap-3 text-sm font-sans">
          <span className="text-brand-parchment font-semibold">{batch.target}</span>
          <span className="text-brand-muted">·</span>
          <span className="text-brand-muted">{batch.results.length} names</span>
          <span className="text-brand-muted">·</span>
          <span className="text-brand-muted">{date}</span>
        </div>
        <span className="text-brand-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-brand-border">
          {batch.results.map((r, i) => (
            <ResultCard key={i} result={r} isSaved={savedSet.has(r.name)} onSave={onSave} onUnsave={onUnsave} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TheSignet() {
  const [user, setUser] = useState<{ id: string; tier: string; credits: number } | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Settings
  const [target, setTarget] = useState('Character')
  const [charTarget, setCharTarget] = useState('Any')
  const [itemTarget, setItemTarget] = useState('Any')
  const [itemType, setItemType] = useState('Magical')
  const [rarity, setRarity] = useState('Rare')
  const [selectedLangs, setSelectedLangs] = useState<string[]>([])
  const [vibe, setVibe] = useState('')
  const [themes, setThemes] = useState<string[]>([])
  const [style, setStyle] = useState('')
  const [count, setCount] = useState(3)
  const [complexity, setComplexity] = useState(3)
  const [customPrompt, setCustomPrompt] = useState('')

  // UI
  const [tab, setTab] = useState<'generate' | 'saved' | 'history'>('generate')
  const [langPickerOpen, setLangPickerOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<NameResult[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Data
  const [savedNames, setSavedNames] = useState<NameResult[]>([])
  const [history, setHistory] = useState<HistoryBatchType[]>([])
  const [presets, setPresets] = useState<PresetType[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
  }, [])

  useEffect(() => {
    async function loadUserData() {
      try {
        const [profileRes, savedRes, presetsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/saved-names'),
          fetch('/api/user/presets'),
        ])
        if (profileRes.ok) setUser(await profileRes.json())
        if (savedRes.ok) {
          const s = await savedRes.json()
          setSavedNames(Array.isArray(s) ? s : [])
        }
        if (presetsRes.ok) {
          const p = await presetsRes.json()
          setPresets(Array.isArray(p) ? p : [])
        }
      } catch (err) {
        console.error('Failed to load user data', err)
      } finally {
        setProfileLoading(false)
      }
    }
    loadUserData()
  }, [])

  async function handleGenerate() {
    if (!user) return
    if (selectedLangs.length === 0) { showToast('Select at least one language', 'error'); return }

    setGenerating(true)
    setResults([])

    const isItem = target === 'Artifact'
    const subTarget = isItem ? itemTarget : (target === 'Character' ? charTarget : '')
    const rarityGuide = isItem ? (RARITY_NAMING_GUIDE[rarity] ?? '') : ''

    const systemPrompt = `You are a master linguist and worldbuilding name-smith. Generate ${count} distinct ${target.toLowerCase()} names drawn from the selected languages.

Return ONLY a valid JSON array with no surrounding text. Each object must have exactly these fields:
- "name": string
- "pronunciation": string (e.g. "VEL-eh-thor")
- "language": string (which language(s) inspired it)
- "root_words": string (original roots and meanings)
- "meaning": string (what the name means or connotes)
- "resonance": string (emotional/atmospheric quality)`

    const parts = [
      `Target: ${target}${subTarget && subTarget !== 'Any' ? ` (${subTarget})` : ''}`,
      `Languages: ${selectedLangs.map(c => ALL_LANGS.find(l => l.code === c)?.label ?? c).join(', ')}`,
      vibe              && `Vibe: ${vibe}`,
      themes.length > 0 && `Themes: ${themes.join(', ')}`,
      style             && `Naming style: ${style}`,
      isItem            && `Item type: ${itemType}`,
      isItem && rarity  && `Rarity: ${rarity} — ${rarityGuide}`,
      `Complexity (1–5): ${complexity}`,
      `Count: ${count}`,
      customPrompt      && `Notes: ${customPrompt}`,
    ].filter(Boolean).join('\n')

    try {
      const res = await fetch('/api/generate/signet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditsToUse: count,
          target,
          languages: selectedLangs,
          vibe,
          themes,
          style,
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1400,
          messages: [{ role: 'user', content: `${systemPrompt}\n\n${parts}` }],
        }),
      })

      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Generation failed', 'error'); return }

      const text = (data.content || []).map((b: { text?: string }) => b.text ?? '').join('')
      let parsed: NameResult[] = []
      try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {
        showToast('Failed to parse results', 'error'); return
      }

      setResults(parsed)
      setUser(u => u ? { ...u, credits: data.creditsRemaining ?? u.credits - count } : u)
      setHistory(h => [{
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        target,
        results: parsed,
      }, ...h])
    } catch {
      showToast('Network error', 'error')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave(result: NameResult) {
    try {
      const res = await fetch('/api/user/saved-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result),
      })
      if (res.ok) {
        const saved = await res.json()
        setSavedNames(s => [saved, ...s])
        showToast(`"${result.name}" saved`)
      }
    } catch { showToast('Failed to save', 'error') }
  }

  async function handleUnsave(name: string) {
    const entry = savedNames.find(s => s.name === name) as NameResult & { id?: string } | undefined
    if (!entry?.id) return
    try {
      await fetch(`/api/user/saved-names?id=${entry.id}`, { method: 'DELETE' })
      setSavedNames(s => s.filter(n => n.name !== name))
      showToast(`"${name}" removed`)
    } catch { showToast('Failed to remove', 'error') }
  }

  async function handleSavePreset(name: string) {
    const settings = { target, charTarget, itemTarget, itemType, rarity, selectedLangs, vibe, themes, style, count, complexity }
    try {
      const res = await fetch('/api/user/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, settings }),
      })
      if (res.ok) {
        const preset = await res.json()
        setPresets(p => [preset, ...p])
        showToast(`Preset "${name}" saved`)
      }
    } catch { showToast('Failed to save preset', 'error') }
  }

  function handleLoadPreset(preset: PresetType) {
    const s = preset.settings
    if (typeof s.target === 'string')      setTarget(s.target)
    if (typeof s.charTarget === 'string')  setCharTarget(s.charTarget)
    if (typeof s.itemTarget === 'string')  setItemTarget(s.itemTarget)
    if (typeof s.itemType === 'string')    setItemType(s.itemType)
    if (typeof s.rarity === 'string')      setRarity(s.rarity)
    if (Array.isArray(s.selectedLangs))    setSelectedLangs(s.selectedLangs as string[])
    if (typeof s.vibe === 'string')        setVibe(s.vibe)
    if (Array.isArray(s.themes))           setThemes(s.themes as string[])
    if (typeof s.style === 'string')       setStyle(s.style)
    if (typeof s.count === 'number')       setCount(s.count)
    if (typeof s.complexity === 'number')  setComplexity(s.complexity)
    showToast(`Preset "${preset.name}" loaded`)
  }

  async function handleDeletePreset(id: string) {
    try {
      await fetch(`/api/user/presets?id=${id}`, { method: 'DELETE' })
      setPresets(p => p.filter(pr => pr.id !== id))
    } catch { showToast('Failed to delete preset', 'error') }
  }

  const savedSet = new Set(savedNames.map(s => s.name))
  const isItem = target === 'Artifact'

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-brand-purple-500 border-t-transparent animate-spin" />
          <p className="font-fell text-brand-muted text-sm">Consulting the archives…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Header */}
      <header className="border-b border-brand-border bg-brand-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {LOGO}
            <div>
              <h1 className="font-cinzel font-bold text-brand-parchment text-lg leading-tight">The Signet</h1>
              <p className={`${SS} text-brand-muted`}>Name Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && <CreditPill credits={user.credits} tier={user.tier} />}
            <PresetDropdown
              presets={presets}
              onLoad={handleLoadPreset}
              onDelete={handleDeletePreset}
              onSave={handleSavePreset}
            />
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-brand-border bg-brand-card/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex">
            {(['generate', 'saved', 'history'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-5 py-3 font-cinzel text-xs uppercase tracking-widest border-b-2 transition-all ${
                  tab === t
                    ? 'border-brand-purple-500 text-brand-purple-300'
                    : 'border-transparent text-brand-muted hover:text-brand-parchment'
                }`}
              >
                {t === 'generate' ? 'Generate' : t === 'saved' ? `Saved (${savedNames.length})` : 'History'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Generate Tab ── */}
        {tab === 'generate' && (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Settings */}
            <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">

              <div>
                <Label>What are you naming?</Label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGETS.map(t => (
                    <Chip key={t} label={t} active={target === t} onClick={() => setTarget(t)} />
                  ))}
                </div>
              </div>

              {target === 'Character' && (
                <div>
                  <Label>Character Role</Label>
                  <SearchableSelect options={CHAR_TARGETS} value={charTarget} onChange={setCharTarget} />
                </div>
              )}

              {isItem && (
                <>
                  <div>
                    <Label>Item Type</Label>
                    <SearchableSelect options={ITEM_TARGETS} value={itemTarget} onChange={setItemTarget} />
                  </div>
                  <div>
                    <Label>Magic Level</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {ITEM_TYPES.map(t => (
                        <Chip key={t} label={t} active={itemType === t} onClick={() => setItemType(t)} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Rarity</Label>
                    <SearchableSelect options={RARITIES} value={rarity} onChange={setRarity} />
                    {rarity && (
                      <p className="mt-1.5 text-xs font-sans text-brand-muted leading-relaxed">
                        {RARITY_NAMING_GUIDE[rarity]}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Languages</Label>
                  <div className="flex items-center gap-2">
                    {selectedLangs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedLangs([])}
                        className="text-xs font-sans text-brand-muted hover:text-brand-parchment"
                      >
                        Clear ({selectedLangs.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setLangPickerOpen(o => !o)}
                      className="text-xs font-cinzel uppercase tracking-wider text-brand-purple-400 hover:text-brand-purple-300"
                    >
                      {langPickerOpen ? 'Close ▲' : 'Browse ▼'}
                    </button>
                  </div>
                </div>
                {selectedLangs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedLangs.map(code => {
                      const lang = ALL_LANGS.find(l => l.code === code)
                      return (
                        <span
                          key={code}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-brand-purple-600/20 border border-brand-purple-500/50 text-xs font-sans text-brand-purple-200"
                        >
                          {lang?.label ?? code}
                          <button
                            type="button"
                            onClick={() => setSelectedLangs(s => s.filter(c => c !== code))}
                            className="hover:text-white"
                          >
                            ✕
                          </button>
                        </span>
                      )
                    })}
                  </div>
                )}
                {langPickerOpen && (
                  <div className="mt-2 p-3 rounded-lg border border-brand-border bg-brand-bg max-h-72 overflow-y-auto">
                    <LanguagePicker selected={selectedLangs} onChange={setSelectedLangs} />
                  </div>
                )}
              </div>

              <div>
                <Label>Vibe / Tone</Label>
                <div className="flex flex-wrap gap-1.5">
                  {VIBES.map(v => (
                    <Chip key={v} label={v} active={vibe === v} onClick={() => setVibe(vibe === v ? '' : v)} />
                  ))}
                </div>
              </div>

              <div>
                <Label>Themes</Label>
                <MultiDropdown options={THEMES} selected={themes} onChange={setThemes} placeholder="Any theme…" />
              </div>

              <div>
                <Label>Naming Style</Label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map(s => (
                    <Chip key={s} label={s} active={style === s} onClick={() => setStyle(style === s ? '' : s)} />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Complexity</Label>
                  <ComplexityDots value={complexity} onChange={setComplexity} />
                </div>
                <p className="text-xs font-sans text-brand-muted">
                  {complexity <= 2 ? 'Short, simple names' : complexity === 3 ? 'Balanced complexity' : 'Long, elaborate names'}
                </p>
              </div>

              <div>
                <Label>How many names?</Label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 5, 8].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`flex-1 py-1.5 rounded border text-sm font-cinzel transition-all ${
                        count === n
                          ? 'bg-brand-purple-600/30 border-brand-purple-500 text-brand-purple-200'
                          : 'border-brand-border text-brand-muted hover:border-brand-purple-600/50 hover:text-brand-parchment'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Additional Notes</Label>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Any specific requirements or context…"
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-brand-border bg-brand-bg text-sm font-sans text-brand-parchment placeholder:text-brand-muted outline-none resize-none focus:border-brand-purple-600/50 transition-all"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !user || selectedLangs.length === 0}
                className="w-full py-3 rounded-lg font-cinzel uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-brand-purple-600 hover:bg-brand-purple-500 text-white border border-brand-purple-500 shadow-lg shadow-brand-purple-900/20"
              >
                {generating ? 'Forging names…' : `Generate · ${count} credit${count !== 1 ? 's' : ''}`}
              </button>
            </aside>

            {/* Results */}
            <main className="flex-1 min-w-0">
              {!generating && results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 opacity-20">{LOGO}</div>
                  <h2 className="font-cinzel text-brand-parchment text-lg mb-2">The forge awaits</h2>
                  <p className="font-fell text-brand-muted text-sm max-w-xs leading-relaxed">
                    Select your languages, set your tone, and let the Signet draw names from the roots of the world.
                  </p>
                </div>
              )}

              {generating && (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-purple-500 border-t-transparent animate-spin mb-4" />
                  <p className="font-fell text-brand-muted text-sm">Drawing from the old tongues…</p>
                </div>
              )}

              {!generating && results.length > 0 && (
                <div className={`${GS} grid-cols-1 md:grid-cols-2`}>
                  {results.map((r, i) => (
                    <ResultCard key={i} result={r} isSaved={savedSet.has(r.name)} onSave={handleSave} onUnsave={handleUnsave} />
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {/* ── Saved Tab ── */}
        {tab === 'saved' && (
          <div>
            <div className="mb-6">
              <h2 className="font-cinzel font-bold text-brand-parchment text-xl mb-1">Saved Names</h2>
              <p className={`${SS} ${C.muted}`}>{savedNames.length} name{savedNames.length !== 1 ? 's' : ''} in your collection</p>
            </div>
            {savedNames.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-fell text-brand-muted">No saved names yet. Generate some and star the ones you like.</p>
              </div>
            ) : (
              <div className={`${GS} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
                {savedNames.map((s, i) => (
                  <ResultCard key={i} result={s} isSaved={true} onSave={handleSave} onUnsave={handleUnsave} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div>
            <div className="mb-6">
              <h2 className="font-cinzel font-bold text-brand-parchment text-xl mb-1">Generation History</h2>
              <p className={`${SS} ${C.muted}`}>{history.length} batch{history.length !== 1 ? 'es' : ''} this session</p>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-fell text-brand-muted">No history yet. Generate some names to see them here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(batch => (
                  <HistoryBatch
                    key={batch.id}
                    batch={batch}
                    savedNames={savedNames}
                    onSave={handleSave}
                    onUnsave={handleUnsave}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
