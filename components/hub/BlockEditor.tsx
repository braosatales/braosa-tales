'use client'

import type { RevealBlock } from '@/lib/hub/types'
import MentionTextarea from '@/components/hub/MentionTextarea'
import { IconEye } from '@/components/hub/RevealIcons'

export type EditBlock = { key: string; id?: string; body: string; is_revealed: boolean }

let seq = 0
const newKey = () => `new-${Date.now()}-${seq++}`

export const toEditBlocks = (blocks: RevealBlock[] | undefined): EditBlock[] =>
  (blocks ?? []).map((b) => ({ key: b.id, id: b.id, body: b.body, is_revealed: b.is_revealed }))

/** What the API expects: ordered, empty blocks dropped. */
export const toBlockPayload = (blocks: EditBlock[]) =>
  blocks.filter((b) => b.body.trim()).map((b) => ({ id: b.id, body: b.body.trim(), is_revealed: b.is_revealed }))

type Props = {
  value: EditBlock[]
  onChange: (blocks: EditBlock[]) => void
  inputCls: string
  /** Is the whole entry visible to players? Changes the hint, not the blocks. */
  entryVisible: boolean
}

/**
 * Edit an entry as a list of blocks. Each block is revealed to players separately,
 * so write them in the order the party is likely to learn them.
 */
export default function BlockEditor({ value, onChange, inputCls, entryVisible }: Props) {
  const set = (key: string, patch: Partial<EditBlock>) => onChange(value.map((b) => (b.key === key ? { ...b, ...patch } : b)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = () => onChange([...value, { key: newKey(), body: '', is_revealed: false }])
  const remove = (key: string) => onChange(value.filter((b) => b.key !== key))

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <label className="section-label block">What players can learn</label>
        <span className="text-[0.75rem] text-mist">{value.filter((b) => b.is_revealed).length} of {value.length} revealed</span>
      </div>
      <p className="mb-3 text-[0.8rem] leading-relaxed text-mist">
        Break the entry into blocks, in the order the party is likely to find things out. Players see the title once the entry is visible, then only the blocks you reveal.
        {!entryVisible && ' This entry is hidden right now, so players see none of it yet.'}
      </p>
      <ol className="space-y-3">
        {value.map((b, i) => (
          <li key={b.key} className={`rounded-xl p-3 ${b.is_revealed ? 'border border-leaf/30 bg-leaf/5' : 'border border-dashed border-plum-line bg-night/40'}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[0.75rem] tabular-nums text-mist">{i + 1}</span>
              <button
                type="button"
                onClick={() => set(b.key, { is_revealed: !b.is_revealed })}
                className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.75rem] transition-colors ${
                  b.is_revealed ? 'border-leaf/40 bg-leaf/10 text-leaf-soft' : 'border-plum-line text-mist hover:text-vellum'
                }`}
                aria-pressed={b.is_revealed}
              >
                <IconEye off={!b.is_revealed} size={12} />
                {b.is_revealed ? 'Revealed' : 'Hidden'}
              </button>
              <span className="flex-1" />
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-mist hover:text-vellum disabled:opacity-30" aria-label="Move up">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="px-1.5 text-mist hover:text-vellum disabled:opacity-30" aria-label="Move down">↓</button>
              <button type="button" onClick={() => remove(b.key)} className="px-1.5 text-mist hover:text-red-400" aria-label="Delete block">✕</button>
            </div>
            <MentionTextarea
              value={b.body}
              onChange={(v) => set(b.key, { body: v })}
              rows={3}
              placeholder={i === 0 ? 'What the party knows on first meeting… type @ to link articles' : 'The next thing they might learn…'}
              className={`${inputCls} resize-y`}
            />
          </li>
        ))}
      </ol>
      <button type="button" onClick={add} className="btn-outline mt-3 text-xs">+ Add block</button>
    </div>
  )
}
