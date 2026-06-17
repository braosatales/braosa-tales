'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FormState = {
  name: string
  portrait_url: string
  clerk_user_id: string
  level: string
  class: string
  race: string
  background: string
  hp_current: string
  hp_max: string
  stat_strength: string
  stat_dexterity: string
  stat_constitution: string
  stat_intelligence: string
  stat_wisdom: string
  stat_charisma: string
  public_notes: string
  secret_notes: string
}

function emptyForm(): FormState {
  return {
    name: '', portrait_url: '', clerk_user_id: '',
    level: '', class: '', race: '', background: '',
    hp_current: '', hp_max: '',
    stat_strength: '', stat_dexterity: '', stat_constitution: '',
    stat_intelligence: '', stat_wisdom: '', stat_charisma: '',
    public_notes: '', secret_notes: '',
  }
}

function numOrNull(s: string): number | null {
  const n = parseInt(s)
  return isNaN(n) ? null : n
}

const STAT_KEYS = [
  { key: 'stat_strength' as const, label: 'STR' },
  { key: 'stat_dexterity' as const, label: 'DEX' },
  { key: 'stat_constitution' as const, label: 'CON' },
  { key: 'stat_intelligence' as const, label: 'INT' },
  { key: 'stat_wisdom' as const, label: 'WIS' },
  { key: 'stat_charisma' as const, label: 'CHA' },
]

export default function NewPlayerClient() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  async function handleSave() {
    if (!form.name.trim()) { setErr('Name is required'); return }
    setSaving(true); setErr('')

    const res = await fetch('/api/the8adventurers/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        portrait_url: form.portrait_url.trim() || null,
        clerk_user_id: form.clerk_user_id.trim() || null,
        level: numOrNull(form.level),
        class: form.class.trim() || null,
        race: form.race.trim() || null,
        background: form.background.trim() || null,
        hp_current: numOrNull(form.hp_current),
        hp_max: numOrNull(form.hp_max),
        stat_strength: numOrNull(form.stat_strength),
        stat_dexterity: numOrNull(form.stat_dexterity),
        stat_constitution: numOrNull(form.stat_constitution),
        stat_intelligence: numOrNull(form.stat_intelligence),
        stat_wisdom: numOrNull(form.stat_wisdom),
        stat_charisma: numOrNull(form.stat_charisma),
        public_notes: form.public_notes.trim() || null,
        secret_notes: form.secret_notes.trim() || null,
      }),
    })

    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setErr(json.error ?? 'Error saving'); return }
    router.push(`/the8adventurers/players/${json.id}`)
    router.refresh()
  }

  const inputCls = 'w-full bg-brand-bg border border-brand-border rounded-sm px-3 py-2 text-brand-parchment font-fell text-sm focus:outline-none focus:border-brand-purple-600'

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <p className="section-label">Campaign</p>
        <h1 className="font-cinzel text-brand-parchment text-2xl md:text-3xl font-bold">Add Player</h1>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label block mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="section-label block mb-1">Clerk User ID</label>
            <input type="text" value={form.clerk_user_id} onChange={(e) => setForm((f) => ({ ...f, clerk_user_id: e.target.value }))} className={inputCls} placeholder="user_…" />
          </div>
        </div>

        <div>
          <label className="section-label block mb-1">Portrait URL</label>
          <input type="text" value={form.portrait_url} onChange={(e) => setForm((f) => ({ ...f, portrait_url: e.target.value }))} className={inputCls} placeholder="https://…" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="section-label block mb-1">Level</label>
            <input type="number" value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="section-label block mb-1">Class</label>
            <input type="text" value={form.class} onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))} className={inputCls} placeholder="Fighter…" />
          </div>
          <div>
            <label className="section-label block mb-1">Race</label>
            <input type="text" value={form.race} onChange={(e) => setForm((f) => ({ ...f, race: e.target.value }))} className={inputCls} placeholder="Elf…" />
          </div>
        </div>

        <div>
          <label className="section-label block mb-1">Background</label>
          <input type="text" value={form.background} onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))} className={inputCls} placeholder="Soldier…" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label block mb-1">HP Current</label>
            <input type="number" value={form.hp_current} onChange={(e) => setForm((f) => ({ ...f, hp_current: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="section-label block mb-1">HP Max</label>
            <input type="number" value={form.hp_max} onChange={(e) => setForm((f) => ({ ...f, hp_max: e.target.value }))} className={inputCls} />
          </div>
        </div>

        <div>
          <label className="section-label block mb-2">Ability Scores</label>
          <div className="grid grid-cols-6 gap-2">
            {STAT_KEYS.map(({ key, label }) => (
              <div key={key}>
                <label className="section-label block mb-1 text-center">{label}</label>
                <input
                  type="number"
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-brand-bg border border-brand-border rounded-sm px-2 py-1.5 text-brand-parchment font-fell text-sm text-center focus:outline-none focus:border-brand-purple-600"
                  min={1} max={30}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="section-label block mb-1">Public Notes</label>
          <textarea value={form.public_notes} onChange={(e) => setForm((f) => ({ ...f, public_notes: e.target.value }))} rows={3} className={`${inputCls} resize-y`} placeholder="Visible to all signed-in players" />
        </div>

        <div>
          <label className="section-label text-brand-gold-400 block mb-1">GM Notes (always secret)</label>
          <textarea value={form.secret_notes} onChange={(e) => setForm((f) => ({ ...f, secret_notes: e.target.value }))} rows={3} className={`${inputCls} resize-y`} placeholder="GM-only notes" />
        </div>

        {err && <p className="text-red-400 text-sm font-fell">{err}</p>}

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 text-xs">
            {saving ? 'Saving…' : 'Create Player'}
          </button>
          <button onClick={() => router.back()} className="btn-outline text-xs">Cancel</button>
        </div>
      </div>
    </div>
  )
}
