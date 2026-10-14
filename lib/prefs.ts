// Reader preferences. Text size is applied server-side from a cookie so pages never flash.

export const TEXT_SIZES = [
  { value: 'sm', label: 'Smaller', px: 18 },
  { value: 'md', label: 'Default', px: 20 },
  { value: 'lg', label: 'Larger', px: 22 },
  { value: 'xl', label: 'Largest', px: 24 },
] as const

export type TextSize = (typeof TEXT_SIZES)[number]['value']
export const TEXT_SIZE_COOKIE = 'bt_text_size'
export const isTextSize = (v: unknown): v is TextSize => TEXT_SIZES.some((t) => t.value === v)
