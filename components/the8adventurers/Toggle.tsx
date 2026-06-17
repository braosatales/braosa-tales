'use client'

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export default function Toggle({ checked, onChange, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => { onClick?.(e); onChange(!checked) }}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 transition-colors duration-200 cursor-pointer ${
        checked ? 'bg-brand-gold-400 border-brand-gold-400' : 'bg-brand-border border-brand-border'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-brand-parchment shadow transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
