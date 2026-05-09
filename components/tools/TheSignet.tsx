"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect, useMemo } from "react";

// ── Brand ─────────────────────────────────────────────────────────────────────
const C = {
  bg: "#12100D", bg2: "#0E0C09", card: "#1C1810", card2: "#201C15",
  purple: "#6B1CA8", purpleL: "#C090F0",
  purpleDim: "rgba(107,28,168,0.18)", purpleB: "rgba(107,28,168,0.32)",
  gold: "#D4AE58", goldDim: "rgba(212,174,88,0.14)", goldB: "rgba(212,174,88,0.32)",
  t1: "#F2E8D5", t2: "#C8B99A", t3: "#8A7A65", t4: "rgba(237,224,200,0.08)",
  border: "rgba(107,28,168,0.25)",
  danger: "#D4756A", dangerDim: "rgba(212,117,106,0.15)", dangerB: "rgba(212,117,106,0.4)",
  success: "#6DB88A",
};

// ── Tiers ─────────────────────────────────────────────────────────────────────
const TIERS = {
  wanderer:  { label: "Wanderer",   price: "Free",    credits: 100,  daily: 5,  /* TODO: implement daily refresh via Supabase */ maxLangs: 2,         maxSaves: 5,        maxPresets: 1,  historyLimit: 12,        dedup: false },
  keeper:    { label: "Keeper",     price: "$6.99",   credits: 500,  daily: 10, /* TODO: implement daily refresh via Supabase */ maxLangs: 3,         maxSaves: 20,       maxPresets: 5,  historyLimit: 100,       dedup: false },
  shaper:    { label: "Shaper",     price: "$12.99",  credits: 1000, daily: 15, /* TODO: implement daily refresh via Supabase */ maxLangs: Infinity,  maxSaves: Infinity, maxPresets: 10, historyLimit: Infinity,  dedup: true },
  weaver:    { label: "Weaver",     price: "$19.99",  credits: 2500, daily: 25, /* TODO: implement daily refresh via Supabase */ maxLangs: Infinity,  maxSaves: Infinity, maxPresets: 20, historyLimit: Infinity,  dedup: true },
  visionary: { label: "Visionary",  price: "$34.99",  credits: 5000, daily: 50, /* TODO: implement daily refresh via Supabase */ maxLangs: Infinity,  maxSaves: Infinity, maxPresets: 20, historyLimit: Infinity,  dedup: true },
  author:    { label: "The Author", price: "$999",    credits: 500,  daily: 50, /* TODO: implement daily refresh via Supabase */ maxLangs: Infinity,  maxSaves: Infinity, maxPresets: 20, historyLimit: Infinity,  dedup: true, rollover: true, cap: 15000 },
};

const LOGO = "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";

// ── Language data ──────────────────────────────────────────────────────────────
const LANG_CATEGORIES: Record<string, { id: string; name: string; desc: string }[]> = {
  "Classical Roots": [
    { id: "latin",    name: "Latin",    desc: "Roman gravitas" },
    { id: "greek",    name: "Greek",    desc: "Hellenic cadence" },
    { id: "sanskrit", name: "Sanskrit", desc: "Ancient Indic flow" },
    { id: "hebrew",   name: "Hebrew",   desc: "Semitic resonance" },
    { id: "arabic",   name: "Arabic",   desc: "Desert poetry" },
  ],
  "Northern Tongues": [
    { id: "norse",    name: "Old Norse",   desc: "Viking edge" },
    { id: "gaelic",   name: "Gaelic",      desc: "Celtic mist" },
    { id: "welsh",    name: "Welsh",       desc: "Bardic rhythm" },
    { id: "germanic", name: "Old Germanic",desc: "Runic weight" },
    { id: "slavic",   name: "Slavic",      desc: "Eastern myth" },
  ],
  "Eastern Voices": [
    { id: "japanese", name: "Japanese",  desc: "Poetic concision" },
    { id: "chinese",  name: "Chinese",   desc: "Tonal beauty" },
    { id: "persian",  name: "Persian",   desc: "Lyric tradition" },
    { id: "swahili",  name: "Swahili",   desc: "Bantu resonance" },
    { id: "nahuatl",  name: "Nahuatl",   desc: "Mesoamerican fire" },
  ],
  "Invented Tongues": [
    { id: "elvish",   name: "Elvish-like",   desc: "Tolkien-esque flow" },
    { id: "dwarven",  name: "Dwarven-like",  desc: "Stony consonants" },
    { id: "orcish",   name: "Orcish-like",   desc: "Brutal guttural" },
    { id: "celestial",name: "Celestial-like",desc: "Divine harmonics" },
    { id: "infernal", name: "Infernal-like", desc: "Dark syllables" },
  ],
};

const ALL_LANGS = Object.entries(LANG_CATEGORIES).flatMap(([cat, langs]) =>
  langs.map((l: any) => ({ ...l, category: cat }))
);

// ── Name types ────────────────────────────────────────────────────────────────
const NAME_TYPES = [
  { id: "character", label: "Character",  desc: "Heroes, villains, and everyone between" },
  { id: "place",     label: "Place",      desc: "Cities, ruins, rivers, mountain passes" },
  { id: "faction",   label: "Faction",    desc: "Guilds, cults, armies, noble houses" },
  { id: "deity",     label: "Deity",      desc: "Gods, demons, spirits, cosmic forces" },
  { id: "artefact",  label: "Artefact",   desc: "Swords, relics, grimoires, cursed rings" },
  { id: "creature",  label: "Creature",   desc: "Beasts, monsters, familiars, mounts" },
];

// ── Tonal modifiers ───────────────────────────────────────────────────────────
const TONES = [
  { id: "none",       label: "Neutral" },
  { id: "heroic",     label: "Heroic" },
  { id: "dark",       label: "Dark" },
  { id: "ancient",    label: "Ancient" },
  { id: "whimsical",  label: "Whimsical" },
  { id: "noble",      label: "Noble" },
  { id: "ominous",    label: "Ominous" },
  { id: "mystical",   label: "Mystical" },
];

// ── Gender ────────────────────────────────────────────────────────────────────
const GENDERS = [
  { id: "neutral",   label: "Neutral" },
  { id: "masculine", label: "Masc." },
  { id: "feminine",  label: "Fem." },
];

// ── Syllable count ────────────────────────────────────────────────────────────
const SYLLABLE_OPTS = [
  { id: "any",   label: "Any" },
  { id: "short", label: "1–2" },
  { id: "med",   label: "3–4" },
  { id: "long",  label: "5+" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildPrompt(count: number, refName: string | null) {
  return ``;  // placeholder – real prompt is assembled inline below
}

function parseNames(raw: string): string[] {
  return raw
    .split("\n")
    .map((l: string) => l.replace(/^\s*[\d\-\*\.]+\s*/, "").trim())
    .filter((l: string) => l.length > 1 && l.length < 60);
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SavedName {
  id: string;
  name: string;
  type: string;
  langs: string[];
  tone: string;
  note: string;
  savedAt: number;
}

interface HistoryEntry {
  names: string[];
  type: string;
  langs: string[];
  tone: string;
  ts: number;
}

// ── Micro-components ──────────────────────────────────────────────────────────
function Tag({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: 3,
        fontSize: 11,
        fontFamily: "var(--font-cinzel, serif)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        border: `1px solid ${active ? C.gold : C.border}`,
        background: active ? C.goldDim : "transparent",
        color: active ? C.gold : C.t3,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function Pill({ active, onClick, children, danger }: { active: boolean; onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  const col = danger ? C.danger : C.purple;
  const dimCol = danger ? C.dangerDim : C.purpleDim;
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 20,
        fontSize: 11,
        fontFamily: "var(--font-cinzel, serif)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        border: `1px solid ${active ? col : C.border}`,
        background: active ? dimCol : "transparent",
        color: active ? (danger ? C.danger : C.purpleL) : C.t3,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-cinzel, serif)", color: C.t3, marginBottom: 10 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TheSignet() {
  // Clerk role detection
  const { user } = useUser();
  const clerkRole = (user?.publicMetadata?.role as string) ?? "wanderer";
  const TIER_KEY = clerkRole in TIERS ? clerkRole : "wanderer";
  const tier = TIERS[TIER_KEY as keyof typeof TIERS];

  // ── State ────────────────────────────────────────────────────────────────────
  const [nameType,    setNameType]    = useState("character");
  const [selLangs,    setSelLangs]    = useState<string[]>(["latin"]);
  const [tone,        setTone]        = useState("none");
  const [gender,      setGender]      = useState("neutral");
  const [syllables,   setSyllables]   = useState("any");
  const [count,       setCount]       = useState(6);
  const [keyword,     setKeyword]     = useState("");
  const [results,     setResults]     = useState<string[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [saved,       setSaved]       = useState<SavedName[]>([]);
  const [history,     setHistory]     = useState<HistoryEntry[]>([]);
  const [activeTab,   setActiveTab]   = useState<"forge"|"saved"|"history">("forge");
  const [noteTarget,  setNoteTarget]  = useState<string | null>(null);
  const [noteText,    setNoteText]    = useState("");
  const [credits,     setCredits]     = useState(tier.credits);
  const [langSearch,  setLangSearch]  = useState("");
  const [langExpanded,setLangExpanded]= useState(false);

  const langSearchRef = useRef<HTMLInputElement>(null);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filteredLangs = useMemo(() => {
    const q = langSearch.toLowerCase();
    return q ? ALL_LANGS.filter((l: any) => l.name.toLowerCase().includes(q) || l.desc.toLowerCase().includes(q)) : ALL_LANGS;
  }, [langSearch]);

  const langAtLimit = selLangs.length >= tier.maxLangs;

  // ── Build prompt ─────────────────────────────────────────────────────────────
  function buildActualPrompt(n: number, ref: string | null): string {
    const langNames = selLangs.map((id: string) => ALL_LANGS.find((l: any) => l.id === id)?.name ?? id).join(", ");
    const typeName  = NAME_TYPES.find(t => t.id === nameType)?.label ?? nameType;
    const toneName  = TONES.find(t => t.id === tone)?.label ?? tone;
    const genderNote = gender === "neutral" ? "" : ` with a ${gender} feel`;
    const syllNote   = syllables === "any" ? "" : syllables === "short" ? " (1–2 syllables)" : syllables === "med" ? " (3–4 syllables)" : " (5+ syllables)";
    const kwNote     = keyword ? ` with thematic resonance toward: "${keyword}"` : "";
    const refNote    = ref ? `\n\nCreate a name similar in spirit to "${ref}" but distinct.` : "";
    const dedupNote  = tier.dedup && results.length ? `\n\nAvoid these already-generated names: ${results.join(", ")}.` : "";

    return `You are a fantasy name scholar with deep expertise in linguistics, mythology, and world-building.

Generate ${n} unique ${typeName.toLowerCase()} name${n > 1 ? "s" : ""}${genderNote}${syllNote} inspired by ${langNames} linguistic patterns. Tone: ${toneName}.${kwNote}${refNote}${dedupNote}

Rules:
- Each name must be pronounceable and feel authentic to its linguistic roots
- Names should be original, not direct translations or real historical names
- Output ONLY the names, one per line, numbered
- No explanations, no parenthetical notes, no language tags
- ${n} names total`;
  }

  // ── Generate ─────────────────────────────────────────────────────────────────
  async function generate() {
    if (loading || selLangs.length === 0) return;
    if (credits <= 0) { setError("No credits remaining. Upgrade your tier."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildActualPrompt(count, null) }),
      });
      const { text } = await res.json();
      const names = parseNames(text).slice(0, count);
      setResults(names);
      setCredits(c => Math.max(0, c - 1));
      if (names.length > 0) {
        setHistory(h => [{ names, type: nameType, langs: selLangs, tone, ts: Date.now() }, ...h].slice(0, tier.historyLimit === Infinity ? 1000 : tier.historyLimit));
      }
    } catch (e: any) {
      setError(e.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Forge one (variant) ───────────────────────────────────────────────────────
  async function forgeOne(ref: string) {
    if (loading || credits <= 0) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/forge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildActualPrompt(1, ref) }),
      });
      const { text } = await res.json();
      const [name] = parseNames(text);
      if (name) {
        setResults(r => r.map((n: string) => n === ref ? name : n));
        setCredits(c => Math.max(0, c - 1));
      }
    } catch (e: any) {
      setError(e.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  function saveName(name: string) {
    if (saved.length >= tier.maxSaves) { setError(`Tier limit: ${tier.maxSaves} saved names. Upgrade to save more.`); return; }
    if (saved.find((s: SavedName) => s.name === name)) return;
    setSaved(s => [...s, { id: crypto.randomUUID(), name, type: nameType, langs: selLangs, tone, note: "", savedAt: Date.now() }]);
  }

  function removeSaved(id: string) {
    setSaved(s => s.filter((n: SavedName) => n.id !== id));
  }

  function saveNote(id: string) {
    setSaved(s => s.map((n: SavedName) => n.id === id ? { ...n, note: noteText } : n));
    setNoteTarget(null); setNoteText("");
  }

  // ── Toggle lang ───────────────────────────────────────────────────────────────
  function toggleLang(id: string) {
    setSelLangs(prev => {
      if (prev.includes(id)) return prev.filter((l: string) => l !== id);
      if (prev.length >= tier.maxLangs) return prev;
      return [...prev, id];
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const isSaved = (name: string) => saved.some((s: SavedName) => s.name === name);

  // ── Styles (inline, no Tailwind dependency) ───────────────────────────────────
  const root: React.CSSProperties = {
    minHeight: "100vh",
    background: C.bg,
    color: C.t1,
    padding: "40px 24px 80px",
    maxWidth: 900,
    margin: "0 auto",
    fontFamily: "var(--font-fell, Georgia, serif)",
  };

  const panel: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: "24px",
    marginBottom: 16,
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: C.bg2,
    border: `1px solid ${C.border}`,
    borderRadius: 3,
    color: C.t1,
    padding: "8px 12px",
    fontSize: 13,
    fontFamily: "var(--font-fell, Georgia, serif)",
    outline: "none",
    boxSizing: "border-box",
  };

  const btn: React.CSSProperties = {
    padding: "10px 28px",
    borderRadius: 3,
    fontSize: 11,
    fontFamily: "var(--font-cinzel, serif)",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    border: `1px solid ${C.gold}`,
    background: C.goldDim,
    color: C.gold,
    cursor: "pointer",
    transition: "all 0.15s",
  };

  const iconBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px",
    fontSize: 14,
    color: C.t3,
    transition: "color 0.15s",
  };

  return (
    <div style={root}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${LOGO}`} alt="The Signet" style={{ width: 40, height: 40, opacity: 0.85 }} />
          <div>
            <h2 style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: 20, color: C.t1, margin: 0 }}>The Signet</h2>
            <p style={{ fontSize: 11, color: C.t3, margin: 0, fontStyle: "italic" }}>Name Forge</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-cinzel, serif)", color: C.t3, margin: 0 }}>
            {tier.label}
          </p>
          <p style={{ fontSize: 11, color: credits < 10 ? C.danger : C.gold, margin: 0 }}>
            {credits} credits
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {(["forge","saved","history"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 20px",
              fontFamily: "var(--font-cinzel, serif)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              border: "none",
              borderBottom: activeTab === tab ? `2px solid ${C.gold}` : "2px solid transparent",
              background: "none",
              color: activeTab === tab ? C.gold : C.t3,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {tab}{tab === "saved" ? ` (${saved.length})` : ""}
          </button>
        ))}
      </div>

      {/* ── FORGE TAB ── */}
      {activeTab === "forge" && (
        <>
          {/* Controls */}
          <div style={panel}>
            {/* Name type */}
            <Section title="Name Type">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {NAME_TYPES.map(t => (
                  <Tag key={t.id} active={nameType === t.id} onClick={() => setNameType(t.id)}>{t.label}</Tag>
                ))}
              </div>
            </Section>

            {/* Languages */}
            <Section title={`Language Influences (${selLangs.length}/${tier.maxLangs === Infinity ? "∞" : tier.maxLangs})`}>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  ref={langSearchRef}
                  value={langSearch}
                  onChange={e => setLangSearch(e.target.value)}
                  placeholder="Search languages…"
                  style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                />
                <button
                  onClick={() => setLangExpanded(x => !x)}
                  style={{ ...iconBtn, color: C.t2 }}
                >
                  {langExpanded ? "▲" : "▼"}
                </button>
              </div>

              {/* Selected chips */}
              {selLangs.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                  {selLangs.map((id: string) => {
                    const l = ALL_LANGS.find((x: any) => x.id === id);
                    return (
                      <span
                        key={id}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 10px", borderRadius: 20, fontSize: 10,
                          fontFamily: "var(--font-cinzel, serif)", letterSpacing: "0.08em",
                          background: C.goldDim, border: `1px solid ${C.goldB}`, color: C.gold,
                        }}
                      >
                        {l?.name}
                        <button onClick={() => toggleLang(id)} style={{ ...iconBtn, padding: "0 0 0 2px", fontSize: 10, color: C.gold }}>×</button>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Lang grid */}
              {langExpanded && (
                <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                  {Object.entries(LANG_CATEGORIES).map(([cat, langs]) => {
                    const visible = langs.filter((l: any) => filteredLangs.some((f: any) => f.id === l.id));
                    if (!visible.length) return null;
                    return (
                      <div key={cat} style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: C.t3, fontFamily: "var(--font-cinzel, serif)", marginBottom: 6 }}>{cat}</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                          {visible.map((l: any) => {
                            const isSelected = selLangs.includes(l.id);
                            const disabled = langAtLimit && !isSelected;
                            return (
                              <button
                                key={l.id}
                                onClick={() => !disabled && toggleLang(l.id)}
                                title={l.desc}
                                style={{
                                  padding: "4px 11px", borderRadius: 3, fontSize: 10,
                                  fontFamily: "var(--font-cinzel, serif)", letterSpacing: "0.07em",
                                  border: `1px solid ${isSelected ? C.gold : C.border}`,
                                  background: isSelected ? C.goldDim : "transparent",
                                  color: disabled ? C.t3 + "55" : isSelected ? C.gold : C.t2,
                                  cursor: disabled ? "not-allowed" : "pointer",
                                  opacity: disabled ? 0.45 : 1,
                                  transition: "all 0.12s",
                                }}
                              >
                                {l.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>

            {/* Tone */}
            <Section title="Tone">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {TONES.map(t => (
                  <Pill key={t.id} active={tone === t.id} onClick={() => setTone(t.id)}>{t.label}</Pill>
                ))}
              </div>
            </Section>

            {/* Gender + Syllables + Count */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
              <Section title="Gender Feel">
                <div style={{ display: "flex", gap: 5 }}>
                  {GENDERS.map(g => (
                    <Pill key={g.id} active={gender === g.id} onClick={() => setGender(g.id)}>{g.label}</Pill>
                  ))}
                </div>
              </Section>
              <Section title="Syllables">
                <div style={{ display: "flex", gap: 5 }}>
                  {SYLLABLE_OPTS.map(s => (
                    <Pill key={s.id} active={syllables === s.id} onClick={() => setSyllables(s.id)}>{s.label}</Pill>
                  ))}
                </div>
              </Section>
              <Section title={`Count: ${count}`}>
                <input
                  type="range"
                  min={1}
                  max={Math.min(20, tier.daily)}
                  value={count}
                  onChange={e => setCount(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.gold }}
                />
              </Section>
            </div>

            {/* Keyword */}
            <Section title="Thematic Keyword (optional)">
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="e.g. shadow, storm, betrayal…"
                style={inputStyle}
              />
            </Section>

            {/* Generate button */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={generate}
                disabled={loading || selLangs.length === 0 || credits <= 0}
                style={{
                  ...btn,
                  opacity: (loading || selLangs.length === 0 || credits <= 0) ? 0.5 : 1,
                  cursor: (loading || selLangs.length === 0 || credits <= 0) ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Forging…" : "Forge Names"}
              </button>
              {selLangs.length === 0 && (
                <p style={{ fontSize: 11, color: C.danger, fontStyle: "italic" }}>Select at least one language</p>
              )}
              {credits <= 0 && (
                <p style={{ fontSize: 11, color: C.danger, fontStyle: "italic" }}>No credits remaining</p>
              )}
            </div>

            {error && (
              <p style={{ marginTop: 12, fontSize: 12, color: C.danger, fontStyle: "italic" }}>{error}</p>
            )}
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div style={panel}>
              <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-cinzel, serif)", color: C.t3, marginBottom: 16 }}>
                Generated Names
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {results.map((name: string, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: C.card2,
                      border: `1px solid ${C.border}`,
                      borderRadius: 3,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: 15, color: C.t1 }}>{name}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => forgeOne(name)}
                        title="Forge a variant"
                        style={{ ...iconBtn, fontSize: 13 }}
                      >
                        ↻
                      </button>
                      <button
                        onClick={() => saveName(name)}
                        title={isSaved(name) ? "Saved" : "Save name"}
                        style={{ ...iconBtn, color: isSaved(name) ? C.gold : C.t3 }}
                      >
                        {isSaved(name) ? "★" : "☆"}
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(name)}
                        title="Copy"
                        style={iconBtn}
                      >
                        ⎘
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── SAVED TAB ── */}
      {activeTab === "saved" && (
        <div style={panel}>
          {saved.length === 0 ? (
            <p style={{ color: C.t3, fontStyle: "italic", fontSize: 13 }}>No saved names yet. Star a name to save it.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {saved.map((s: SavedName) => (
                <div key={s.id} style={{ padding: "12px 16px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-cinzel, serif)", fontSize: 15, color: C.t1, margin: 0 }}>{s.name}</p>
                      <p style={{ fontSize: 10, color: C.t3, margin: "2px 0 0", fontStyle: "italic" }}>
                        {s.type} · {s.langs.join(", ")} · {s.tone}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        onClick={() => { setNoteTarget(s.id); setNoteText(s.note); }}
                        title="Add note"
                        style={{ ...iconBtn, color: s.note ? C.gold : C.t3 }}
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(s.name)}
                        title="Copy"
                        style={iconBtn}
                      >
                        ⎘
                      </button>
                      <button
                        onClick={() => removeSaved(s.id)}
                        title="Remove"
                        style={{ ...iconBtn, color: C.danger }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {s.note && (
                    <p style={{ fontSize: 11, color: C.t2, marginTop: 6, fontStyle: "italic" }}>{s.note}</p>
                  )}
                  {noteTarget === s.id && (
                    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                      <input
                        value={noteText}
                        onChange={e => setNoteText(e.target.value)}
                        placeholder="Add a note…"
                        style={{ ...inputStyle, flex: 1, fontSize: 12 }}
                        autoFocus
                      />
                      <button onClick={() => saveNote(s.id)} style={{ ...btn, padding: "6px 16px" }}>Save</button>
                      <button onClick={() => setNoteTarget(null)} style={{ ...iconBtn, color: C.t3 }}>×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div style={panel}>
          {history.length === 0 ? (
            <p style={{ color: C.t3, fontStyle: "italic", fontSize: 13 }}>No generation history yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {history.map((h: HistoryEntry, i: number) => (
                <div key={i} style={{ padding: "12px 16px", background: C.card2, border: `1px solid ${C.border}`, borderRadius: 3 }}>
                  <p style={{ fontSize: 9, color: C.t3, fontFamily: "var(--font-cinzel, serif)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 8px" }}>
                    {h.type} · {h.langs.join(", ")} · {h.tone} · {new Date(h.ts).toLocaleTimeString()}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {h.names.map((name: string, j: number) => (
                      <span
                        key={j}
                        style={{
                          fontFamily: "var(--font-cinzel, serif)", fontSize: 13,
                          color: C.t2, padding: "2px 8px",
                          background: C.t4, borderRadius: 2,
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tier info footer */}
      <div style={{ marginTop: 32, padding: "16px 20px", background: C.purpleDim, border: `1px solid ${C.purpleB}`, borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 10, fontFamily: "var(--font-cinzel, serif)", letterSpacing: "0.14em", textTransform: "uppercase", color: C.purpleL, margin: 0 }}>
            {tier.label} · {tier.price}
          </p>
          <p style={{ fontSize: 11, color: C.t3, margin: "2px 0 0", fontStyle: "italic" }}>
            {credits} / {tier.credits} credits · {tier.maxSaves === Infinity ? "∞" : tier.maxSaves} saves · {tier.maxLangs === Infinity ? "∞" : tier.maxLangs} languages
          </p>
        </div>
        {TIER_KEY !== "author" && (
          <a
            href="/pricing"
            style={{
              fontSize: 10, fontFamily: "var(--font-cinzel, serif)", letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.purpleL, textDecoration: "none",
              border: `1px solid ${C.purpleB}`, padding: "5px 14px", borderRadius: 3,
            }}
          >
            Upgrade
          </a>
        )}
      </div>
    </div>
  );
}
