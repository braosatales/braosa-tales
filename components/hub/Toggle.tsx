'use client'

type Props = {
  checked: boolean
  onChange: (v: boolean) => void
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  label?: string
}

export default function Toggle({ checked, onChange, onClick, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => { onClick?.(e); onChange(!checked) }}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ${
        checked ? 'border-leaf bg-leaf' : 'border-plum-line bg-plum-line'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-vellum shadow transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
