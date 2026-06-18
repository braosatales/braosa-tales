'use client'

export type ViewMode = 'grid' | 'list'

type Props = {
  value: ViewMode
  onChange: (v: ViewMode) => void
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="0.5" />
      <rect x="8" y="1" width="5" height="5" rx="0.5" />
      <rect x="1" y="8" width="5" height="5" rx="0.5" />
      <rect x="8" y="8" width="5" height="5" rx="0.5" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <path d="M1 3.5h12M1 7h12M1 10.5h12" />
    </svg>
  )
}

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center bg-brand-bg border border-brand-border rounded-sm overflow-hidden">
      {(['grid', 'list'] as const).map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          title={v === 'grid' ? 'Grid view' : 'List view'}
          aria-label={v === 'grid' ? 'Grid view' : 'List view'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-cinzel tracking-widest uppercase transition-colors ${
            value === v
              ? 'bg-brand-purple-600 text-brand-parchment'
              : 'text-brand-muted hover:text-brand-parchment'
          }`}
        >
          {v === 'grid' ? <GridIcon /> : <ListIcon />}
          <span className="hidden sm:inline">{v}</span>
        </button>
      ))}
    </div>
  )
}
